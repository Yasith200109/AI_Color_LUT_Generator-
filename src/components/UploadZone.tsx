"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Image as ImageIcon, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onImageSelected: (file: File) => void;
  isProcessing?: boolean;
}

export default function UploadZone({ onImageSelected, isProcessing = false }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, []);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    onImageSelected(file);
  }, [onImageSelected]);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith("image/")) {
          handleFile(file);
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handleFile]);

  const clearImage = () => {
    setPreview(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              "relative group w-full h-[300px] rounded-2xl border-2 border-dashed transition-all duration-300 ease-out flex flex-col items-center justify-center cursor-pointer overflow-hidden",
              isDragging 
                ? "border-teal-400 bg-teal-400/5 neon-border-teal" 
                : "border-slate-700 bg-slate-800/20 hover:border-teal-500/50 hover:bg-slate-800/40"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              accept="image/*" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              onChange={handleChange}
            />
            <div className="flex flex-col items-center justify-center text-center p-6 pointer-events-none z-0">
              <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <UploadCloud className="w-8 h-8 text-teal-400" />
              </div>
              <h3 className="text-xl font-medium text-slate-200 mb-2">Drag & Drop or Paste LOG Frame</h3>
              <p className="text-sm text-slate-400">or click to browse your files (Ctrl+V to paste)</p>
              <p className="text-xs text-slate-500 mt-4">Supports PNG, JPG, JPEG (Max 10MB)</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full rounded-2xl overflow-hidden glassmorphism-card group"
          >
            <div className="relative aspect-video w-full bg-black/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={preview} 
                alt="Uploaded LOG frame" 
                className={cn(
                  "w-full h-full object-cover transition-opacity duration-500",
                  isProcessing ? "opacity-50 blur-sm" : "opacity-100"
                )}
              />
              
              {/* Processing Overlay */}
              <AnimatePresence>
                {isProcessing && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]"
                  >
                    <div className="relative w-full h-full overflow-hidden">
                       <motion.div
                          animate={{ top: ["-10%", "110%"] }}
                          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                          className="absolute left-0 right-0 h-[2px] bg-teal-400 shadow-[0_0_20px_5px_rgba(0,240,255,0.5)] z-20"
                       />
                    </div>
                    <div className="absolute z-30 flex flex-col items-center">
                      <Sparkles className="w-8 h-8 text-teal-400 animate-pulse mb-4" />
                      <h3 className="text-xl font-bold text-white neon-text-teal">AI is Analyzing Footage...</h3>
                      <p className="text-sm text-slate-300 mt-2">Extracting color matrix & lighting data</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!isProcessing && (
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={clearImage}
                  className="p-2 rounded-full bg-black/60 hover:bg-red-500/80 text-white backdrop-blur-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
