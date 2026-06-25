"use client";

import { motion } from "framer-motion";
import { Video, Flame } from "lucide-react";

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, filter: "blur(10px)", scale: 0.95 },
    show: { 
      opacity: 1, 
      y: 0, 
      filter: "blur(0px)",
      scale: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    },
  };

  return (
    <section className="relative w-full py-24 flex flex-col items-center justify-center text-center overflow-hidden">
      {/* Super modern floating background glows */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-500/30 blur-[120px] rounded-full pointer-events-none" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
          rotate: [0, 90, 0]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-[30%] -translate-y-[70%] w-[600px] h-[600px] bg-orange-600/30 blur-[120px] rounded-full pointer-events-none" 
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="z-10 flex flex-col items-center"
      >
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-900/80 backdrop-blur-xl mb-8 border border-slate-700 hover:border-teal-500/50 transition-colors shadow-[0_0_30px_-5px_rgba(20,184,166,0.15)]">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-orange-400 uppercase tracking-[0.2em]">
            Next-Gen Color Science
          </span>
        </motion.div>

        <motion.h1 variants={itemVariants} className="text-5xl md:text-8xl font-black tracking-tighter mb-6 max-w-5xl leading-[1.05]">
          Cinematic Color Grading, <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-orange-500 drop-shadow-lg">
            Powered by AI.
          </span>
        </motion.h1>

        <motion.p variants={itemVariants} className="text-lg md:text-2xl text-slate-400 max-w-3xl mb-14 font-medium leading-relaxed">
          Upload your LOG footage or a style reference. Our AI analyzes lighting, mood, and palettes to generate perfect 3D LUTs instantly.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-wrap justify-center items-center gap-4 md:gap-8 text-xs md:text-sm font-bold text-slate-500 tracking-widest uppercase">
          <div className="flex items-center gap-2 hover:text-teal-400 transition-colors cursor-default">
            <Video className="w-5 h-5" />
            <span>S-Log3</span>
          </div>
          <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-slate-700" />
          <div className="flex items-center gap-2 hover:text-orange-400 transition-colors cursor-default">
            <Video className="w-5 h-5" />
            <span>C-Log</span>
          </div>
          <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-slate-700" />
          <div className="flex items-center gap-2 hover:text-teal-400 transition-colors cursor-default">
            <Video className="w-5 h-5" />
            <span>Arri LogC</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
