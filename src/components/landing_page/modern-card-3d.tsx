"use client";

import { motion } from 'motion/react';
import { ReactNode, useRef } from 'react';

interface ModernCard3DProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function ModernCard3D({ children, delay = 0, className = '' }: ModernCard3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateY = ((x - centerX) / centerX) * 8;
    const rotateX = ((y - centerY) / centerY) * -8;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    cardRef.current.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.04)';
    cardRef.current.style.borderColor = 'rgba(0, 0, 0, 0.05)';
  };

  return (
    <motion.div
      className={`group relative ${className}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay }}
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d',
      }}
    >
      <div
        ref={cardRef}
        className="relative w-full h-full bg-white rounded-3xl p-6 md:p-8 overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transformStyle: 'preserve-3d',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          transition: 'transform 0.1s ease-out, box-shadow 0.3s ease, border-color 0.3s ease',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.08)';
          e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.15)';
        }}
      >
        {/* Shimmer effect on hover */}
        <motion.div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <motion.div
            className="absolute inset-0"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(120, 113, 108, 0.12), transparent)',
              transform: 'skewX(-15deg)',
            }}
          />
        </motion.div>

        {/* Content */}
        <div
          className="relative z-10"
          style={{
            transform: 'translateZ(20px)',
            transformStyle: 'preserve-3d',
          }}
        >
          {children}
        </div>

        {/* Depth layer */}
        <div
          className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(120, 113, 108, 0.05), transparent)',
            transform: 'translateZ(-5px)',
          }}
        />
      </div>
    </motion.div>
  );
}