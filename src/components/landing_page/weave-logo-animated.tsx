"use client";

import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

export function WeaveLogo({ className = 'w-8 h-8' }: { className?: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Three individually plotted Bezier strands forming a distinctly wider looping "W".
  // Because their control points diverge but perfectly share tangent vectors at the nodes, 
  // they trace an exquisite crossing, overlapping braid instead of mere parallel lines!
  const corePath = "M 50 50 C 70 95, 95 95, 95 25 C 95 -20, 70 5, 50 50 C 30 95, 5 95, 5 25 C 5 -20, 30 5, 50 50 Z";
  const strand1  = "M 50 50 C 75 95, 95 70, 95 25 C 95 -10, 75 5, 50 50 C 25 95, 5 70, 5 25 C 5 -10, 25 5, 50 50 Z";
  const strand2  = "M 50 50 C 65 95, 95 120, 95 25 C 95 -30, 65 5, 50 50 C 35 95, 5 120, 5 25 C 5 -30, 35 5, 50 50 Z";

  const threads = [
    { path: corePath, width: "1.5", opacity: "0.5" },
    { path: strand1, width: "1", opacity: "0.4" },
    { path: strand2, width: "1", opacity: "0.4" },
  ];

  if (!mounted) {
    return <div className={className} />;
  }

  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible text-current">
        <defs>
          {/* Authentic technical fabric warp & weft background */}
          <pattern id="fabricGrid" width="10" height="10" patternUnits="userSpaceOnUse">
            <line x1="10" y1="0" x2="10" y2="10" stroke="currentColor" strokeOpacity="0.08" strokeWidth="0.5" />
            <line x1="0" y1="10" x2="10" y2="10" stroke="currentColor" strokeOpacity="0.08" strokeWidth="0.5" />
          </pattern>

          <filter id="premium-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Woven in fabric background */}
        <rect x="0" y="0" width="100" height="100" fill="url(#fabricGrid)" rx="16" />

        {/* 1) Subtle base braided W threads woven securely together */}
        {threads.map((thread, i) => (
          <path 
            key={`base-${i}`}
            d={thread.path} 
            fill="none" 
            stroke="currentColor" 
            strokeOpacity={thread.opacity} 
            strokeWidth={thread.width} 
            strokeLinecap="round" 
          />
        ))}

        {/* 2) High-visibility animated data threads tracing strictly along the braids */}
        {threads.map((thread, i) => (
          <motion.path
            key={`signal-${i}`}
            d={thread.path}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#premium-glow)"
            initial={{ pathLength: 0.15, pathOffset: -0.15 }}
            animate={{ pathOffset: [ -0.15, 0.85 ] }} // Complete 100% traversal
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          />
        ))}

        {/* 3) Main Workflow Nodes with creative bullseye aesthetic and perfectly timed ripples */}
        {[
          { cx: 50, cy: 50, duration: 1.25, delay: 0 },         // Triggered at t=0 and t=1.25
          { cx: 95, cy: 25, duration: 2.5, delay: 0.625 },      // Triggered at t=0.625
          { cx: 5, cy: 25, duration: 2.5, delay: 1.875 },       // Triggered at t=1.875
        ].map((node, i) => (
          <g key={i}>
            {/* Elegant, expansive impact ripple explicitly synchronized to the glowing thread arrival */}
            <motion.circle 
              cx={node.cx} 
              cy={node.cy} 
              r="4" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5"
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: [1, 3], opacity: [0.8, 0] }}
              transition={{ 
                duration: node.duration, 
                repeat: Infinity, 
                delay: node.delay, 
                ease: "easeOut" 
              }}
            />
            {/* Aesthetic hollow bullseye node core for a clean, technical look */}
            <circle 
              cx={node.cx} 
              cy={node.cy} 
              r="3.5" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
            />
            <circle 
              cx={node.cx} 
              cy={node.cy} 
              r="1.5" 
              fill="currentColor" 
            />
          </g>
        ))}
      </svg>
    </div>
  );
}