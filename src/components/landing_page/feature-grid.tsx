"use client";

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { 
  Zap, Sparkles, Shield, Workflow, Boxes, 
  Code2, Clock, GitMerge, Gauge
} from 'lucide-react';
import { WeaveLogo } from './weave-logo-animated';

const BENTO_FEATURES = [
  {
    icon: <Zap className="w-7 h-7 md:w-10 md:h-10 text-white" />,
    title: 'Visual Node Editor',
    description: 'Drag-and-drop canvas. Build complex logic without a single line of code.',
    // mobile: full-width (2 cols); tablet: 2-col; desktop: 2-col 2-row
    classes: 'col-span-2 sm:col-span-2 lg:col-span-2 lg:row-span-2',
    isLarge: true,
  },
  {
    icon: <Sparkles className="w-5 h-5 md:w-8 md:h-8 text-black" />,
    title: 'Native AI Integration',
    description: 'OpenAI, Gemini, and Claude built natively into every pipeline.',
    classes: 'col-span-2 sm:col-span-2 lg:col-span-2 lg:row-span-1',
    isWide: true,
  },
  {
    icon: <Shield className="w-5 h-5 text-black" />,
    title: 'Enterprise Security',
    description: 'End-to-end AES-256 encryption with full audit tracking.',
    classes: 'col-span-1 lg:col-span-1 lg:row-span-1',
  },
  {
    icon: <Workflow className="w-5 h-5 text-black" />,
    title: 'Real-Time Execution',
    description: 'Sub-millisecond trigger latency, globally distributed.',
    classes: 'col-span-1 lg:col-span-1 lg:row-span-1',
  },
  {
    icon: <Boxes className="w-5 h-5 text-black" />,
    title: 'Template Library',
    description: '500+ pre-built workflows ready to deploy instantly.',
    classes: 'col-span-1 lg:col-span-1 lg:row-span-1',
  },
  {
    icon: <Code2 className="w-5 h-5 md:w-8 md:h-8 text-black" />,
    title: 'Developer-First API',
    description: 'REST API, webhooks, TypeScript SDK, and CLI for power users.',
    classes: 'col-span-1 sm:col-span-2 lg:col-span-2 lg:row-span-1',
    isWide: true,
  },
  {
    icon: <Clock className="w-5 h-5 text-black" />,
    title: 'Precision CRON',
    description: 'Recurring tasks scheduled and synced globally.',
    classes: 'col-span-1 lg:col-span-1 lg:row-span-1',
  },
  {
    icon: <GitMerge className="w-5 h-5 md:w-8 md:h-8 text-black" />,
    title: 'Version Control',
    description: 'Track changes, rollback deployments, and branch logic safely.',
    classes: 'col-span-2 sm:col-span-2 lg:col-span-2 lg:row-span-1',
    isWide: true,
  },
  {
    icon: <Gauge className="w-5 h-5 md:w-8 md:h-8 text-black" />,
    title: 'Performance Analytics',
    description: 'Monitor latency, success rates, and resources visually.',
    classes: 'col-span-2 sm:col-span-2 lg:col-span-2 lg:row-span-1',
    isWide: true,
  },
];

