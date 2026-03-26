"use client";

import { motion, MotionProps } from 'motion/react';
import { ReactNode, useState } from 'react';

interface LiquidGlassButtonProps extends Omit<MotionProps, 'children'> {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

export function LiquidGlassButton({ 
  children, 
  variant = 'primary', 
  size = 'md',
  onClick,
  className,
  ...props 
}: LiquidGlassButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const sizeClasses = {
    sm: 'px-6 py-3 text-sm',
    md: 'px-10 py-5 text-base',
    lg: 'px-12 py-6 text-lg',
  };

  const variantStyles = variant === 'primary' 
    ? 'bg-black/90 text-white border-white/10 hover:bg-black' 
    : 'bg-white/50 text-black border-black/10 hover:bg-white/70';

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple = { x, y, id: Date.now() };
    setRipples([...ripples, newRipple]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
    onClick?.();
  };

  return (
    <motion.button
      onClick={handleClick}
      className={`relative rounded-full font-semibold ${sizeClasses[size]} backdrop-blur-2xl border transition-all overflow-hidden ${variantStyles} ${className || ''}`}
      style={{ 
        fontFamily: 'Sora, sans-serif',
        boxShadow: variant === 'primary'
          ? '0 20px 40px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          : '0 20px 40px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      {...props}
    >
      {/* Click ripple effects */}
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 0,
            height: 0,
            background: variant === 'primary' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.1)',
          }}
          initial={{ width: 0, height: 0, opacity: 1 }}
          animate={{ 
            width: 300, 
            height: 300, 
            opacity: 0,
            x: -150,
            y: -150,
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}

      {/* Liquid shimmer effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ x: '-100%', opacity: 0 }}
        animate={isHovered ? { x: '100%', opacity: 1 } : { x: '-100%', opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        style={{
          background: variant === 'primary'
            ? 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.1), transparent)',
        }}
      />

      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 opacity-0 pointer-events-none"
        animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          background: variant === 'primary'
            ? 'radial-gradient(circle at center, rgba(255, 255, 255, 0.15), transparent)'
            : 'radial-gradient(circle at center, rgba(0, 0, 0, 0.05), transparent)',
        }}
      />

      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}

interface LiquidGlassBoxProps {
  children: ReactNode;
  className?: string;
  variant?: 'light' | 'dark';
}

export function LiquidGlassBox({ children, className = '', variant = 'light' }: LiquidGlassBoxProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const variantStyles = variant === 'light'
    ? 'bg-white/60 border-black/5'
    : 'bg-black/80 border-white/10 text-white';

  return (
    <motion.div
      className={`relative rounded-3xl backdrop-blur-2xl border overflow-hidden ${variantStyles} ${className}`}
      style={{
        boxShadow: variant === 'light'
          ? '0 20px 60px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
          : '0 20px 60px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
      }}
      onMouseMove={handleMouseMove}
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Radial gradient following mouse */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background: `radial-gradient(circle 200px at ${mousePos.x}% ${mousePos.y}%, ${
            variant === 'light' ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.08)'
          }, transparent)`,
        }}
      />

      {/* Glass reflection */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background: variant === 'light'
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, transparent 50%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, transparent 50%)',
        }}
      />

      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}