import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const LoadingScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Cinematic slow to fast count to 100
    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 5) + 1; // Random increment
      if (current >= 100) {
        current = 100;
        setProgress(current);
        clearInterval(interval);
        setTimeout(onComplete, 600); // 600ms hold at 100%
      } else {
        setProgress(current);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050a10]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1.2, ease: "easeInOut" } }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.05)_0%,transparent_60%)]"></div>
      
      {/* HUD Elements */}
      <div className="absolute top-8 left-8 text-[10px] text-primary/50 font-mono tracking-[0.3em] uppercase animate-pulse">
        System Initializing...
      </div>
      <div className="absolute bottom-8 right-8 text-[10px] text-white/30 font-mono tracking-[0.3em] uppercase">
        v2.4 Engine
      </div>
      
      <div className="relative z-10 flex flex-col items-center">
        {/* Spinner */}
        <div className="relative w-48 h-48 flex flex-col items-center justify-center mb-8">
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
            <circle 
              cx="50" cy="50" r="46" fill="none" 
              className="stroke-white/5" strokeWidth="2" 
            />
            <circle 
              cx="50" cy="50" r="46" fill="none" 
              className="stroke-primary" strokeWidth="2" 
              strokeDasharray="289" strokeDashoffset={289 - (289 * progress) / 100} 
              style={{ transition: 'stroke-dashoffset 0.1s linear' }}
            />
          </svg>
          <div className="absolute inset-2 border border-secondary/20 rounded-full animate-[spin_4s_linear_infinite_reverse]"></div>
          
          <div className="flex flex-col items-center justify-center">
            <span className="text-white text-5xl font-mono font-light tracking-tighter drop-shadow-[0_0_15px_rgba(0,240,255,0.8)]">
              {progress}
            </span>
            <span className="text-primary/70 text-[10px] tracking-[0.3em] uppercase mt-1">%</span>
          </div>
        </div>
        
        <div className="text-white/60 font-mono text-xs uppercase tracking-[0.4em] mt-4 h-6 relative w-64">
          <AnimatePresence mode="wait">
            {progress === 100 ? (
              <motion.div
                key="established"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex justify-center items-center text-primary drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]"
              >
                Link Established
              </motion.div>
            ) : (
              <motion.div
                key="establishing"
                initial={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex justify-center items-center"
              >
                Establishing Link...
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
