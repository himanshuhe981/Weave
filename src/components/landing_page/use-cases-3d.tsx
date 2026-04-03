"use client";

import { useRef } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import {
  Users, ShoppingCart, Code, Megaphone, Building2, Briefcase
} from 'lucide-react';

const USE_CASES = [
  {
    id: 'sales',
    icon: <Users className="w-6 h-6" />,
    title: 'Sales & CRM',
    description: 'Instantly sync leads and trigger deep follow‑ups without human intervention.',
  },
  {
    id: 'ecom',
    icon: <ShoppingCart className="w-6 h-6" />,
    title: 'E-commerce',
    description: 'Autonomously process complex orders and manage massive inventory fluctuations.',
  },
  {
    id: 'marketing',
    icon: <Megaphone className="w-6 h-6" />,
    title: 'Marketing',
    description: 'Mathematically schedule omni-channel content and analyze performance metrics.',
  },
  {
    id: 'dev',
    icon: <Code className="w-6 h-6" />,
    title: 'Development',
    description: 'Deploy rigorous code layers and automate strict testing pipelines securely.',
  },
  {
    id: 'ops',
    icon: <Building2 className="w-6 h-6" />,
    title: 'Operations',
    description: 'Streamline procedural approvals and trace deep supply chains universally.',
  },
  {
    id: 'hr',
    icon: <Briefcase className="w-6 h-6" />,
    title: 'Recruiting',
    description: 'Frictionlessly onboard mass teams and harvest actionable global feedback.',
  },
];

// Dense overlapping cluster — fills the entire canvas with no void center
// viewBox 1200×780  (wider than tall for a cinematic feel)
const D_NODES = [
  { x: 170,  y: 200, r: 195 }, // Sales      — far left, overlaps Recruiting + Ecom
  { x: 490,  y: 120, r: 175 }, // E-commerce — top-center-left, overlaps Sales
  { x: 780,  y: 180, r: 185 }, // Marketing  — top-center-right, overlaps Ecom + Dev
  { x: 1050, y: 300, r: 170 }, // Dev        — right, overlaps Marketing + Ops
  { x: 720,  y: 580, r: 210 }, // Operations — bottom-center, heaviest anchor
  { x: 320,  y: 540, r: 180 }, // Recruiting — bottom-left, overlaps Sales + Ops
];

// Edges define which nodes are connected — think of them as workflow dependencies
// Each pair [a, b] draws a cubic bezier between D_NODES[a] and D_NODES[b]
const D_EDGES: [number, number][] = [
  [0, 1], // Sales → Ecom
  [1, 2], // Ecom → Marketing
  [2, 3], // Marketing → Dev
  [3, 4], // Dev → Ops
  [4, 5], // Ops → Recruiting
  [5, 0], // Recruiting → Sales  (closes the loop)
  [1, 4], // Ecom → Ops   (cross-link — adds interior depth)
  [0, 5], // Sales → Recruiting  (tight cluster cross-link)
];

const M_EDGES: [number, number][] = [
  [0, 1], [0, 2], [1, 3], [2, 3], [2, 4], [3, 5], [4, 5],
];

// Generate a smooth quadratic-bezier path between two node centers
function edgePath(ax: number, ay: number, bx: number, by: number): string {
  const mx = (ax + bx) / 2;
  const my = (ay + by) / 2;
  // Perpendicular offset to make it curve nicely instead of a straight line
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.sqrt(dx * dx + dy * dy);
  const curve = Math.min(len * 0.25, 80);
  const cx = mx - (dy / len) * curve;
  const cy = my + (dx / len) * curve;
  return `M ${ax} ${ay} Q ${cx} ${cy} ${bx} ${by}`;
}
const M_NODES = [
  { x: 115, y: 115, r: 108 },
  { x: 295, y: 100, r: 98  },
  { x: 80,  y: 290, r: 102 },
  { x: 320, y: 295, r: 108 },
  { x: 130, y: 490, r: 100 },
  { x: 300, y: 495, r: 105 },
];

