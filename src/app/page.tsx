"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Loader2, X } from "lucide-react";
import Hero from "@/components/Hero";
import UploadZone from "@/components/UploadZone";
import SettingsPanel, { CameraProfile } from "@/components/SettingsPanel";
import ResultsDashboard from "@/components/ResultsDashboard";
import AnimatedBackground from "@/components/AnimatedBackground";
import { ColorGradeParameters } from "@/lib/lut-generator";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [profile, setProfile] = useState<CameraProfile>("S-Log3");
  const [isProcessing, setIsProcessing] = useState(false);
  const [grades, setGrades] = useState<ColorGradeParameters[]>([]);
  const [sceneDesc, setSceneDesc] = useState<string | null>(null);
  const [stylePrompt, setStylePrompt] = useState("");
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [referencePreview, setReferencePreview] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<{message: string, isRetrying?: boolean} | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearError = () => {
    setErrorToast(null);
    if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
  };

  const handleImageSelected = (selectedFile: File) => {
    setFile(selectedFile);
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
    setGrades([]); // clear previous results
    setSceneDesc(null);
    clearError();
  };

  const handleReferenceSelected = (file: File) => {
    setReferenceFile(file);
    setReferencePreview(URL.createObjectURL(file));
  };

  const handleReferenceClear = () => {
    setReferenceFile(null);
    setReferencePreview(null);
  };

  const handleGenerate = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setGrades([]);
    setSceneDesc(null);
    
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = async () => {
        try {
          const base64Image = reader.result as string;
          
          let referenceBase64 = null;
          if (referenceFile) {
            const refReader = new FileReader();
            referenceBase64 = await new Promise<string>((resolve, reject) => {
              refReader.onload = () => resolve(refReader.result as string);
              refReader.onerror = reject;
              refReader.readAsDataURL(referenceFile);
            }).catch(() => null);
          }
          
          const response = await fetch('/api/analyze-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64Image,
              profile: profile,
              stylePrompt: stylePrompt.trim() || undefined,
              referenceImageBase64: referenceBase64 || undefined
            })
          });

          const data = await response.json().catch(() => ({}));
          
          if (!response.ok) {
            throw new Error(data.error || 'Failed to analyze image');
          }

          if (data.grades && data.sceneDescription) {
            setGrades(data.grades);
            setSceneDesc(data.sceneDescription);
          } else if (data.grades) {
            setGrades(data.grades);
          } else {
            setErrorToast({ message: 'Failed to generate grades. Please try again.' });
          }
        } catch (err: any) {
          console.error(err);
          const errMsg = err.message || "";
          if (errMsg.includes("503") || errMsg.includes("High demand") || errMsg.includes("Service Unavailable")) {
            setErrorToast({ message: "AI Servers are currently busy. Retrying in 3 seconds...", isRetrying: true });
            retryTimeoutRef.current = setTimeout(() => {
              clearError();
              handleGenerate();
            }, 3000);
          } else {
            setErrorToast({ message: `API Error: ${errMsg}` });
          }
        } finally {
          setIsProcessing(false);
        }
      };
      
      reader.onerror = () => {
        setErrorToast({ message: "Failed to read file." });
        setIsProcessing(false);
      };

    } catch (error) {
      console.error(error);
      setErrorToast({ message: "Error processing image." });
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen relative selection:bg-teal-500/30">
      <AnimatedBackground />

      <div className="relative z-10 container mx-auto px-4 pb-24">
        <Hero />
        
        <div className="flex flex-col items-center">
          <UploadZone 
            onImageSelected={handleImageSelected} 
            isProcessing={isProcessing}
          />
          
          <SettingsPanel 
            selectedProfile={profile}
            onProfileChange={setProfile}
            stylePrompt={stylePrompt}
            onStylePromptChange={setStylePrompt}
            referencePreview={referencePreview}
            onReferenceSelected={handleReferenceSelected}
            onReferenceClear={handleReferenceClear}
            onGenerateClick={handleGenerate}
            isProcessing={isProcessing}
            hasImage={!!file}
          />
        </div>

        {grades.length > 0 && preview && (
          <ResultsDashboard originalImage={preview} grades={grades} sceneDescription={sceneDesc} />
        )}
      </div>

      {/* Ultra-Modern Glowing Error Toast */}
      <AnimatePresence>
        {errorToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-4 bg-slate-900/90 backdrop-blur-xl border border-red-500/50 rounded-2xl shadow-[0_0_30px_-5px_rgba(239,68,68,0.4)]"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/20 text-red-400">
              {errorToast.isRetrying ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <div className="flex flex-col">
              <h4 className="text-red-400 font-semibold text-sm">Action Failed</h4>
              <p className="text-slate-200 text-sm">{errorToast.message}</p>
            </div>
            <button 
              onClick={clearError}
              className="ml-4 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
