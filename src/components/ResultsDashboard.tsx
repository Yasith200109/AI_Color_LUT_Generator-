"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, CheckCircle2 } from "lucide-react";
import { ColorGradeParameters } from "@/lib/lut-generator";

interface ResultsDashboardProps {
  originalImage: string | null;
  grades: ColorGradeParameters[];
  sceneDescription?: string | null;
}

export default function ResultsDashboard({ originalImage, grades, sceneDescription }: ResultsDashboardProps) {
  const [downloading, setDownloading] = useState<string | null>(null);

  if (!originalImage || grades.length === 0) return null;

  const handleDownload = async (grade: ColorGradeParameters) => {
    try {
      setDownloading(grade.name);
      
      const response = await fetch('/api/download-lut', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(grade),
      });

      if (!response.ok) throw new Error("Failed to generate LUT");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${grade.name.replace(/[^a-zA-Z0-9]/g, '_')}.cube`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error(error);
      alert("Failed to download LUT.");
    } finally {
      setDownloading(null);
    }
  };

  const getFilterStyle = (grade: ColorGradeParameters) => {
    if (grade.cssFilter) {
      return { filter: grade.cssFilter };
    }
    // Fallback if AI didn't provide one
    return {
      filter: `contrast(${grade.contrast}) saturate(${grade.saturation})`
    };
  };

  return (
    <motion.div layout className="w-full max-w-6xl mx-auto mt-16 pb-12">
      <motion.div
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col mb-10"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center border border-teal-500/50">
            <CheckCircle2 className="w-5 h-5 text-teal-400" />
          </div>
          <h2 className="text-3xl font-bold text-white">AI Grading Results</h2>
        </div>
        
        {sceneDescription && (
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 border-l-4 border-l-teal-500">
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-teal-400 font-semibold mr-2">Scene Analysis:</strong>
              {sceneDescription}
            </p>
          </div>
        )}
      </motion.div>

      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {grades.map((grade, index) => (
          <motion.div
            key={grade.name}
            layout
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="glassmorphism-card rounded-2xl overflow-hidden group flex flex-col shadow-[0_0_0_0_rgba(20,184,166,0)] hover:shadow-[0_20px_40px_-15px_rgba(20,184,166,0.25)] hover:border-teal-500/40 transition-all duration-500"
          >
            <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
              {/* Split Screen Before / After Approximation */}
              <div className="absolute inset-0 w-full h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={originalImage} 
                  alt="Original" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div 
                className="absolute inset-y-0 right-0 w-1/2 overflow-hidden border-l border-white/20 transition-all duration-500 group-hover:w-full group-hover:border-transparent"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={originalImage} 
                  alt="Graded Preview" 
                  className="absolute inset-0 w-[200%] max-w-none h-full object-cover -translate-x-1/2 group-hover:translate-x-0 group-hover:w-full"
                  style={getFilterStyle(grade)}
                />
              </div>
              
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-xs font-medium text-slate-300 pointer-events-none">
                LOG
              </div>
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 backdrop-blur-md text-xs font-medium pointer-events-none transition-opacity duration-300 opacity-100">
                GRADED
              </div>
            </div>

            <div className="p-6 flex items-center justify-between bg-slate-900/40">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">{grade.name}</h3>
                <p className="text-sm text-slate-400">Contrast: {grade.contrast.toFixed(2)} | Sat: {grade.saturation.toFixed(2)}</p>
              </div>
              <button
                onClick={() => handleDownload(grade)}
                disabled={downloading === grade.name}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold transition-colors disabled:opacity-50"
              >
                {downloading === grade.name ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <Download className="w-5 h-5" />
                )}
                .CUBE
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
