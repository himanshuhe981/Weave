"use client";

import { useState, useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'motion/react';
import {
  MousePointer, FileText, CreditCard, Webhook, Calendar,
  Globe, Sparkles, MessageSquare, Send, GitBranch, Braces, Clock,
  ArrowRight, Zap,
} from 'lucide-react';

const TRIGGER_NODES = [
  { icon: <MousePointer className="w-5 h-5" />, name: 'Manual Trigger', color: '#78716c', desc: 'Run on demand' },
  { icon: <FileText className="w-5 h-5" />, name: 'Google Forms', color: '#4285F4', desc: 'Form submission' },
  { icon: <CreditCard className="w-5 h-5" />, name: 'Stripe Events', color: '#635BFF', desc: 'Payment events' },
  { icon: <Webhook className="w-5 h-5" />, name: 'Webhook', color: '#000000', desc: 'Any HTTP call' },
  { icon: <Calendar className="w-5 h-5" />, name: 'Scheduled', color: '#EA4335', desc: 'Time-based cron' },
];

const ACTION_NODES = [
  { icon: <Globe className="w-5 h-5" />, name: 'HTTP Request', color: '#0284c7', desc: 'Call any API' },
  { icon: <Sparkles className="w-5 h-5" />, name: 'Gemini AI', color: '#8E75FF', desc: 'Generate with AI' },
  { icon: <Sparkles className="w-5 h-5" />, name: 'OpenAI', color: '#10A37F', desc: 'GPT-4o actions' },
  { icon: <Sparkles className="w-5 h-5" />, name: 'Claude', color: '#D97757', desc: 'Anthropic AI' },
  { icon: <MessageSquare className="w-5 h-5" />, name: 'Discord', color: '#5865F2', desc: 'Send messages' },
  { icon: <MessageSquare className="w-5 h-5" />, name: 'Slack', color: '#4A154B', desc: 'Notify channel' },
  { icon: <Send className="w-5 h-5" />, name: 'Telegram', color: '#26A5E4', desc: 'Bot messages' },
  { icon: <GitBranch className="w-5 h-5" />, name: 'If/Else Logic', color: '#f59e0b', desc: 'Branch flow' },
  { icon: <Braces className="w-5 h-5" />, name: 'JSON Transform', color: '#10b981', desc: 'Reshape data' },
  { icon: <Clock className="w-5 h-5" />, name: 'Delay', color: '#6366f1', desc: 'Wait & resume' },
];

export function NodeLibrary() {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 85%', 'end 15%'],
  });

  const progress = useSpring(scrollYProgress, { stiffness: 50, damping: 25 });

  return (
    <div ref={containerRef} className="w-full relative py-8 lg:py-16 z-10">

      {/* ── Two-column pill tabs layout ─────────────────────────── */}
      <div className="w-full max-w-[1200px] mx-auto px-4 lg:px-8 space-y-10 lg:space-y-16">

        {/* Trigger row */}
        <NodeRow
          label="Triggers"
          sublabel="Start your automation with any of these events"
          nodes={TRIGGER_NODES}
          activeNode={activeNode}
          setActiveNode={setActiveNode}
          rowKey="trigger"
          tagColor="#f59e0b"
        />

        {/* Visual pipeline connector between rows */}
        <PipelineConnector progress={progress} />

        {/* Action row */}
        <NodeRow
          label="Actions"
          sublabel="Process, call APIs, use AI, and send messages"
          nodes={ACTION_NODES}
          activeNode={activeNode}
          setActiveNode={setActiveNode}
          rowKey="action"
          tagColor="#6366f1"
        />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */
/* NodeRow                                                    */
/* ────────────────────────────────────────────────────────── */
function NodeRow({
  label, sublabel, nodes, activeNode, setActiveNode, rowKey, tagColor,
}: {
  label: string;
  sublabel: string;
  nodes: typeof TRIGGER_NODES;
  activeNode: string | null;
  setActiveNode: (k: string | null) => void;
  rowKey: string;
  tagColor: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-5%' }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Row header */}
      <div className="flex items-center gap-4 mb-5 lg:mb-7">
        <div
          className="px-3 py-1 rounded-full text-[11px] font-black tracking-[0.2em] uppercase text-white"
          style={{ background: tagColor }}
        >
          {label}
        </div>
        <span className="text-sm text-black/40 font-medium hidden sm:block">{sublabel}</span>
        <div className="ml-auto text-[11px] font-bold text-black/25 tracking-widest uppercase">
          {nodes.length} nodes
        </div>
      </div>

      {/* Node pill grid — wraps on mobile to 2 cols */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {nodes.map((node, i) => {
          const key = `${rowKey}-${i}`;
          const isActive = activeNode === key;
          return (
            <NodePill
              key={key}
              node={node}
              isActive={isActive}
              delay={i * 0.055}
              onHover={() => setActiveNode(key)}
              onLeave={() => setActiveNode(null)}
            />
          );
        })}
      </div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────── */
/* NodePill — the core interactive chip                       */
/* ────────────────────────────────────────────────────────── */
function NodePill({
  node, isActive, delay, onHover, onLeave,
}: {
  node: typeof TRIGGER_NODES[0];
  isActive: boolean;
  delay: number;
  onHover: () => void;
  onLeave: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-5%' }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      onHoverStart={onHover}
      onHoverEnd={onLeave}
    >
      <motion.div
        animate={isActive
          ? { scale: 1.04, y: -4, boxShadow: `0 16px 40px ${node.color}28, 0 4px 12px rgba(0,0,0,0.08)` }
          : { scale: 1, y: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }
        }
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        className="relative flex flex-col items-center justify-center gap-3 p-4 sm:p-5 rounded-2xl sm:rounded-3xl cursor-pointer overflow-hidden border border-black/[0.04] group"
        style={{
          background: isActive
            ? `linear-gradient(135deg, white 0%, ${node.color}08 100%)`
            : 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderColor: isActive ? `${node.color}30` : 'rgba(0,0,0,0.04)',
        }}
      >
        {/* Specular highlight */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px] opacity-80 pointer-events-none"
          style={{ background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)` }}
        />

        {/* Colored icon badge */}
        <motion.div
          animate={{ rotate: isActive ? [0, -5, 5, 0] : 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg flex-shrink-0"
          style={{ background: node.color, boxShadow: `0 6px 20px ${node.color}50` }}
        >
          {node.icon}
        </motion.div>

        {/* Labels */}
        <div className="text-center">
          <p className="text-[13px] sm:text-sm font-bold text-black/85 leading-tight" style={{ fontFamily: 'Sora, sans-serif' }}>
            {node.name}
          </p>
          <p className="text-[11px] text-black/40 font-medium mt-0.5 hidden sm:block">{node.desc}</p>
        </div>

        {/* Active bottom accent bar */}
        <motion.div
          animate={{ scaleX: isActive ? 1 : 0, opacity: isActive ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-0 left-4 right-4 h-[2.5px] rounded-full origin-center"
          style={{ background: node.color }}
        />
      </motion.div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────── */
/* PipelineConnector — the animated "wire" between rows       */
/* ────────────────────────────────────────────────────────── */
function PipelineConnector({ progress }: { progress: any }) {
  const dashOffset = useTransform(progress, [0, 1], [200, 0]);

  return (
    <div className="relative flex items-center justify-center w-full h-[56px] lg:h-[72px] pointer-events-none select-none">
      {/* Left pill label */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur border border-black/5 shadow-sm flex items-center gap-1.5 text-[11px] font-bold text-black/50 uppercase tracking-wider">
        <Zap className="w-3 h-3" />
        Trigger fires
      </div>

      {/* Animated SVG connector line */}
      <svg
        viewBox="0 0 400 40"
        className="w-full max-w-[500px] h-10"
        preserveAspectRatio="none"
      >
        {/* Ghost */}
        <path
          d="M 0 20 C 80 20, 120 20, 200 20 C 280 20, 320 20, 400 20"
          fill="none"
          stroke="rgba(0,0,0,0.06)"
          strokeWidth="2"
          strokeDasharray="6 10"
        />
        {/* Flowing dashes */}
        <motion.path
          d="M 0 20 C 80 20, 120 20, 200 20 C 280 20, 320 20, 400 20"
          fill="none"
          stroke="rgba(0,0,0,0.2)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="14 200"
          style={{ strokeDashoffset: dashOffset }}
        />
      </svg>

      {/* Traveling arrow head */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black flex items-center justify-center shadow-lg"
        animate={{ left: ['10%', '88%'] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', repeatType: 'reverse' }}
      >
        <ArrowRight className="w-3 h-3 text-white" />
      </motion.div>

      {/* Right pill label */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur border border-black/5 shadow-sm flex items-center gap-1.5 text-[11px] font-bold text-black/50 uppercase tracking-wider">
        Actions run
        <ArrowRight className="w-3 h-3" />
      </div>
    </div>
  );
}