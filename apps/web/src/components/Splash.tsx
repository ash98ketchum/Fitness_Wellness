import { motion, AnimatePresence } from 'framer-motion';
import { Activity } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Splash({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 800); // Wait for exit animation
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 rounded-xl bg-white text-black flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.3)]">
              <Activity size={32} />
            </div>
            <h1 className="text-2xl font-bold tracking-widest text-white uppercase">LuminaFit</h1>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
