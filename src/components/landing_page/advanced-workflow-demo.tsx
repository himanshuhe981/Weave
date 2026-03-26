"use client";

import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { useEffect, useState, useRef } from 'react';
import { FileText, Sparkles, MessageSquare, CheckCircle2, GitBranch } from 'lucide-react';

// Workflow nodes - CENTERED positioning
const WORKFLOW_NODES = [
  { 
    id: 1, 
    icon: <FileText className="w-6 h-6" />, 
    name: 'Google Form', 
    subtitle: 'New submission',
    color: '#4285F4',
    x: 170,
    y: 60,
    delay: 0
  },
  { 
    id: 2, 
    icon: <GitBranch className="w-6 h-6" />, 
    name: 'IF Condition', 
    subtitle: 'Check Priority',
    color: '#F59E0B',
    x: 170,
    y: 200,
    delay: 1500
  },
  { 
    id: 3, 
    icon: <Sparkles className="w-6 h-6" />, 
    name: 'OpenAI GPT-4', 
    subtitle: 'Urgent: AI Analysis',
    color: '#10A37F',
    x: 30,
    y: 360,
    delay: 3000,
    branch: 'left'
  },
  { 
    id: 4, 
    icon: <MessageSquare className="w-6 h-6" />, 
    name: 'Slack Alert', 
    subtitle: 'Normal: Queue',
    color: '#4A154B',
    x: 310,
    y: 360,
    delay: 3000,
    branch: 'right'
  },
];

// Enhanced animated connection
function AnimatedConnection({ 
  isActive, 
  from, 
  to,
  id 
}: { 
  isActive: boolean; 
  from: { x: number; y: number }; 
  to: { x: number; y: number };
  id: string;
}) {
  const fromX = from.x + 85;
  const fromY = from.y + 32;
  const toX = to.x + 85;
  const toY = to.y + 32;
  
  const dx = toX - fromX;
  const dy = toY - fromY;
  const controlX = fromX + dx / 2;
  const controlY = fromY + dy / 2;
  
  const pathD = `M ${fromX} ${fromY} Q ${controlX} ${controlY} ${toX} ${toY}`;
  
  return (
    <svg 
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={`grad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.08" />
        </linearGradient>
        <marker
          id={`arrow-${id}`}
          markerWidth="10"
          markerHeight="10"
          refX="8"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 10 3, 0 6" fill="#000000" fillOpacity="0.2" />
        </marker>
      </defs>
      
      <motion.path
        d={pathD}
        stroke={`url(#grad-${id})`}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        markerEnd={`url(#arrow-${id})`}
        initial={{ pathLength: 0 }}
        animate={isActive ? { pathLength: 1 } : { pathLength: 0 }}
        transition={{ 
          duration: 1,
          ease: [0.22, 1, 0.36, 1]
        }}
      />
      
      {isActive && (
        <motion.circle
          r="4"
          fill="#000000"
          fillOpacity="0.4"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0.5, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
        >
          <animateMotion dur="2.5s" repeatCount="indefinite" path={pathD} />
        </motion.circle>
      )}
    </svg>
  );
}

// Enhanced workflow node
function WorkflowNode({ 
  node, 
  isActive 
}: { 
  node: typeof WORKFLOW_NODES[0]; 
  isActive: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      className="absolute"
      style={{
        left: node.x,
        top: node.y,
        zIndex: 10,
      }}
      initial={{ opacity: 0, scale: 0.3, y: 40 }}
      animate={{ 
        opacity: isActive ? 1 : 0.12, 
        scale: isActive ? 1 : 0.75,
        y: 0,
      }}
      transition={{ 
        duration: 0.9, 
        delay: node.delay / 1000,
        ease: [0.34, 1.56, 0.64, 1] 
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div
        className="relative bg-white/98 backdrop-blur-2xl rounded-2xl p-4 border-2 cursor-pointer"
        style={{
          width: '170px',
          borderColor: isActive ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.04)',
          boxShadow: isActive 
            ? `0 20px 60px ${node.color}15, 0 0 0 1px rgba(255, 255, 255, 0.9), inset 0 1px 0 rgba(255, 255, 255, 1), inset 0 0 20px ${node.color}05`
            : '0 8px 25px rgba(0, 0, 0, 0.03), inset 0 1px 0 rgba(255, 255, 255, 1)',
        }}
        animate={{
          y: isHovered && isActive ? -6 : 0,
          scale: isHovered && isActive ? 1.03 : 1,
          boxShadow: isHovered && isActive 
            ? `0 30px 80px ${node.color}22, 0 0 0 1px rgba(255, 255, 255, 1), inset 0 1px 0 rgba(255, 255, 255, 1), inset 0 0 25px ${node.color}08`
            : isActive 
              ? `0 20px 60px ${node.color}15, 0 0 0 1px rgba(255, 255, 255, 0.9), inset 0 1px 0 rgba(255, 255, 255, 1), inset 0 0 20px ${node.color}05`
              : '0 8px 25px rgba(0, 0, 0, 0.03), inset 0 1px 0 rgba(255, 255, 255, 1)',
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 22 }}
      >
        {/* Enhanced glow effect */}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{ 
              background: `radial-gradient(circle at 50% 50%, ${node.color}10, transparent 65%)`,
            }}
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 3.5, repeat: Infinity }}
          />
        )}

        <div className="relative flex items-center gap-3">
          {/* Enhanced icon */}
          <div className="relative flex-shrink-0">
            <motion.div
              className="w-12 h-12 rounded-xl flex items-center justify-center relative overflow-hidden"
              style={{ 
                background: isActive ? node.color : 'rgba(0, 0, 0, 0.03)',
                boxShadow: isActive ? `0 6px 20px ${node.color}25, inset 0 1px 0 rgba(255, 255, 255, 0.2)` : 'none',
              }}
              animate={isActive ? { scale: [1, 1.06, 1] } : {}}
              transition={{ duration: 3.5, repeat: Infinity }}
            >
              {/* Shimmer effect */}
              {isActive && (
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)',
                  }}
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
                />
              )}
              <div className="relative z-10" style={{ color: isActive ? 'white' : 'rgba(0, 0, 0, 0.15)' }}>
                {node.icon}
              </div>
            </motion.div>
            
            {/* Enhanced pulse indicator */}
            {isActive && (
              <motion.div
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
                style={{ background: '#10b981' }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.5 }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ background: '#10b981' }}
                  animate={{ scale: [1, 2.5, 1], opacity: [0.7, 0, 0.7] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                />
              </motion.div>
            )}
          </div>

          {/* Text content */}
          <div className="flex-1 min-w-0">
            <h4 
              className={`font-bold text-xs mb-0.5 transition-colors duration-600 ${
                isActive ? 'text-black' : 'text-black/15'
              }`}
              style={{ fontFamily: 'Sora, sans-serif' }}
            >
              {node.name}
            </h4>
            <p 
              className={`text-[10px] transition-colors duration-600 ${
                isActive ? 'text-black/50' : 'text-black/10'
              }`}
              style={{ fontFamily: 'Sora, sans-serif' }}
            >
              {node.subtitle}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Feature highlights
