import React, { useState } from 'react';
import { motion } from 'framer-motion';

const BalloonBackground = () => {
  const [balloons] = useState(
    Array(15).fill(null).map(() => ({
      id: Math.random(),
      x: Math.random() * 100,
      delay: Math.random() * 0.3,
      speed: 2 + Math.random() * 2,
      scale: 0.8 + Math.random() * 0.4,
      initialY: window.innerHeight + 100
    }))
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {balloons.map(({ id, x, delay, speed, scale, initialY }) => (
        <motion.div
          key={id}
          className="absolute"
          style={{
            left: `${x}%`,
            transform: `scale(${scale})`,
          }}
          initial={{ y: initialY }}
          animate={{
            y: [-100, -window.innerHeight * 1.5],
          }}
          transition={{
            duration: 20 / speed,
            delay: delay,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          <div className="relative">
            {/* 气球主体 */}
            <div className="w-12 h-16 bg-red-400 rounded-full relative">
              {/* 气球顶部装饰 */}
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-300 rounded-full"></div>
              {/* 爱心装饰 */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xl">♥</div>
            </div>
            {/* 吊篮 */}
            <div className="relative">
              {/* 垂直绳子 */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-6 bg-gray-400"></div>
              {/* 吊篮 */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-6 h-3 bg-yellow-700 rounded"></div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default BalloonBackground; 