"use client";

import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { useEffect, useState, useRef } from 'react';
import { FileText, Sparkles, MessageSquare, CheckCircle2, GitBranch } from 'lucide-react';

// ─── Node definitions using PERCENTAGE positions (0–100) ─────────────────────
// These are percentages of the canvas width and height.
// This way nodes ALWAYS stay inside the box regardless of screen size.

const WORKFLOW_NODES = [
  {
    id: 1,
    icon: <FileText className="w-5 h-5" />,
    name: 'Google Form',
    subtitle: 'New submission',
    color: '#4285F4',
    // top-centre
    xPct: 50,
    yPct: 4,
    delay: 0,
  },
  {
    id: 2,
    icon: <GitBranch className="w-5 h-5" />,
    name: 'IF Condition',
    subtitle: 'Check Priority',
    color: '#F59E0B',
    // middle-centre
    xPct: 50,
    yPct: 36,
    delay: 1500,
  },
  {
    id: 3,
    icon: <Sparkles className="w-5 h-5" />,
    name: 'OpenAI GPT-4',
    subtitle: 'Urgent: AI Analysis',
    color: '#10A37F',
    // bottom-left
    xPct: 14,
    yPct: 69,
    delay: 3000,
  },
  {
    id: 4,
    icon: <MessageSquare className="w-5 h-5" />,
    name: 'Slack Alert',
    subtitle: 'Normal: Queue',
    color: '#4A154B',
    // bottom-right
    xPct: 86,
    yPct: 69,
    delay: 3000,
  },
];

// ─── Feature highlights ───────────────────────────────────────────────────────

const FEATURES = [
  { num: '01', title: 'Visual Builder',  desc: 'Drag nodes and connect with threads', step: 0 },
  { num: '02', title: 'Smart Branching', desc: 'Conditional logic with IF nodes',     step: 1 },
  { num: '03', title: 'Live Execution',  desc: 'Watch workflows run in real-time',    step: 2 },
];

// ─── SVG connection between two percentage-based points ──────────────────────
// cW / cH are the actual canvas pixel dimensions (measured by ResizeObserver).
// The SVG is sized to match the canvas and uses those real pixel values.

