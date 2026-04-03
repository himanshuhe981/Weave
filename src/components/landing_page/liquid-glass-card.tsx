"use client";

import { motion } from 'motion/react';
import { ReactNode, useRef, useState } from 'react';

interface LiquidGlassCardProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function LiquidGlassCard({ children, delay = 0, className = '' }: LiquidGlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0.5, y: 0.5 });
  };

  return (
    <motion.div
      className={`group relative ${className}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      <div
        ref={cardRef}
        className="relative w-full h-full overflow-hidden rounded-2xl md:rounded-3xl"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: 'translateZ(0)',
          willChange: 'transform',
        }}
      >
        {/* Liquid Glass Background */}
        <div className="absolute inset-0 bg-white/80 backdrop-blur-xl" />

        {/* Border with gradient */}
        <div 
          className="absolute inset-0 rounded-2xl md:rounded-3xl"
          style={{
            padding: '1px',
            background: 'linear-gradient(135deg, rgba(120, 113, 108, 0.2), rgba(255, 255, 255, 0.1), rgba(120, 113, 108, 0.15))',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
        />

        {/* Radial gradient that follows mouse */}
        <motion.div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(120, 113, 108, 0.08), transparent 40%)`,
          }}
        />

        {/* Shimmer effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100"
            initial={{ x: '-100%', y: '-100%' }}
            whileHover={{ x: '100%', y: '100%' }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            style={{
              background: 'linear-gradient(135deg, transparent 40%, rgba(255, 255, 255, 0.6) 50%, transparent 60%)',
              transform: 'skewX(-15deg)',
            }}
          />
        </div>

        {/* Inset highlight (top-left glass reflection) */}
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-2xl md:rounded-t-3xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 p-6 md:p-8">
          {children}
        </div>
      </div>

      {/* Pop-out shadow effect */}
      <motion.div
        className="absolute inset-0 -z-10 rounded-2xl md:rounded-3xl"
        style={{
          background: 'rgba(0, 0, 0, 0.1)',
          filter: 'blur(20px)',
        }}
        animate={{
          y: [0, 4, 0],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </motion.div>
  );
}