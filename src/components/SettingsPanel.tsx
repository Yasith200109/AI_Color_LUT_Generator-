"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Camera, SlidersHorizontal, Sparkles, ImagePlus, Type, X } from "lucide-react";

export const CAMERA_PROFILES = [
  "S-Log2",
  "S-Log3",
  "C-Log",
  "C-Log2",
  "C-Log3",
  "D-Log",
  "V-Log",
  "F-Log",
  "N-Log",
  "RED LogFilm",
  "Arri LogC",
] as const;

export type CameraProfile = typeof CAMERA_PROFILES[number];

interface SettingsPanelProps {
  selectedProfile: CameraProfile;
  onProfileChange: (profile: CameraProfile) => void;
  stylePrompt: string;
  onStylePromptChange: (prompt: string) => void;
  referencePreview: string | null;
  onReferenceSelected: (file: File) => void;
  onReferenceClear: () => void;
  onGenerateClick: () => void;
  isProcessing: boolean;
  hasImage: boolean;
}

export default function SettingsPanel({
  selectedProfile,
  onProfileChange,
  stylePrompt,
  onStylePromptChange,
  referencePreview,
  onReferenceSelected,
  onReferenceClear,
  onGenerateClick,
  isProcessing,
  hasImage
}: SettingsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith("image/")) {
        onReferenceSelected(file);
      } else {
        alert("Please select an image file.");
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="w-full max-w-4xl mx-auto mt-8 glassmorphism-card rounded-2xl p-6 md:p-8 flex flex-col gap-8"
    >
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Column: Settings & Prompt */}
        <div className="flex-1 flex flex-col gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
              <Camera className="w-4 h-4 text-teal-400" />
              Camera LOG Profile
            </label>
            <div className="relative">
              <select
                value={selectedProfile}
                onChange={(e) => onProfileChange(e.target.value as CameraProfile)}
                disabled={isProcessing}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 disabled:opacity-50 transition-colors"
              >
                {CAMERA_PROFILES.map((profile) => (
                  <option key={profile} value={profile} className="bg-slate-900 text-white">
                    {profile}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
              <Type className="w-4 h-4 text-teal-400" />
              Style Request (Optional)
            </label>
            <textarea
              value={stylePrompt}
              onChange={(e) => onStylePromptChange(e.target.value)}
              disabled={isProcessing}
              placeholder="e.g. Make it look like The Matrix, very green and moody..."
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 disabled:opacity-50 transition-colors resize-none h-28"
            />
          </div>
        </div>

        {/* Right Column: Reference Image Upload */}
        <div className="flex-1 flex flex-col">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
            <ImagePlus className="w-4 h-4 text-teal-400" />
            Style Reference Image (Optional)
          </label>
          <div className="flex-1 min-h-[160px] relative rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/50 hover:border-teal-500/50 transition-colors overflow-hidden group">
            <input 
              type="file" 
              ref={fileInputRef}
              accept="image/*" 
              onChange={handleFileChange}
              disabled={isProcessing}
              className="hidden" 
            />
            
            {referencePreview ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={referencePreview} alt="Reference" className="w-full h-full object-cover" />
                {!isProcessing && (
                  <button 
                    onClick={onReferenceClear}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-red-500/80 text-white backdrop-blur-md transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </>
            ) : (
              <div 
                onClick={() => !isProcessing && fileInputRef.current?.click()}
                className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center cursor-pointer cursor-not-allowed disabled:opacity-50"
              >
                <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <ImagePlus className="w-6 h-6 text-slate-400 group-hover:text-teal-400 transition-colors" />
                </div>
                <p className="text-sm text-slate-400">Click to upload a reference image</p>
              </div>
            )}
          </div>
        </div>

      </div>

      <div className="flex justify-end pt-6 border-t border-slate-800/50">
        <button
          onClick={onGenerateClick}
          disabled={!hasImage || isProcessing}
          className="w-full md:w-auto relative group overflow-hidden rounded-xl bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-500 opacity-80 group-hover:opacity-100 transition-opacity bg-[length:200%_100%] animate-gradient-x" />
          
          <div className="relative px-8 py-3 flex items-center justify-center gap-2 text-white font-medium">
            {isProcessing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating LUTs...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Custom LUTs
              </>
            )}
          </div>
        </button>
      </div>
    </motion.div>
  );
}