const FEATURES = [
  { num: '01', title: 'Visual Builder', desc: 'Drag nodes and connect with threads', step: 0 },
  { num: '02', title: 'Smart Branching', desc: 'Conditional logic with IF nodes', step: 1 },
  { num: '03', title: 'Live Execution', desc: 'Watch workflows run in real-time', step: 2 },
];

export function AdvancedWorkflowDemo() {
  const [activeStep, setActiveStep] = useState(-1);
  const [workflowState, setWorkflowState] = useState<'idle' | 'executing' | 'executed'>('idle');
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 3D scroll effect
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [8, 0, -8]);
  const rotateY = useTransform(scrollYProgress, [0, 0.5, 1], [-5, 0, 5]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.92, 1, 0.92]);

  useEffect(() => {
    const runAnimation = () => {
      setActiveStep(-1);
      setWorkflowState('idle');

      setTimeout(() => setWorkflowState('executing'), 500);

      WORKFLOW_NODES.forEach((node, index) => {
        setTimeout(() => setActiveStep(index), node.delay);
      });

      setTimeout(() => setWorkflowState('executed'), 5500);
      setTimeout(() => runAnimation(), 8500);
    };

    runAnimation();
  }, []);

  return (
    <section ref={containerRef} className="w-full py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Workflow Canvas - CENTERED with 3D effects */}
        <div className="relative mb-20 md:mb-32">
          <motion.div
            style={{
              perspective: '2000px',
              transformStyle: 'preserve-3d',
            }}
          >
            <motion.div
              className="relative bg-gradient-to-br from-white via-neutral-50/20 to-white rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden mx-auto"
              style={{
                maxWidth: '900px',
                boxShadow: '0 60px 140px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 1), 0 0 0 1px rgba(0, 0, 0, 0.03)',
                rotateX,
                rotateY,
                scale,
                transformStyle: 'preserve-3d',
              }}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ 
                scale: 1.02,
                rotateX: -2,
                rotateY: 0,
                transition: { duration: 0.4 }
              }}
            >
              {/* Workflow Stage - Fully Responsive */}
              <div className="relative py-12 md:py-16 lg:py-20 px-4 md:px-8 lg:px-16 flex items-center justify-center">
                <div 
                  className="relative w-full mx-auto"
                  style={{ 
                    maxWidth: '500px',
                    height: 'auto',
                    aspectRatio: '500 / 460',
                  }}
                >
                  <div className="relative w-full h-full">
                    {/* Connections */}
                    <AnimatedConnection
                      id="c1"
                      isActive={activeStep >= 1}
                      from={{ x: 170, y: 60 }}
                      to={{ x: 170, y: 200 }}
                    />
                    <AnimatedConnection
                      id="c2"
                      isActive={activeStep >= 2}
                      from={{ x: 170, y: 200 }}
                      to={{ x: 30, y: 360 }}
                    />
                    <AnimatedConnection
                      id="c3"
                      isActive={activeStep >= 2}
                      from={{ x: 170, y: 200 }}
                      to={{ x: 310, y: 360 }}
                    />

                    {/* Nodes - Responsive */}
                    {WORKFLOW_NODES.map((node, index) => (
                      <WorkflowNode
                        key={node.id}
                        node={node}
                        isActive={activeStep >= index}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Status Badge */}
          <div className="flex justify-center mt-8 md:mt-12">
            <AnimatePresence mode="wait">
              {workflowState !== 'idle' && (
                <motion.div
                  key={workflowState}
                  className="px-7 md:px-10 py-3 md:py-4 bg-black text-white rounded-full border border-white/10 flex items-center gap-2.5 md:gap-3"
                  initial={{ opacity: 0, scale: 0.8, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  transition={{ duration: 0.5, type: 'spring', bounce: 0.2 }}
                  style={{
                    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
                  }}
                >
                  {workflowState === 'executing' ? (
                    <>
                      <motion.span
                        className="text-base md:text-lg"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        ⚡
                      </motion.span>
                      <span className="text-sm md:text-base font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
                        Workflow Executing
                      </span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="text-sm md:text-base font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
                        Workflow Executed
                      </span>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 max-w-6xl mx-auto px-4">
          {FEATURES.map((feature, i) => {
            const isHighlighted = activeStep >= feature.step;
            
            return (
              <motion.div
                key={feature.num}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.7 }}
              >
                <motion.div
                  animate={{
                    opacity: isHighlighted ? 1 : 0.2,
                  }}
                  transition={{ duration: 0.6 }}
                >
                  {/* Number */}
                  <motion.div 
                    className="text-6xl md:text-7xl lg:text-8xl font-black mb-4 md:mb-5"
                    style={{ 
                      fontFamily: 'Sora, sans-serif',
                      color: isHighlighted ? '#000000' : '#e5e5e5',
                      opacity: isHighlighted ? 0.85 : 0.25,
                    }}
                    animate={{
                      color: isHighlighted ? '#000000' : '#e5e5e5',
                      opacity: isHighlighted ? 0.85 : 0.25,
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    {feature.num}
                  </motion.div>

                  {/* Title */}
                  <h4 
                    className={`text-xl md:text-2xl font-bold mb-2.5 md:mb-3.5 transition-colors duration-500 ${
                      isHighlighted ? 'text-black' : 'text-black/18'
                    }`}
                    style={{ fontFamily: 'Sora, sans-serif' }}
                  >
                    {feature.title}
                  </h4>

                  {/* Description */}
                  <p 
                    className={`text-sm md:text-base lg:text-lg leading-relaxed transition-colors duration-500 ${
                      isHighlighted ? 'text-black/55' : 'text-black/15'
                    }`}
                    style={{ fontFamily: 'Sora, sans-serif' }}
                  >
                    {feature.desc}
                  </p>
                  
                  {/* Accent line */}
                  <div className="mt-5 md:mt-6 h-1 w-full flex justify-center">
                    <motion.div 
                      className="h-full bg-black/65 rounded-full"
                      initial={{ width: '0%' }}
                      animate={{
                        width: isHighlighted ? '100%' : '0%',
                      }}
                      transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
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
