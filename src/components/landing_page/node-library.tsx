"use client";

import { LiquidGlassCard } from './liquid-glass-card';
import { InteractiveTilt } from './interactive-text-tilt';
import { Text3DEffect } from './text-3d-effect';
import { motion } from 'motion/react';
import {
  MousePointer,
  FileText,
  CreditCard,
  Webhook,
  Calendar,
  Globe,
  Sparkles,
  MessageSquare,
  Send,
  GitBranch,
  Braces,
  Clock,
} from 'lucide-react';

const TRIGGER_NODES = [
  { icon: <MousePointer className="w-5 h-5" />, name: 'Manual Trigger', color: '#78716c' },
  { icon: <FileText className="w-5 h-5" />, name: 'Google Forms', color: '#4285F4' },
  { icon: <CreditCard className="w-5 h-5" />, name: 'Stripe Events', color: '#635BFF' },
  { icon: <Webhook className="w-5 h-5" />, name: 'Webhook', color: '#000000' },
  { icon: <Calendar className="w-5 h-5" />, name: 'Scheduled', color: '#EA4335' },
];

const ACTION_NODES = [
  { icon: <Globe className="w-5 h-5" />, name: 'HTTP Request', color: '#0284c7' },
  { icon: <Sparkles className="w-5 h-5" />, name: 'Gemini AI', color: '#8E75FF' },
  { icon: <Sparkles className="w-5 h-5" />, name: 'OpenAI', color: '#10A37F' },
  { icon: <Sparkles className="w-5 h-5" />, name: 'Claude', color: '#D97757' },
  { icon: <MessageSquare className="w-5 h-5" />, name: 'Discord', color: '#5865F2' },
  { icon: <MessageSquare className="w-5 h-5" />, name: 'Slack', color: '#4A154B' },
  { icon: <Send className="w-5 h-5" />, name: 'Telegram', color: '#26A5E4' },
  { icon: <GitBranch className="w-5 h-5" />, name: 'If/Else Logic', color: '#f59e0b' },
  { icon: <Braces className="w-5 h-5" />, name: 'JSON Transform', color: '#10b981' },
  { icon: <Clock className="w-5 h-5" />, name: 'Delay', color: '#6366f1' },
];

export function NodeLibrary() {
  return (
    <div className="space-y-12 md:space-y-16">
      {/* Trigger Nodes */}
      <div>
        <motion.h3 
          className="text-2xl md:text-4xl font-semibold mb-6 md:mb-10 text-center"
          style={{ fontFamily: 'Sora, sans-serif' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Trigger Nodes
          <span className="block text-base md:text-xl text-black/50 font-light mt-2">
            Start your automation with these events
          </span>
        </motion.h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
          {TRIGGER_NODES.map((node, index) => (
            <NodeCard key={node.name} {...node} delay={index * 0.1} />
          ))}
        </div>
      </div>

      {/* Action Nodes */}
      <div>
        <motion.h3 
          className="text-2xl md:text-4xl font-semibold mb-6 md:mb-10 text-center"
          style={{ fontFamily: 'Sora, sans-serif' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Action Nodes
          <span className="block text-base md:text-xl text-black/50 font-light mt-2">
            Process data, call APIs, and send messages
          </span>
        </motion.h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
          {ACTION_NODES.map((node, index) => (
            <NodeCard key={node.name} {...node} delay={index * 0.1} />
          ))}
        </div>
      </div>
    </div>
  );
}

function NodeCard({ 
  icon, 
  name, 
  color, 
  delay 
}: { 
  icon: React.ReactNode; 
  name: string; 
  color: string; 
  delay: number;
}) {
  return (
    <LiquidGlassCard delay={delay} className="text-center">
      <motion.div 
        className="p-3 md:p-4 rounded-xl md:rounded-2xl mx-auto mb-3 md:mb-4 w-fit text-white transition-all"
        style={{ background: color }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      >
        {icon}
      </motion.div>
      <p className="text-xs md:text-sm font-semibold" style={{ fontFamily: 'Sora, sans-serif' }}>
        {name}
      </p>
    </LiquidGlassCard>
  );
}