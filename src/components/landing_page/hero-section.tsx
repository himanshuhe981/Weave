"use client";

import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { WeaveLogo } from './weave-logo-animated';
import { SplitText3D } from './text-3d-effect';
import { LiquidGlassButton } from './liquid-glass';
import { useRouter } from 'next/navigation';

interface HeroSectionProps {
  heroY: any;
  heroOpacity: any;
  isMobile: boolean;
}

export function HeroSection({ heroY, heroOpacity, isMobile }: HeroSectionProps) {
  const router = useRouter();

  return (
    <motion.div
      className="relative z-10 max-w-6xl mx-auto text-center pt-20"
      style={{ y: heroY, opacity: heroOpacity }}
    >
      {/* Logo Badge */}
      <motion.div
        className={`inline-block ${isMobile ? 'mb-6' : 'mb-10'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className={`${isMobile ? 'px-4 py-2' : 'px-6 py-3'} bg-black/5 backdrop-blur-sm rounded-full border border-black/10`}>
          <div className="flex items-center gap-2">
            <WeaveLogo className={isMobile ? 'w-4 h-4' : 'w-5 h-5'} />
            <span
              className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium tracking-wide uppercase`}
              style={{ fontFamily: 'Sora, sans-serif' }}
            >
              Visual Workflow Automation
            </span>
          </div>
        </div>
      </motion.div>

      {/* Main Headline */}
      <div className={`${isMobile ? 'mb-6' : 'mb-8'}`} style={{ perspective: '1000px' }}>
        <SplitText3D
          text={isMobile ? "Build workflows visually" : "Build intelligent workflows visually"}
          className={isMobile ? 'text-5xl font-bold leading-[1.1] tracking-tight' : 'text-8xl font-bold leading-[0.95] tracking-tight'}
          delay={0.4}
        />
      </div>

      {/* Subtitle */}
      <motion.p
        className={`${isMobile ? 'text-base mb-8 px-4' : 'text-2xl mb-12'} text-black/60 max-w-3xl mx-auto leading-relaxed font-light`}
        style={{ fontFamily: 'Sora, sans-serif' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        {isMobile ? (
          <>
            Connect APIs, AI models, and services with drag-and-drop simplicity.
          </>
        ) : (
          <>
            Connect APIs, AI models, and services with drag-and-drop simplicity.
            <br />
            <span className="text-xl text-black/50">No code required. Deploy in seconds.</span>
          </>
        )}
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        className={`flex ${isMobile ? 'flex-col sm:flex-row items-center' : 'items-center'} justify-center gap-4 ${isMobile ? 'mb-12 px-4' : 'mb-20'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <LiquidGlassButton 
          variant="primary" 
          size={isMobile ? 'md' : 'lg'}
          onClick={() => router.push('/workflows')}
        >
          <span className="flex items-center gap-3">
            Start Building Free
            <ArrowRight className="w-5 h-5" />
          </span>
        </LiquidGlassButton>
        <LiquidGlassButton 
          variant="secondary" 
          size={isMobile ? 'md' : 'lg'}
          onClick={() => router.push('/docs')}
        >
          View Documentation
        </LiquidGlassButton>
      </motion.div>

      {/* Stats */}
      <motion.div
        className={`grid grid-cols-3 ${isMobile ? 'gap-6 pt-8' : 'gap-16 pt-16'} border-t border-black/10 ${isMobile ? '' : 'max-w-3xl mx-auto'}`}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
      >
        <StatItem number="15+" label="Integrations" delay={1.2} />
        <StatItem number="∞" label="Possibilities" delay={1.3} />
        <StatItem number="3" label="AI Providers" delay={1.4} />
      </motion.div>
    </motion.div>
  );
}

function StatItem({ number, label, delay }: { number: string; label: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="text-center"
    >
       <p className="text-3xl md:text-5xl font-bold mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
        {number}
      </p>
      <p className="text-xs md:text-sm text-black/60 uppercase tracking-wider" style={{ fontFamily: 'Sora, sans-serif' }}>
        {label}
      </p>
    </motion.div>
  );
}

export function ScrollIndicator() {
  return (
    <motion.div
      className="absolute bottom-1 left-1/2 -translate-x-1/2 hidden md:block"
      animate={{ y: [0, 12, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="w-[2px] h-20 bg-gradient-to-b from-black/20 via-black/40 to-transparent rounded-full" />
        <p className="text-xs uppercase tracking-widest text-black/40" style={{ fontFamily: 'Sora, sans-serif' }}>
          Scroll
        </p>
      </div>
    </motion.div>
  );
}