export function UseCases3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 90%', 'end 10%'],
  });

  useSpring(scrollYProgress, { stiffness: 50, damping: 25 });

  return (
    // TRANSPARENT — lets the existing animated background bleed through
    <div ref={containerRef} className="w-full relative py-16 lg:py-24 z-10">

      {/* ── Desktop Constellation (hidden on mobile) ─────────────────────── */}
      <div className="hidden lg:block relative w-full max-w-[1200px] mx-auto" style={{ aspectRatio: '1200/780' }}>

        {/* Thread SVG — individual animated bezier edges between neighboring nodes */}
        <svg
          viewBox="0 0 1200 780"
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 5 }}
          preserveAspectRatio="none"
        >
          {D_EDGES.map(([a, b], ei) => {
            const na = D_NODES[a];
            const nb = D_NODES[b];
            const d = edgePath(na.x, na.y, nb.x, nb.y);
            const totalLen = 400; // approximate edge perimeter for dasharray
            return (
              <g key={ei}>
                {/* Faint ghost guide */}
                <path d={d} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="1.8" strokeLinecap="round" />
                {/* Flowing animated dashes — each edge has a unique phase */}
                <path
                  d={d}
                  fill="none"
                  stroke="rgba(0,0,0,0.18)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeDasharray={`${totalLen * 0.18} ${totalLen * 0.82}`}
                  strokeDashoffset={0}
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from={0}
                    to={-totalLen}
                    dur={`${7 + ei * 1.3}s`}
                    repeatCount="indefinite"
                  />
                </path>
                {/* Tiny traveling dot */}
                <circle r="3.5" fill="black" fillOpacity="0.5">
                  <animateMotion
                    dur={`${6 + ei * 1.1}s`}
                    repeatCount="indefinite"
                    path={d}
                    keyTimes="0;1"
                    keyPoints="0;1"
                    calcMode="linear"
                  />
                </circle>
              </g>
            );
          })}
        </svg>

        {/* Bubble Nodes — positioned absolutely via percentage derived from viewBox */}
        {USE_CASES.map((item, i) => {
          const n = D_NODES[i];
          const pct = { left: `${(n.x / 1200) * 100}%`, top: `${(n.y / 780) * 100}%` };
          const diameter = n.r * 2;
          return (
            <BubbleNode
              key={item.id}
              item={item}
              idx={i}
              diameter={diameter}
              style={{
                position: 'absolute',
                left: pct.left,
                top: pct.top,
                width: diameter,
                height: diameter,
                marginLeft: -n.r,
                marginTop: -n.r,
              }}
            />
          );
        })}
      </div>

      {/* ── Mobile Grid (compact — all 6 bubbles in ~820px height) ──────── */}
      <div className="lg:hidden relative w-full max-w-[400px] mx-auto" style={{ height: 700 }}>

        <svg
          viewBox="0 0 400 700"
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 5 }}
        >
          {M_EDGES.map(([a, b], ei) => {
            const na = M_NODES[a];
            const nb = M_NODES[b];
            const d = edgePath(na.x, na.y, nb.x, nb.y);
            const totalLen = 250;
            return (
              <g key={ei}>
                <path d={d} fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="1.5" strokeLinecap="round" />
                <path
                  d={d}
                  fill="none"
                  stroke="rgba(0,0,0,0.2)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeDasharray={`${totalLen * 0.18} ${totalLen * 0.82}`}
                  strokeDashoffset={0}
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from={0}
                    to={-totalLen}
                    dur={`${6 + ei * 1.2}s`}
                    repeatCount="indefinite"
                  />
                </path>
                <circle r="3" fill="black" fillOpacity="0.45">
                  <animateMotion
                    dur={`${5 + ei * 1.0}s`}
                    repeatCount="indefinite"
                    path={d}
                  />
                </circle>
              </g>
            );
          })}
        </svg>

        {USE_CASES.map((item, i) => {
          const n = M_NODES[i];
          const diameter = n.r * 2;
          return (
            <BubbleNode
              key={item.id}
              item={item}
              idx={i}
              diameter={diameter}
              style={{
                position: 'absolute',
                left: `${(n.x / 400) * 100}%`,
                top: n.y,
                width: diameter,
                height: diameter,
                marginLeft: -n.r,
                marginTop: -n.r,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  BubbleNode — liquid-glass drop with animated interior & micro-interactions */
/* ─────────────────────────────────────────────────────────────────────────── */
function BubbleNode({ item, idx, diameter, style }: {
  item: typeof USE_CASES[0];
  idx: number;
  diameter: number;
  style: React.CSSProperties;
}) {
  const floatY = [-10, 6, -10];
  const dur = 4 + (idx % 4) * 0.9;
  const delay = idx * 0.35;

  return (
    <motion.div
      style={style}
      className="z-10"
      initial={{ opacity: 0, scale: 0.6, y: 40 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: '-8%' }}
      transition={{ duration: 1.1, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Slow ambient float */}
      <motion.div
        animate={{ y: floatY }}
        transition={{ repeat: Infinity, duration: dur, delay, ease: 'easeInOut' }}
        className="w-full h-full"
      >
        <motion.div
          whileHover={{ scale: 1.08, rotate: 1.5, zIndex: 60 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          className="group relative w-full h-full rounded-full flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden select-none"
          style={{
            // True liquid-glass: layered transparent fills + strong blur + specular rim
            background: 'radial-gradient(ellipse at 35% 28%, rgba(255,255,255,0.62) 0%, rgba(255,255,255,0.22) 60%, rgba(255,255,255,0.08) 100%)',
            backdropFilter: 'blur(22px) saturate(180%)',
            WebkitBackdropFilter: 'blur(22px) saturate(180%)',
            boxShadow: `
              inset 0 2px 2px rgba(255,255,255,0.85),
              inset 0 -2px 6px rgba(0,0,0,0.04),
              0 8px 40px rgba(0,0,0,0.07),
              0 2px 8px rgba(0,0,0,0.04)
            `,
            border: '1.5px solid rgba(255,255,255,0.55)',
          }}
        >
          {/* Specular highlight top-left — gives the "water drop" convex look */}
          <div
            className="pointer-events-none absolute rounded-full bg-white/60"
            style={{ width: '38%', height: '22%', top: '11%', left: '18%', filter: 'blur(6px)', transform: 'rotate(-20deg)' }}
          />

          {/* Ambient inner glow on hover */}
          <div className="pointer-events-none absolute inset-0 rounded-full transition-opacity duration-700 opacity-0 group-hover:opacity-100"
            style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.35) 0%, transparent 70%)' }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center px-5 max-w-[88%]">
            {/* Icon ring */}
            <motion.div
              whileHover={{ rotate: [0, -8, 8, 0] }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="w-11 h-11 lg:w-14 lg:h-14 rounded-full bg-black/80 text-white flex items-center justify-center mb-3 lg:mb-4 shadow-[0_6px_20px_rgba(0,0,0,0.25)] border border-white/15 ring-4 ring-white/10 flex-shrink-0"
            >
              {item.icon}
            </motion.div>

            <h3
              className="text-[0.9rem] lg:text-[1.15rem] font-bold text-black/90 tracking-tight leading-tight mb-1.5 lg:mb-2"
              style={{ fontFamily: 'Sora, sans-serif' }}
            >
              {item.title}
            </h3>

            <p className="text-[11px] lg:text-[13px] text-black/55 font-medium leading-snug">
              {item.description}
            </p>
          </div>

          {/* Bottom rim shadow — creates the "filled drop" depth */}
          <div
            className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
            style={{ width: '60%', height: '18%', background: 'rgba(0,0,0,0.04)', filter: 'blur(10px)' }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}  