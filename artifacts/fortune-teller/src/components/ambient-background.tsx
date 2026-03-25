import React from 'react';
import { motion } from 'framer-motion';

export function AmbientBackground() {
  const bgUrl = `${import.meta.env.BASE_URL}images/mystic-bg.png`;

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#0d0414]">
      {/* Generated Base Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-screen"
        style={{ backgroundImage: `url(${bgUrl})` }}
      />
      
      {/* Animated glowing orbs for atmosphere */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
          x: [0, 50, 0],
          y: [0, -30, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary/20 blur-[120px]"
      />
      
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.15, 0.25, 0.15],
          x: [0, -40, 0],
          y: [0, 40, 0]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-[40%] -right-[20%] w-[70%] h-[70%] rounded-full bg-secondary/30 blur-[150px]"
      />

      <motion.div 
        animate={{ 
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 left-[20%] w-[50%] h-[40%] rounded-full bg-accent/20 blur-[100px]"
      />

      {/* Vignette overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(10,3,15,0.8)_100%)]" />
    </div>
  );
}
