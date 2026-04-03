"use client";

import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'motion/react';

export function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 200 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  const trailPositions = useRef<{ x: number; y: number }[]>([]);
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      setIsVisible(true);
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      // Update trail
      trailPositions.current.unshift({ x: e.clientX, y: e.clientY });
      if (trailPositions.current.length > 15) {
        trailPositions.current.pop();
      }
      setTrail([...trailPositions.current]);
    };

    const hideCursor = () => setIsVisible(false);

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseleave', hideCursor);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseleave', hideCursor);
    };
  }, [cursorX, cursorY]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]">
      {/* Thread trail */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="threadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(0,0,0,0)" />
            <stop offset="50%" stopColor="rgba(0,0,0,0.15)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </linearGradient>
        </defs>
        {trail.length > 1 && (
          <motion.path
            d={`M ${trail.map((point, i) => `${point.x},${point.y}`).join(' L ')}`}
            stroke="url(#threadGradient)"
            strokeWidth="1"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </svg>

      {/* Main cursor */}
      <motion.div
        className="absolute top-0 left-0"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
        }}
      >
        {/* Outer ring */}
        <motion.div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          <div className="w-8 h-8 border border-black/20 rounded-full" />
        </motion.div>
        
        {/* Inner dot */}
        <motion.div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          <div className="w-1.5 h-1.5 bg-black rounded-full backdrop-blur-sm" />
        </motion.div>
      </motion.div>
    </div>
  );
}
