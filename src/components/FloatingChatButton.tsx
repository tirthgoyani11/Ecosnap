import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Sparkles, X } from 'lucide-react';
import InsenAI from './InsenAI';

interface FloatingChatButtonProps {
  productContext?: any;
  userContext?: any;
}

export const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({
  productContext,
  userContext
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{
          // Ensure it's above all other floating elements
          zIndex: 1000
        }}
      >
        <motion.button
          onClick={toggleChat}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative group"
          initial={false}
          animate={{
            backgroundColor: isChatOpen 
              ? 'rgba(239, 68, 68, 0.9)' 
              : 'rgba(34, 197, 94, 0.9)'
          }}
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* Glowing Ring Effect */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: isHovered || isChatOpen
                ? '0 0 20px rgba(34, 197, 94, 0.4), 0 0 40px rgba(34, 197, 94, 0.2)'
                : '0 0 10px rgba(34, 197, 94, 0.2)'
            }}
            transition={{ duration: 0.3 }}
          />

          {/* Button Content */}
          <div className="relative z-10 flex items-center justify-center w-full h-full">
            <AnimatePresence mode="wait">
              {isChatOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-6 h-6 text-white" />
                </motion.div>
              ) : (
                <motion.div
                  key="chat"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  <MessageCircle className="w-6 h-6 text-white" />
                  
                  {/* Animated Sparkle */}
                  <motion.div
                    className="absolute -top-1 -right-1"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Sparkles className="w-3 h-3 text-yellow-300" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Pulse Animation */}
          {!isChatOpen && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-green-400"
              animate={{
                scale: [1, 1.5],
                opacity: [0.5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
          )}
        </motion.button>

        {/* Tooltip */}
        <AnimatePresence>
          {isHovered && !isChatOpen && (
            <motion.div
              initial={{ opacity: 0, x: 10, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.8 }}
              className="absolute right-16 top-1/2 transform -translate-y-1/2"
            >
              <div className="bg-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap">
                Chat with Insen AI 🌱
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-black/80" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Chat Interface */}
      <AnimatePresence>
        {isChatOpen && (
          <InsenAI
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            productContext={productContext}
            userContext={userContext}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingChatButton;