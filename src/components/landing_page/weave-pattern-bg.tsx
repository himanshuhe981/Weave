"use client";

import { motion } from 'motion/react';

export function WeavePatternBG({ className = "", opacity = 0.4 }: { className?: string; opacity?: number }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} style={{ opacity }}>
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <pattern id="weave-grid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <motion.line
              x1="0"
              y1="40"
              x2="80"
              y2="40"
              stroke="currentColor"
              strokeWidth="0.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
            <motion.line
              x1="40"
              y1="0"
              x2="40"
              y2="80"
              stroke="currentColor"
              strokeWidth="0.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 0.2, ease: "easeInOut" }}
            />
            <motion.circle
              cx="40"
              cy="40"
              r="2"
              fill="currentColor"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, delay: 0.8 }}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#weave-grid)" className="text-black/10" />
      </svg>
    </div>
  );
}

export function FloatingThreadsStatic() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-px h-64 bg-gradient-to-b from-transparent via-black/15 to-transparent"
          style={{
            left: `${15 + i * 15}%`,
            top: '-20%',
          }}
          animate={{
            y: ['0%', '120%'],
          }}
          transition={{
            duration: 12 + i * 2,
            repeat: Infinity,
            ease: 'linear',
            delay: i * 0.8,
          }}
        />
      ))}
    </div>
  );
}
