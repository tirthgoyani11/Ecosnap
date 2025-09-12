import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface ScanningOverlayProps {
  isVisible: boolean;
  progress?: number;
}

export function ScanningOverlay({ isVisible, progress = 0 }: ScanningOverlayProps) {
  const [scanLines, setScanLines] = useState<number[]>([]);

  useEffect(() => {
    if (isVisible) {
      setScanLines([1, 2, 3, 4, 5]);
    } else {
      setScanLines([]);
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 pointer-events-none"
        >
          {/* Scanning Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1)_1px,transparent_1px)] [background-size:20px_20px] animate-pulse" />
          
          {/* Scanning Lines */}
          {scanLines.map((line, index) => (
            <motion.div
              key={line}
              className="absolute h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
              style={{
                top: `${20 + index * 15}%`,
                left: 0,
                right: 0,
              }}
              animate={{
                scaleX: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                delay: index * 0.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
          
          {/* Corner Brackets */}
          <motion.div
            className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-primary"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.25 }}
          />
          <motion.div
            className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-primary"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
          />
          <motion.div
            className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.75 }}
          />
          
          {/* Progress Indicator */}
          {progress > 0 && (
            <motion.div
              className="absolute bottom-2 left-2 right-2 h-1 bg-black/20 rounded-full overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-secondary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}