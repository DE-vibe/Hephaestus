import React, { useEffect } from 'react';
import { motion } from 'motion/react';

interface SplashPageProps {
  onComplete: () => void;
  key?: string;
}

export default function SplashPage({ onComplete }: SplashPageProps) {
  // Automatically progress to the landing page after 4.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 4500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  // Splitting Greek name for staggered animation
  const greekLetters = "Η Φ Α Ι Σ Τ Ο Σ".split(" ");
  // Splitting English subtitle
  const englishSubtitle = "HEPHAESTUS".split("");

  return (
    <div 
      onClick={onComplete}
      className="fixed inset-0 bg-[#050507] text-gray-100 flex flex-col items-center justify-center select-none overflow-hidden p-6 cursor-pointer"
      title="Click anywhere to skip introduction"
    >
      {/* Immersive radial ambient light - breathes in gold/orange */}
      <motion.div 
        animate={{ 
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute w-[500px] h-[500px] bg-[#e25c24]/5 rounded-full blur-[140px] pointer-events-none" 
      />

      {/* Classical Greek Meander border at the top and bottom */}
      <motion.div 
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 0.15, scaleX: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute top-0 left-0 right-0 h-4 bg-repeat-x bg-[size:16px_8px] bg-[image:url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%228%22 viewBox=%220 0 16 8%22%3E%3Cpath d=%22M0 1h6v5h-4v-3h2v1h-1v1h2v-2h-3v4h5V0H0z%22 fill=%22%23e25c24%22/%3E%3C/svg%3E')]" 
      />
      <motion.div 
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 0.15, scaleX: 1 }}
        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
        className="absolute bottom-0 left-0 right-0 h-4 bg-repeat-x bg-[size:16px_8px] bg-[image:url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%228%22 viewBox=%220 0 16 8%22%3E%3Cpath d=%22M0 1h6v5h-4v-3h2v1h-1v1h2v-2h-3v4h5V0H0z%22 fill=%22%23e25c24%22/%3E%3C/svg%3E')]" 
      />

      {/* Main cinematic text container */}
      <div className="flex flex-col items-center justify-center space-y-8 z-10 max-w-4xl">
        
        {/* English Title Stagger: HEPHAESTUS (Now bigger and on top) */}
        <div className="flex items-center justify-center space-x-2 sm:space-x-4 md:space-x-6">
          {englishSubtitle.map((char, index) => (
            <motion.span
              key={`eng-${index}`}
              initial={{ 
                opacity: 0, 
                y: -15, 
                scale: 0.8,
                filter: "blur(8px)" 
              }}
              animate={{ 
                opacity: [0, 1, 1],
                y: 0, 
                scale: [0.8, 1.15, 1],
                filter: "blur(0px)",
                textShadow: [
                  "0 0 0px rgba(255,255,255,0)",
                  "0 0 20px rgba(255,255,255,0.4)",
                  "0 0 2px rgba(255,255,255,0.1)"
                ]
              }}
              transition={{ 
                duration: 1.4,
                delay: index * 0.1,
                ease: "easeOut"
              }}
              className="text-4xl sm:text-6xl md:text-8xl font-extrabold font-serif text-white select-none tracking-normal"
            >
              {char}
            </motion.span>
          ))}
        </div>

        {/* Decorative thin gold divider line */}
        <motion.div 
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 140, opacity: 0.6 }}
          transition={{ delay: 1.1, duration: 1.2, ease: "easeInOut" }}
          className="h-[1px] bg-gradient-to-r from-transparent via-[#8c7355] to-transparent"
        />

        {/* Greek Font Name: Η Φ Α Ι Σ Τ Ο Σ (Now smaller, under the English) */}
        <div className="flex items-center justify-center space-x-3 sm:space-x-5">
          {greekLetters.map((char, index) => (
            <motion.span
              key={`greek-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.9, y: 0 }}
              transition={{ 
                duration: 1.2,
                delay: 1.2 + (index * 0.08),
                ease: "easeOut"
              }}
              className="text-lg sm:text-xl md:text-2xl font-serif text-[#e25c24] uppercase tracking-[0.2em]"
            >
              {char}
            </motion.span>
          ))}
        </div>

        {/* Small subtitle details */}
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 0.4, y: 0 }}
          transition={{ delay: 2.3, duration: 1 }}
          className="text-[9px] sm:text-[10px] font-mono tracking-[0.3em] uppercase text-zinc-400 text-center"
        >
          THE ARTISAN'S DIGITAL MEDIA SUITE
        </motion.p>

      </div>

      {/* Skip/Enter hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.25 }}
        transition={{ delay: 3, duration: 0.8 }}
        className="absolute bottom-12 text-[10px] font-mono tracking-widest text-zinc-500 uppercase cursor-pointer hover:text-[#e25c24] hover:opacity-80 transition-colors"
      >
        Click anywhere to enter the forge immediately
      </motion.div>
    </div>
  );
}
