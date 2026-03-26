"use client";

import { motion } from 'motion/react';

// Flowing vertical threads for workflow section
export function FlowingThreadsBG() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-15">
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-0.5 bg-gradient-to-b from-transparent via-stone-400/60 to-transparent"
          style={{
            left: `${10 + i * 10}%`,
            top: '-20%',
            height: '140%',
          }}
          animate={{
            y: ['0%', '30%', '0%'],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 14 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.4,
          }}
        />
      ))}
    </div>
  );
}

// Weaving pattern - IMPROVED with better fabric mesh style and bigger size
export function WeavingPatternBG() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-12">
      <svg className="w-full h-full">
        <defs>
          <pattern id="weaving-improved" x="0" y="0" width="160" height="160" patternUnits="userSpaceOnUse">
            {/* Horizontal threads */}
            {[0, 40, 80, 120].map((y, i) => (
              <motion.line
                key={`h-${i}`}
                x1="0"
                y1={y}
                x2="160"
                y2={y}
                stroke="currentColor"
                strokeWidth="1"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: [0, 1, 1, 0],
                  opacity: [0, 0.6, 0.6, 0],
                }}
                transition={{ 
                  duration: 10,
                  delay: i * 0.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
            {/* Vertical threads */}
            {[0, 40, 80, 120].map((x, i) => (
              <motion.line
                key={`v-${i}`}
                x1={x}
                y1="0"
                x2={x}
                y2="160"
                stroke="currentColor"
                strokeWidth="1"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: [0, 1, 1, 0],
                  opacity: [0, 0.6, 0.6, 0],
                }}
                transition={{ 
                  duration: 10,
                  delay: i * 0.8 + 0.4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
            {/* Intersection points */}
            {[0, 40, 80, 120].map((y) => 
              [0, 40, 80, 120].map((x) => (
                <circle 
                  key={`${x}-${y}`}
                  cx={x} 
                  cy={y} 
                  r="3" 
                  fill="currentColor" 
                  opacity="0.4" 
                />
              ))
            )}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#weaving-improved)" className="text-black" />
      </svg>
    </div>
  );
}

// Radial threads for integrations - IMPROVED and BIGGER
export function RadialThreadsBG() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-12">
      <svg className="w-full h-full">
        <defs>
          <pattern id="radial-improved" x="0" y="0" width="400" height="400" patternUnits="userSpaceOnUse">
            {[...Array(16)].map((_, i) => (
              <motion.line
                key={i}
                x1="200"
                y1="200"
                x2={200 + Math.cos((i * Math.PI) / 8) * 160}
                y2={200 + Math.sin((i * Math.PI) / 8) * 160}
                stroke="currentColor"
                strokeWidth="1"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: [0, 1, 0],
                  opacity: [0, 0.7, 0],
                }}
                transition={{
                  duration: 6,
                  delay: i * 0.2,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: 'easeInOut',
                }}
              />
            ))}
            <circle cx="200" cy="200" r="6" fill="currentColor" opacity="0.5" />
            {/* Concentric circles */}
            {[60, 100, 140].map((r) => (
              <circle 
                key={r}
                cx="200" 
                cy="200" 
                r={r} 
                fill="none"
                stroke="currentColor" 
                strokeWidth="1"
                opacity="0.3"
              />
            ))}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#radial-improved)" className="text-black" />
      </svg>
    </div>
  );
}

// Diagonal threads for pricing - IMPROVED with stone accent
export function DiagonalThreadsBG() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-15">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-px"
          style={{
            width: '200%',
            top: `${i * 10}%`,
            left: '-50%',
            transform: 'rotate(-20deg)',
            background: i % 3 === 0 
              ? 'linear-gradient(90deg, transparent, rgba(120, 113, 108, 0.4), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.15), transparent)',
          }}
          animate={{ 
            x: ['-50%', '50%'],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 18 + i * 2,
            repeat: Infinity,
            ease: 'linear',
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  );
}