function AnimatedConnection({
  isActive,
  fromPct,
  toPct,
  cW,
  cH,
  id,
}: {
  isActive: boolean;
  fromPct: { x: number; y: number };
  toPct: { x: number; y: number };
  cW: number;
  cH: number;
  id: string;
}) {
  // Node card is 44% wide, centred on xPct. Mid-bottom of top card → mid-top of bottom card.
  const NODE_W_PCT = 44; // card width as % of canvas
  const NODE_H_PX = 68;  // card height in px (fixed)

  const fromX = (fromPct.x / 100) * cW;
  const fromY = (fromPct.y / 100) * cH + NODE_H_PX;
  const toX   = (toPct.x / 100) * cW;
  const toY   = (toPct.y / 100) * cH;

  const midY = fromY + (toY - fromY) / 2;
  const pathD = `M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`;

  if (!cW || !cH) return null;

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={cW}
      height={cH}
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={`grad-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#000" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.06" />
        </linearGradient>
        <marker id={`arrow-${id}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#000" fillOpacity="0.18" />
        </marker>
      </defs>

      {/* Static track */}
      <path d={pathD} stroke="rgba(0,0,0,0.06)" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Animated fill */}
      <motion.path
        d={pathD}
        stroke={`url(#grad-${id})`}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        markerEnd={`url(#arrow-${id})`}
        initial={{ pathLength: 0 }}
        animate={isActive ? { pathLength: 1 } : { pathLength: 0 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      />

      {/* Travelling dot */}
      {isActive && (
        <motion.circle
          r="3.5"
          fill="#000"
          fillOpacity="0.35"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <animateMotion dur="2s" repeatCount="indefinite" path={pathD} />
        </motion.circle>
      )}
    </svg>
  );
}

// ─── Single workflow node card ────────────────────────────────────────────────

function WorkflowNode({
  node,
  isActive,
  cW,
  cH,
}: {
  node: typeof WORKFLOW_NODES[0];
  isActive: boolean;
  cW: number;
  cH: number;
}) {
  // Position: horizontally centred on xPct, vertically at yPct
  // Card is 44% of canvas wide; left edge = xPct - 22%
  const leftPct = node.xPct - 22;
  const topPct  = node.yPct;

  return (
    <motion.div
      className="absolute"
      style={{
        left:   `${leftPct}%`,
        top:    `${topPct}%`,
        width:  '44%',
        zIndex: 10,
      }}
      initial={{ opacity: 0, scale: 0.6, y: 20 }}
      animate={{
        opacity: isActive ? 1 : 0.1,
        scale:   isActive ? 1 : 0.82,
        y: 0,
      }}
      transition={{
        duration: 0.65,
        delay:    node.delay / 1000,
        ease:     [0.34, 1.46, 0.64, 1],
      }}
    >
      <motion.div
        className="relative bg-white/95 backdrop-blur-xl rounded-xl p-3 border"
        style={{
          borderColor: isActive ? 'rgba(0,0,0,0.10)' : 'rgba(0,0,0,0.04)',
          boxShadow: isActive
            ? `0 16px 48px ${node.color}12, 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)`
            : '0 4px 16px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,1)',
        }}
        transition={{ duration: 0.4 }}
      >
        {/* Subtle glow */}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{ background: `radial-gradient(circle at 50% 50%, ${node.color}0e, transparent 70%)` }}
            animate={{ opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        )}

        <div className="relative flex items-center gap-2.5">
          {/* Icon badge */}
          <motion.div
            className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center relative overflow-hidden"
            style={{
              background: isActive ? node.color : 'rgba(0,0,0,0.04)',
              boxShadow:  isActive ? `0 4px 14px ${node.color}30` : 'none',
            }}
            animate={isActive ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {isActive && (
              <motion.div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)' }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
              />
            )}
            <div className="relative z-10" style={{ color: isActive ? 'white' : 'rgba(0,0,0,0.15)' }}>
              {node.icon}
            </div>
          </motion.div>

          {/* Status dot */}
          {isActive && (
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
              style={{ background: '#10b981', position: 'absolute', top: 0, right: 0, transform: 'translate(30%, -30%)' }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.4 }}
            >
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: '#10b981' }}
                animate={{ scale: [1, 2.2, 1], opacity: [0.7, 0, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          )}

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className={`font-bold text-[11px] leading-tight truncate transition-colors duration-500 ${isActive ? 'text-black' : 'text-black/15'}`}
               style={{ fontFamily: 'Sora, sans-serif' }}>
              {node.name}
            </p>
            <p className={`text-[9px] mt-0.5 truncate transition-colors duration-500 ${isActive ? 'text-black/45' : 'text-black/10'}`}
               style={{ fontFamily: 'Sora, sans-serif' }}>
              {node.subtitle}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function AdvancedWorkflowDemo() {
  const [activeStep, setActiveStep]       = useState(-1);
  const [workflowState, setWorkflowState] = useState<'idle' | 'executing' | 'executed'>('idle');
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize]       = useState({ w: 0, h: 0 });

  // Measure the actual canvas container so the SVG connections match exactly
  useEffect(() => {
    if (!canvasRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      setCanvasSize({
        w: entry.contentRect.width,
        h: entry.contentRect.height,
      });
    });
    ro.observe(canvasRef.current);
    return () => ro.disconnect();
  }, []);

  // 3D scroll effect — disabled on tiny screens (< 500px) for perf
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [6, 0, -6]);
  const rotateY = useTransform(scrollYProgress, [0, 0.5, 1], [-4, 0, 4]);
  const scale   = useTransform(scrollYProgress, [0, 0.5, 1], [0.94, 1, 0.94]);

  // Animation loop
  useEffect(() => {
    let timers: ReturnType<typeof setTimeout>[] = [];

    const runAnimation = () => {
      setActiveStep(-1);
      setWorkflowState('idle');

      timers.push(setTimeout(() => setWorkflowState('executing'), 600));

      WORKFLOW_NODES.forEach((node, i) => {
        timers.push(setTimeout(() => setActiveStep(i), node.delay + 600));
      });

      timers.push(setTimeout(() => setWorkflowState('executed'), 6200));
      // Restart after 9.5s
      timers.push(setTimeout(() => { timers.forEach(clearTimeout); timers = []; runAnimation(); }, 9500));
    };

    runAnimation();
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <section ref={containerRef} className="w-full py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6">

        {/* ── Canvas with 3D scroll effect ─────────────────────── */}
        <div className="relative mb-16 md:mb-28">
          <motion.div style={{ perspective: '1800px', transformStyle: 'preserve-3d' }}>
            <motion.div
              className="relative bg-gradient-to-br from-white via-neutral-50/30 to-white rounded-[2rem] md:rounded-[3rem] overflow-hidden mx-auto"
              style={{
                maxWidth: '820px',
                boxShadow: '0 48px 120px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,1), 0 0 0 1px rgba(0,0,0,0.03)',
                rotateX,
                rotateY,
                scale,
                transformStyle: 'preserve-3d',
              }}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* ── Workflow canvas — percentage-based ────────── */}
              <div className="relative py-10 md:py-14 px-6 md:px-12 flex items-center justify-center">
                {/*
                  The canvas div uses a fixed aspect ratio so all % positions
                  map to a consistent grid regardless of screen width.
                  We reserve 27% extra height at the bottom so nodes 3+4
                  (at yPct 69%) never crop.
                */}
                <div
                  ref={canvasRef}
                  className="relative w-full mx-auto"
                  style={{
                    maxWidth: '480px',
                    // aspectRatio keeps height proportional as width shrinks
                    aspectRatio: '480 / 440',
                  }}
                >
                  {/* SVG connections — rendered with actual measured pixel size */}
                  {canvasSize.w > 0 && (
                    <>
                      <AnimatedConnection id="c1" isActive={activeStep >= 1}
                        fromPct={{ x: WORKFLOW_NODES[0].xPct, y: WORKFLOW_NODES[0].yPct }}
                        toPct={{ x: WORKFLOW_NODES[1].xPct, y: WORKFLOW_NODES[1].yPct }}
                        cW={canvasSize.w} cH={canvasSize.h} />
                      <AnimatedConnection id="c2" isActive={activeStep >= 2}
                        fromPct={{ x: WORKFLOW_NODES[1].xPct, y: WORKFLOW_NODES[1].yPct }}
                        toPct={{ x: WORKFLOW_NODES[2].xPct, y: WORKFLOW_NODES[2].yPct }}
                        cW={canvasSize.w} cH={canvasSize.h} />
                      <AnimatedConnection id="c3" isActive={activeStep >= 2}
                        fromPct={{ x: WORKFLOW_NODES[1].xPct, y: WORKFLOW_NODES[1].yPct }}
                        toPct={{ x: WORKFLOW_NODES[3].xPct, y: WORKFLOW_NODES[3].yPct }}
                        cW={canvasSize.w} cH={canvasSize.h} />
                    </>
                  )}

                  {/* Node cards */}
                  {WORKFLOW_NODES.map((node, i) => (
                    <WorkflowNode
                      key={node.id}
                      node={node}
                      isActive={activeStep >= i}
                      cW={canvasSize.w}
                      cH={canvasSize.h}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Status badge */}
          <div className="flex justify-center mt-8 md:mt-10">
            <AnimatePresence mode="wait">
              {workflowState !== 'idle' && (
                <motion.div
                  key={workflowState}
                  className="px-6 py-2.5 bg-black text-white rounded-full flex items-center gap-2.5"
                  initial={{ opacity: 0, scale: 0.85, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85, y: 8 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.08)' }}
                >
                  {workflowState === 'executing' ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >⚡</motion.span>
                      <span className="text-sm font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
                        Workflow Executing
                      </span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
                        Workflow Executed
                      </span>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Feature Highlights ──────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 max-w-6xl mx-auto px-4">
          {FEATURES.map((feature, i) => {
            const on = activeStep >= feature.step;
            return (
              <motion.div
                key={feature.num}
                className="text-center"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.div animate={{ opacity: on ? 1 : 0.18 }} transition={{ duration: 0.5 }}>
                  <motion.div
                    className="text-6xl md:text-7xl font-black mb-4"
                    style={{ fontFamily: 'Sora, sans-serif' }}
                    animate={{ color: on ? '#000000' : '#d4d4d4', opacity: on ? 0.82 : 0.22 }}
                    transition={{ duration: 0.5 }}
                  >
                    {feature.num}
                  </motion.div>
                  <h4
                    className={`text-xl md:text-2xl font-bold mb-3 transition-colors duration-500 ${on ? 'text-black' : 'text-black/15'}`}
                    style={{ fontFamily: 'Sora, sans-serif' }}
                  >
                    {feature.title}
                  </h4>
                  <p
                    className={`text-sm md:text-base leading-relaxed transition-colors duration-500 ${on ? 'text-black/55' : 'text-black/12'}`}
                    style={{ fontFamily: 'Sora, sans-serif' }}
                  >
                    {feature.desc}
                  </p>
                  <div className="mt-5 h-0.5 flex justify-center">
                    <motion.div
                      className="h-full bg-black/60 rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: on ? '100%' : '0%' }}
                      transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
