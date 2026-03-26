"use client";

import { motion } from 'motion/react';
import { Check, ArrowRight } from 'lucide-react';
import { useState, useRef } from 'react';

interface PricingTier {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

const PRICING_TIERS: PricingTier[] = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'Perfect for exploring and building your first workflows',
    features: [
      '100 workflow executions per month',
      'Up to 5 active workflows',
      'All 15 nodes included',
      'Community support',
      'Basic analytics',
    ],
    cta: 'Start for Free',
  },
  {
    name: 'Professional',
    price: '$29',
    period: '/month',
    description: 'For teams scaling their automation',
    features: [
      '10,000 executions per month',
      'Unlimited active workflows',
      'Priority support',
      'Advanced analytics & logs',
      'Team collaboration',
      'Webhook retry logic',
    ],
    highlighted: true,
    cta: 'Start Free Trial',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For organizations with advanced needs',
    features: [
      'Unlimited executions',
      'Unlimited workflows',
      'Dedicated support engineer',
      'Custom integrations',
      'SLA guarantee (99.9%)',
      'Advanced security & SSO',
    ],
    cta: 'Contact Sales',
  },
];

function PricingCard({ tier, index }: { tier: PricingTier; index: number }) {
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

  if (tier.highlighted) {
    // Special highlighted tier - solid black
    return (
      <motion.div
        className="group relative rounded-2xl md:rounded-3xl p-6 md:p-8 bg-black text-white"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        whileHover={{ y: -12, transition: { duration: 0.3, type: 'spring', stiffness: 300 } }}
      >
        {/* Badge */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="px-4 py-1.5 bg-white text-black rounded-full text-xs font-semibold uppercase tracking-wider">
            Most Popular
          </div>
        </div>

        {/* Content */}
        <TierContent tier={tier} index={index} isHighlighted />

        {/* Glow effect */}
        <div className="absolute inset-0 rounded-2xl md:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-2xl shadow-black/30" />
      </motion.div>
    );
  }

  // Liquid glass tier
  return (
    <motion.div
      ref={cardRef}
      className="group relative"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -12, transition: { duration: 0.3, type: 'spring', stiffness: 300 } }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative rounded-2xl md:rounded-3xl overflow-hidden">
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

        {/* Inset highlight */}
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-2xl md:rounded-t-3xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 p-6 md:p-8">
          <TierContent tier={tier} index={index} />
        </div>
      </div>
    </motion.div>
  );
}

function TierContent({ tier, index, isHighlighted = false }: { tier: PricingTier; index: number; isHighlighted?: boolean }) {
  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h3
          className={`text-sm font-semibold uppercase tracking-wider mb-3 ${
            isHighlighted ? 'text-white/70' : 'text-black/50'
          }`}
          style={{ fontFamily: 'Sora, sans-serif' }}
        >
          {tier.name}
        </h3>
        <div className="flex items-baseline gap-2 mb-3">
          <span
            className="text-4xl md:text-5xl font-bold"
            style={{ fontFamily: 'Sora, sans-serif' }}
          >
            {tier.price}
          </span>
          {tier.period && (
            <span
              className={isHighlighted ? 'text-white/60' : 'text-black/50'}
              style={{ fontFamily: 'Sora, sans-serif' }}
            >
              {tier.period}
            </span>
          )}
        </div>
        <p
          className={`text-sm leading-relaxed ${
            isHighlighted ? 'text-white/80' : 'text-black/60'
          }`}
          style={{ fontFamily: 'Sora, sans-serif' }}
        >
          {tier.description}
        </p>
      </div>

      {/* Features */}
      <ul className="space-y-4 mb-8">
        {tier.features.map((feature, i) => (
          <motion.li
            key={i}
            className="flex items-start gap-3"
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 + i * 0.05 }}
          >
            <Check
              className={`w-5 h-5 shrink-0 mt-0.5 ${
                isHighlighted ? 'text-white' : 'text-black'
              }`}
            />
            <span
              className={`text-sm ${
                isHighlighted ? 'text-white/90' : 'text-black/70'
              }`}
              style={{ fontFamily: 'Sora, sans-serif' }}
            >
              {feature}
            </span>
          </motion.li>
        ))}
      </ul>

      {/* CTA Button */}
      <motion.button
        className={`group/btn relative w-full py-3 md:py-4 rounded-full font-semibold overflow-hidden transition-all ${
          isHighlighted
            ? 'bg-white text-black hover:bg-white/90'
            : 'bg-black text-white hover:bg-black/90'
        }`}
        style={{ fontFamily: 'Sora, sans-serif' }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {tier.cta}
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </span>
      </motion.button>
    </>
  );
}

export function ModernPricing() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
      {PRICING_TIERS.map((tier, index) => (
        <PricingCard key={tier.name} tier={tier} index={index} />
      ))}
    </div>
  );
}