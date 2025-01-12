import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import ErrorBoundary from './ErrorBoundary';

const Envelope = ({ onOpen, isLoading, shouldLeave }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [heartBeat, setHeartBeat] = useState(false);

  const handleMouseEnter = useCallback(() => {
    if (!shouldLeave) {
      setIsHovered(true);
      setHeartBeat(true);
    }
  }, [shouldLeave]);

  const handleMouseLeave = useCallback(() => {
    if (!shouldLeave) {
      setIsHovered(false);
      setHeartBeat(false);
    }
  }, [shouldLeave]);

  const handleClick = useCallback(() => {
    if (!isLoading && !shouldLeave) {
      onOpen();
    }
  }, [isLoading, shouldLeave, onOpen]);

  return (
    <ErrorBoundary>
      <AnimatePresence>
        {!shouldLeave ? (
          <motion.div 
            className="relative w-[80vmin] md:w-[70%] max-w-5xl mx-auto"
            initial={{ y: 0, opacity: 1 }}
            exit={{ y: '100vh', opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="relative aspect-[16/9] cursor-pointer"
                 onMouseEnter={handleMouseEnter}
                 onMouseLeave={handleMouseLeave}>
              {/* 心形装饰 */}
              <motion.div
                className="absolute -top-10 left-1/2 -translate-x-1/2 w-16 h-16 text-pink-400"
                animate={{
                  scale: heartBeat ? [1, 1.2, 1] : 1,
                }}
                transition={{
                  duration: 0.6,
                  repeat: heartBeat ? Infinity : 0,
                  repeatDelay: 0.5
                }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </motion.div>

              {/* 信封主体 */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-rose-100 to-pink-100 rounded-lg shadow-xl"
                animate={{
                  scale: isHovered ? 1.02 : 1,
                  y: isHovered ? 70 : 0,
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 15,
                  mass: 1.2
                }}
              >
                {/* 信封花纹装饰 */}
                <div className="absolute inset-4 border-2 border-pink-200 rounded-lg">
                  <div className="absolute inset-2 border border-pink-100 rounded-lg opacity-50" />
                  
                  {/* 心形图案装饰 */}
                  <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-10">
                    <div className="grid grid-cols-5 gap-4 rotate-12">
                      {Array(15).fill(null).map((_, i) => (
                        <svg key={i} className="w-6 h-6 text-pink-300" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 信封翻盖 */}
                <motion.div
                  className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-rose-200 to-pink-100 origin-top"
                  animate={{
                    rotateX: isHovered || shouldLeave ? -180 : 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                  }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="absolute inset-4 border-2 border-pink-200 rounded-t-lg">
                    <div className="absolute inset-2 border border-pink-100 rounded-t-lg opacity-50" />
                  </div>
                </motion.div>

                {/* 信纸 */}
                <motion.div
                  className="absolute inset-6 bg-white rounded-lg shadow-inner overflow-visible"
                  animate={{
                    y: isHovered ? -120 : 0,
                    opacity: isHovered ? 1 : 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 120,
                    damping: 15
                  }}
                >
                  <div className="absolute inset-0 bg-[#fffaf5] rounded-lg">
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      {/* 中间的提示文字 */}
                      <div className="flex-1 flex items-center justify-center w-full px-8">
                        <p className="text-pink-400/60 font-romantic text-center w-full"
                           style={{ 
                             fontSize: 'clamp(2rem, 6vw, 3.5rem)', 
                             lineHeight: '1.2'
                           }}>
                          看看TA对你说了什么
                        </p>
                      </div>
                      {/* 底部的心形图标和文字 */}
                      <div className="flex flex-col items-center pb-4 opacity-20">
                        <svg className="w-12 h-12 text-pink-400" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        <div className="mt-2 font-romantic text-pink-400">Love Letter</div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* 提示文字 */}
                {!isHovered && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="text-center w-full">
                      <p className="text-pink-600/80 font-serif text-lg mb-2">
                        {isLoading ? '解锁中...' : '点击查看属于你的信封'}
                      </p>
                      <p className="text-pink-400/60 font-romantic">Love Letter</p>
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* 点击区域 */}
              <div
                className="absolute inset-0"
                onClick={handleClick}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="relative w-[80vmin] md:w-[70%] max-w-5xl mx-auto"
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: '100vh', opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="relative aspect-[16/9]">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-100 to-pink-100 rounded-lg shadow-xl" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ErrorBoundary>
  );
};

Envelope.propTypes = {
  onOpen: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  shouldLeave: PropTypes.bool
};

Envelope.defaultProps = {
  isLoading: false,
  shouldLeave: false
};

export default React.memo(Envelope); 