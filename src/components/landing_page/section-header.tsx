"use client";

import { motion } from 'motion/react';
import { InteractiveTilt } from './interactive-text-tilt';
import { Text3DEffect } from './text-3d-effect';

interface SectionHeaderProps {
  title: string;
  subtitle: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export function SectionHeader({ title, subtitle, maxWidth = 'lg' }: SectionHeaderProps) {
  const maxWidthClass = {
    sm: 'max-w-xl',
    md: 'max-w-2xl',
    lg: 'max-w-3xl',
    xl: 'max-w-4xl',
  }[maxWidth];

  return (
    <div className="text-center mb-12 md:mb-20">
      <InteractiveTilt>
        <Text3DEffect
          as="h2"
          className="text-4xl md:text-7xl font-bold mb-4 md:mb-8 tracking-tight px-4"
          delay={0.2}
        >
          <span style={{ fontFamily: 'Sora, sans-serif' }}>{title}</span>
        </Text3DEffect>
      </InteractiveTilt>
      <motion.p
        className={`text-base md:text-2xl text-black/60 ${maxWidthClass} mx-auto font-light px-4 leading-relaxed`}
        style={{ fontFamily: 'Sora, sans-serif' }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        {subtitle}
      </motion.p>
    </div>
  );
}