function BentoCard({ item, index, isMobile }: any) {
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isMobile) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    setIsHovered(false);
    setMousePosition({ x: 0.5, y: 0.5 });
  };

  const rotateX = isHovered && !isMobile ? (mousePosition.y - 0.5) * -15 : 0;
  const rotateY = isHovered && !isMobile ? (mousePosition.x - 0.5) * 15 : 0;

  return (
    <motion.div
       ref={cardRef}
       onMouseMove={handleMouseMove}
       onMouseEnter={() => !isMobile && setIsHovered(true)}
       onMouseLeave={handleMouseLeave}
       className={`${item.classes} relative perspective-[2000px] w-full h-full`}
       initial={{ opacity: 0, y: 40 }}
       whileInView={{ opacity: 1, y: 0 }}
       viewport={{ once: true, margin: "-30px" }}
       transition={{ duration: 0.6, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
    >
       <motion.div 
         animate={{ 
           rotateX, 
           rotateY, 
           z: isHovered && !isMobile ? 30 : 0, 
           scale: isHovered && !isMobile ? 1.02 : 1 
         }}
         transition={{ type: 'spring', stiffness: 400, damping: 30, mass: 0.8 }}
         style={{ transformStyle: 'preserve-3d' }}
         className={`relative w-full h-full rounded-[2.25rem] bg-white/60 backdrop-blur-[24px] border border-white/80 overflow-hidden group`}
       >
         {/* Exceptionally deep modernized shadow natively detached projecting elegantly beneath the liquid-glass hull */}
         <motion.div
            className="absolute -inset-2 rounded-[2.5rem] pointer-events-none transition-shadow duration-500 z-[-1]"
            style={{ 
               boxShadow: isHovered && !isMobile 
                 ? '0 40px 80px rgba(0,0,0,0.1), 0 20px 40px rgba(0,0,0,0.06), inset 0 2px 4px rgba(255,255,255,0.9)' 
                 : '0 10px 30px rgba(0,0,0,0.04), inset 0 1px 2px rgba(255,255,255,0.8)'
            }}
         />

         {/* Internal localized light source tracking exclusively following the users cursor strictly enacting true frosted WebGL mechanics */}
         {!isMobile && (
           <motion.div 
              className="absolute inset-0 pointer-events-none z-0 mix-blend-overlay"
              animate={{ 
                background: isHovered 
                  ? `radial-gradient(800px circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(255,255,255,1), transparent 40%)` 
                  : `radial-gradient(800px circle at 50% 50%, rgba(255,255,255,0), transparent 40%)` 
              }}
              transition={{ type: 'tween', ease: 'linear', duration: 0.1 }}
           />
         )}

         {/* Native massively scaled Weave thematic explicit background integration exclusively on the hero 2x2 box */}
         {item.isLarge && (
             <div className="absolute -bottom-20 -right-20 w-[360px] md:w-[440px] opacity-[0.03] group-hover:opacity-[0.05] pointer-events-none transition-all duration-700 group-hover:-rotate-6 group-hover:scale-105 group-hover:-translate-y-4 text-black" style={{ transform: 'translateZ(-10px)' }}>
                 <WeaveLogo className="w-full h-full text-black" />
             </div>
         )}

         {/* Organic Weave thematic SVG connection threads baked immutably into the background layers of all huge wide matrices! */}
         {item.isWide && (
             <svg viewBox="0 0 400 100" className="absolute inset-0 w-full h-full opacity-[0.025] group-hover:opacity-[0.06] pointer-events-none transition-opacity duration-700 text-black" preserveAspectRatio="none" style={{ transform: 'translateZ(-5px)' }}>
                <path d="M0,50 C100,20 300,80 400,50" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M0,80 C150,110 250,-10 400,20" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M0,20 C100,60 300,-20 400,80" fill="none" stroke="currentColor" strokeWidth="2" />
             </svg>
         )}

         {/* Internal content arrays isolated 20px off the frosty bounding creating violent stunning 3D parallax offsets identically natively */}
         {item.isWide ? (
             <div className="p-4 md:p-8 flex flex-col sm:flex-row h-full justify-between items-start sm:items-center relative z-10 w-full" style={{ transform: !isMobile ? 'translateZ(24px)' : 'none' }}>
                <div className="flex flex-col z-10 w-full sm:max-w-[75%]">
                   <div className="w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/80 flex items-center justify-center mb-3 md:mb-4 border border-white/60 shadow-sm transform group-hover:scale-110 transition-transform duration-500 backdrop-blur-md">
                     {item.icon}
                   </div>
                   <h3 className="text-base md:text-2xl font-extrabold mb-1 md:mb-2 text-black tracking-tight" style={{ fontFamily: 'Sora, sans-serif' }}>{item.title}</h3>
                   <p className="text-[12px] md:text-[15px] font-medium text-black/50 leading-relaxed">{item.description}</p>
                </div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 opacity-[0.025] group-hover:opacity-[0.05] group-hover:-translate-x-6 transition-all duration-700 pointer-events-none text-black hidden sm:block">
                   <div style={{ transform: 'scale(10)' }}>{item.icon}</div>
                </div>
             </div>
          ) : item.isLarge ? (
             <div className="p-5 md:p-10 flex flex-col justify-between h-full relative z-10 w-full" style={{ transform: !isMobile ? 'translateZ(24px)' : 'none' }}>
                <div className="flex flex-col z-10">
                   <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-[1.25rem] bg-black flex items-center justify-center mb-4 md:mb-8 shadow-xl shadow-black/20 transform group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                     {item.icon}
                   </div>
                   <h3 className="text-2xl md:text-[2.5rem] font-black mb-2 md:mb-4 text-black tracking-tight leading-[1.1]" style={{ fontFamily: 'Sora, sans-serif' }}>{item.title}</h3>
                   <p className="text-[13px] md:text-[17px] text-black/60 font-medium leading-relaxed">{item.description}</p>
                </div>
             </div>
          ) : (
             <div className="p-4 md:p-8 flex flex-col justify-between h-full relative z-10 w-full" style={{ transform: !isMobile ? 'translateZ(24px)' : 'none' }}>
                <div className="w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/80 flex items-center justify-center border border-white/60 shadow-sm transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 backdrop-blur-md">
                  {item.icon}
                </div>
                <div className="mt-3 md:mt-8">
                  <h3 className="text-sm md:text-xl font-bold mb-1 md:mb-2 text-black tracking-tight" style={{ fontFamily: 'Sora, sans-serif' }}>{item.title}</h3>
                  <p className="text-[11px] md:text-[14px] font-medium text-black/50 leading-relaxed">{item.description}</p>
                </div>
             </div>
          )}
       </motion.div>
    </motion.div>
  )
}

export function FeatureGrid() {
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    // Triggers exactly spanning the entry and exit offsets across the physical bounds
    offset: ["start end", "end start"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 20,
    mass: 0.5,
    restDelta: 0.001
  });

  // Enacting cinematic 3D tilts! Laying back initially on entrance, leveling out to 0 perfectly flat over the 30-70% scroll focal gap, then pitching forward natively 
  const rotateX = useTransform(smoothProgress, [0, 0.3, 0.7, 1], [30, 0, 0, -20]);
  const rotateY = useTransform(smoothProgress, [0, 0.4, 0.6, 1], [5, 0, 0, -5]); 
  const scale = useTransform(smoothProgress, [0, 0.3, 0.7, 1], [0.8, 1, 1, 0.85]);
  const z = useTransform(smoothProgress, [0, 0.3, 0.7, 1], [-300, 0, 0, -150]);

  return (
    <div ref={containerRef} className="relative w-full mt-10 md:mt-24 pb-10 md:pb-20 perspective-[2500px]">
       <motion.div
         className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] bg-black/[0.04] blur-[100px] rounded-full pointer-events-none z-[-1]"
         style={{ scale }}
       />

       <motion.div
          className={
            // Mobile: compact 2-col grid with short rows
            // sm (≥640): 2-col with medium rows
            // lg (≥1024): 4-col bento with tall rows
            "grid grid-cols-2 lg:grid-cols-4 grid-flow-row-dense " +
            "auto-rows-[140px] sm:auto-rows-[190px] lg:auto-rows-[280px] " +
            "gap-3 md:gap-6"
          }
          style={{
             rotateX: isMobile ? 0 : rotateX,
             rotateY: isMobile ? 0 : rotateY,
             scale: isMobile ? 1 : scale,
             z: isMobile ? 0 : z,
             transformStyle: 'preserve-3d',
          }}
       >
         {BENTO_FEATURES.map((item, index) => (
           <BentoCard key={index} item={item} index={index} isMobile={isMobile} />
         ))}
       </motion.div>
    </div>
  );
}