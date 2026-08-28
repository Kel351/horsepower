'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function SplashScreen({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide the animation after 2.5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 px-4 text-center"
        >
          {/* Logo Animation */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex flex-col items-center gap-4"
          >
            {/* Free-standing Logo with no circular background or borders */}
            <div className="flex-shrink-0">
              <img 
                src="/hspwr1.png" 
                alt="HORSEPOWER GLOBAL Logo" 
                className="w-80 h-auto max-h-90 object-contain" 
              />
            </div>

            {/* Subtitle / Tagline Animation */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <p className="text-sm sm:text-base text-slate-400 font-medium">
                Welcome to our community
              </p>
            </motion.div>
          </motion.div>

          {/* Minimal Loading Bar */}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '120px' }}
            transition={{ duration: 2, ease: 'easeInOut' }}
            className="h-1 bg-indigo-500 rounded-full mt-8"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}