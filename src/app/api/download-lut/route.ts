import { NextResponse } from 'next/server';
import { generateCubeLUT, ColorGradeParameters } from '@/lib/lut-generator';

export async function POST(request: Request) {
  try {
    const params: ColorGradeParameters = await request.json();

    if (!params || !params.name) {
      return new NextResponse('Invalid parameters', { status: 400 });
    }

    const cubeContent = generateCubeLUT(params);
    
    // Format filename (e.g., "Cinematic_Teal_and_Orange.cube")
    const filename = params.name.replace(/[^a-zA-Z0-9]/g, '_') + '.cube';

    const response = new NextResponse(cubeContent);
    response.headers.set('Content-Type', 'text/plain');
    response.headers.set('Content-Disposition', `attachment; filename="${filename}"`);

    return response;
  } catch (error) {
    console.error('Error generating LUT:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