// Spiraling threads for CTA - COMPLETELY REDESIGNED with better animation
export function SpiralThreadsBG() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
      <svg className="w-full h-full" viewBox="0 0 1000 1000">
        <defs>
          <radialGradient id="spiral-gradient" cx="50%" cy="50%">
            <stop offset="0%" stopColor="rgba(120, 113, 108, 0.8)" />
            <stop offset="50%" stopColor="rgba(0, 0, 0, 0.6)" />
            <stop offset="100%" stopColor="rgba(120, 113, 108, 0.3)" />
          </radialGradient>
          <filter id="spiral-glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Concentric expanding spirals */}
        {[0, 1, 2, 3, 4].map((spiralIndex) => {
          const radius = 100 + spiralIndex * 120;
          const segments = 8;
          
          return (
            <g key={spiralIndex}>
              {[...Array(segments)].map((_, segmentIndex) => {
                const angle = (segmentIndex * (360 / segments) * Math.PI) / 180;
                const x1 = 500 + Math.cos(angle) * radius;
                const y1 = 500 + Math.sin(angle) * radius;
                const x2 = 500 + Math.cos(angle) * (radius + 80);
                const y2 = 500 + Math.sin(angle) * (radius + 80);
                
                return (
                  <motion.line
                    key={segmentIndex}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="url(#spiral-gradient)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    filter="url(#spiral-glow)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ 
                      pathLength: [0, 1, 0],
                      opacity: [0, 0.9, 0],
                      rotate: [0, 360],
                    }}
                    transition={{ 
                      duration: 10,
                      delay: spiralIndex * 0.8 + segmentIndex * 0.2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    style={{ 
                      transformOrigin: '500px 500px',
                    }}
                  />
                );
              })}
            </g>
          );
        })}
        
        {/* Orbital particles */}
        {[0, 1, 2].map((orbitIndex) => {
          const radius = 200 + orbitIndex * 150;
          
          return (
            <motion.circle
              key={`orbit-${orbitIndex}`}
              cx={500}
              cy={500}
              r="5"
              fill="rgba(120, 113, 108, 0.7)"
              filter="url(#spiral-glow)"
              animate={{
                cx: [
                  500 + radius,
                  500,
                  500 - radius,
                  500,
                  500 + radius,
                ],
                cy: [
                  500,
                  500 + radius,
                  500,
                  500 - radius,
                  500,
                ],
              }}
              transition={{
                duration: 12 + orbitIndex * 3,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          );
        })}
        
        {/* Center point */}
        <circle cx="500" cy="500" r="8" fill="rgba(120, 113, 108, 0.6)" filter="url(#spiral-glow)" />
        
        {/* Pulsing center glow */}
        <motion.circle
          cx="500"
          cy="500"
          r="20"
          fill="none"
          stroke="rgba(120, 113, 108, 0.4)"
          strokeWidth="2"
          animate={{
            r: [20, 60, 20],
            opacity: [0.6, 0, 0.6],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </svg>
    </div>
  );
}

// Fabric mesh for use cases - ENHANCED and BIGGER
export function FabricMeshBG() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-12">
      <svg className="w-full h-full">
        <defs>
          <pattern id="mesh-enhanced" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
            {/* Curved horizontal threads - bigger curves */}
            <motion.path
              d="M 0 100 Q 50 80 100 100 T 200 100"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: [0, 1, 1, 0] }}
              transition={{ duration: 6, repeat: Infinity, repeatDelay: 1 }}
            />
            <motion.path
              d="M 0 50 Q 50 30 100 50 T 200 50"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: [0, 1, 1, 0] }}
              transition={{ duration: 6, delay: 0.5, repeat: Infinity, repeatDelay: 1 }}
            />
            <motion.path
              d="M 0 150 Q 50 130 100 150 T 200 150"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: [0, 1, 1, 0] }}
              transition={{ duration: 6, delay: 1, repeat: Infinity, repeatDelay: 1 }}
            />
            
            {/* Curved vertical threads - bigger curves */}
            <motion.path
              d="M 100 0 Q 80 50 100 100 T 100 200"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: [0, 1, 1, 0] }}
              transition={{ duration: 6, delay: 1.5, repeat: Infinity, repeatDelay: 1 }}
            />
            <motion.path
              d="M 50 0 Q 30 50 50 100 T 50 200"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: [0, 1, 1, 0] }}
              transition={{ duration: 6, delay: 2, repeat: Infinity, repeatDelay: 1 }}
            />
            <motion.path
              d="M 150 0 Q 130 50 150 100 T 150 200"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: [0, 1, 1, 0] }}
              transition={{ duration: 6, delay: 2.5, repeat: Infinity, repeatDelay: 1 }}
            />
            
            {/* Intersection points - bigger */}
            {[50, 100, 150].map((y) => 
              [50, 100, 150].map((x) => (
                <circle 
                  key={`${x}-${y}`}
                  cx={x} 
                  cy={y} 
                  r="4" 
                  fill="currentColor" 
                  opacity="0.5" 
                />
              ))
            )}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mesh-enhanced)" className="text-black" />
      </svg>
    </div>
  );
}