"use client";

import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface Text3DEffectProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p';
}

export function Text3DEffect({ children, className = '', delay = 0, as = 'h1' }: Text3DEffectProps) {
  const Component = motion[as];

  return (
    <div style={{ perspective: '1000px' }} className="overflow-visible">
      <Component
        className={className}
        initial={{ opacity: 0, y: 50, rotateX: -15 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{
          duration: 1,
          delay,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{
          transformStyle: 'preserve-3d',
          textShadow: '0 1px 0 rgba(0,0,0,0.05), 0 2px 0 rgba(0,0,0,0.04), 0 3px 0 rgba(0,0,0,0.03)',
        }}
        whileHover={{
          rotateY: 2,
          transition: { duration: 0.3 },
        }}
      >
        {children}
      </Component>
    </div>
  );
}

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export function SplitText3D({ text, className = '', delay = 0 }: SplitTextProps) {
  const words = text.split(' ');

  return (
    <div className={`${className} flex flex-wrap justify-center gap-x-3`} style={{ perspective: '1000px' }}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 50, rotateX: -20 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{
            duration: 0.8,
            delay: delay + i * 0.05,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            display: 'inline-block',
            transformStyle: 'preserve-3d',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
          whileHover={{
            y: -5,
            rotateY: 5,
            transition: { duration: 0.2 },
          }}
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
}
