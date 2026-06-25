import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Define the expected output structure from the AI
const systemPrompt = `
You are an expert Hollywood Colorist and Cinematographer. Analyze the provided camera LOG footage frame.
First, identify the visual context and mood of the scene (e.g., "Neon-lit Night City", "Golden Hour Forest", "Overcast Beach").
Second, generate exactly 6 distinct, highly stylized, and premium cinematic color grading options that perfectly complement this specific scene.
Do not generate generic grades; make them creative and tailored to the lighting and environment you analyzed.

Since this is flat LOG footage, you MUST apply strong contrast and saturation to properly normalize and stylize it. Do not be subtle; create bold looks.

For each of the 6 styles, return:
- name: A creative, descriptive name for the grade (e.g., "Cyberpunk Azure", "Warm Nostalgia").
- lift: [R, G, B] array for shadow adjustments (Range: -0.3 to 0.2). Use this to add color tints or deepen shadows.
- gamma: [R, G, B] array for midtone adjustments (Range: 0.6 to 1.4). Use this to shift the overall color balance.
- gain: [R, G, B] array for highlight adjustments (Range: 0.8 to 1.8).
- contrast: Overall contrast multiplier (Range: 1.1 to 2.0). LOG needs HIGH contrast.
- saturation: Overall saturation multiplier (Range: 1.1 to 2.5). LOG needs HIGH saturation.
- cssFilter: A CSS filter string that visually approximates your color grade for the web UI (e.g., "contrast(1.5) saturate(1.6) sepia(0.2) hue-rotate(-10deg) brightness(0.9)"). Be highly specific so the preview matches the heavy grade.

Return ONLY a valid JSON object matching this schema:
{
  "sceneDescription": "string (1-2 sentences describing the scene and lighting)",
  "grades": [
    {
      "name": "string",
      "lift": [number, number, number],
      "gamma": [number, number, number],
      "gain": [number, number, number],
      "contrast": number,
      "saturation": number,
      "cssFilter": "string"
    }
  ]
}
`;

export async function POST(request: Request) {
  try {
    const { imageBase64, profile, stylePrompt, referenceImageBase64 } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Process the base64 string
    // Usually it looks like "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    const match = imageBase64.match(/^data:(image\/[^;]+);base64,(.+)$/);
    if (!match) {
      console.error("Failed to parse base64. Snippet:", imageBase64.substring(0, 50));
      return NextResponse.json({ error: 'Invalid image format' }, { status: 400 });
    }
    
    const mimeType = match[1];
    const data = match[2];

    // Initialize Gemini API
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing in environment variables.");
    }
    
    // Fetch available models dynamically
    const modelsResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!modelsResponse.ok) {
      throw new Error(`Failed to fetch available models. Status: ${modelsResponse.status}`);
    }
    
    const modelsData = await modelsResponse.json();
    let selectedModelName = "gemini-1.5-flash"; // Default fallback
    
    if (modelsData.models && Array.isArray(modelsData.models)) {
      // Filter models that support generateContent and have 'gemini' in the name
      const validModels = modelsData.models.filter((m: any) => 
        m.supportedGenerationMethods?.includes("generateContent") && 
        m.name.includes("gemini")
      );
      
      if (validModels.length > 0) {
        // Prefer a "flash" model for free tier compatibility
        const flashModel = validModels.find((m: any) => m.name.includes("flash"));
        const bestModel = flashModel || validModels[0];
        
        // Google API returns names like "models/gemini-flash", so we remove "models/" prefix
        selectedModelName = bestModel.name.replace("models/", "");
        console.log(`Auto-selected model: ${selectedModelName}`);
      } else {
        throw new Error("No compatible Gemini models found for this API Key.");
      }
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    const model = genAI.getGenerativeModel({ 
      model: selectedModelName,
      systemInstruction: systemPrompt 
    });

    let prompt = `Analyze this ${profile} footage and generate the 6 requested color grades in JSON format.`;
    
    if (stylePrompt) {
      prompt += `\n\nCLIENT STYLE REQUEST: "${stylePrompt}"\nYou MUST prioritize this request. Ensure your generated grades heavily incorporate this specific style direction.`;
    }
    
    if (referenceImageBase64) {
      prompt += `\n\nSTYLE REFERENCE IMAGE PROVIDED: I have attached a second image as a style reference. You MUST analyze the color palette, contrast, and mood of the STYLE REFERENCE image and generate color grades that perfectly replicate its look on the main LOG footage.`;
    }

    const parts: any[] = [prompt, {
      inlineData: {
        data,
        mimeType
      }
    }];

    if (referenceImageBase64) {
      const refMatch = referenceImageBase64.match(/^data:(image\/[^;]+);base64,(.+)$/);
      if (refMatch) {
        parts.push({
          inlineData: {
            data: refMatch[2],
            mimeType: refMatch[1]
          }
        });
      }
    }

    const result = await model.generateContent(parts);
    const responseText = result.response.text();
    
    // Clean up potential markdown formatting in Gemini's response (e.g. ```json ... ```)
    const jsonString = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(jsonString);
    
    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal Server Error',
      details: error.stack || String(error)
    }, { status: 500 });
  }
}
