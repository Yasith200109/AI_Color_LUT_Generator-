"use client";

import { motion } from "framer-motion";

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#030712]">
      {/* Perspective Animated Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#14b8a610_1px,transparent_1px),linear-gradient(to_bottom,#14b8a610_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      {/* Sweeping Neon Beams */}
      <motion.div
        animate={{
          x: ["-100vw", "100vw"],
          opacity: [0, 1, 0]
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
        className="absolute top-[30%] w-[40vw] h-[1px] bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_15px_3px_rgba(20,184,166,0.5)]"
      />
      <motion.div
        animate={{
          y: ["-100vh", "100vh"],
          opacity: [0, 1, 0]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear", delay: 1 }}
        className="absolute left-[70%] w-[1px] h-[40vh] bg-gradient-to-b from-transparent via-orange-500 to-transparent shadow-[0_0_15px_3px_rgba(249,115,22,0.5)]"
      />
      <motion.div
        animate={{
          x: ["100vw", "-100vw"],
          opacity: [0, 0.8, 0]
        }}
        transition={{ duration: 9, repeat: Infinity, ease: "linear", delay: 3 }}
        className="absolute bottom-[20%] w-[30vw] h-[1px] bg-gradient-to-r from-transparent via-teal-300 to-transparent shadow-[0_0_15px_3px_rgba(20,184,166,0.4)]"
      />
      
      {/* Central Pulsing Ambient Core */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.25, 0.1],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-teal-500/20 blur-[120px]"
      />

      {/* Slow Rotating Conic Gradients for Ambient Edge Light */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[50%] -left-[10%] w-[150vw] h-[150vw] rounded-full bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,rgba(20,184,166,0.06)_25%,transparent_50%)] blur-[100px]"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-[50%] -right-[10%] w-[150vw] h-[150vw] rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,transparent_0%,rgba(249,115,22,0.05)_25%,transparent_50%)] blur-[100px]"
      />
    </div>
  );
}
