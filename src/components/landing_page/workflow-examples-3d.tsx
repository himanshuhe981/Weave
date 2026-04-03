"use client";

import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionValueEvent } from 'motion/react';
import { useState, useRef } from 'react';
import {
  FileText, Sparkles, MessageSquare, CreditCard, Send,
  Clock, Calendar, Globe, GitBranch, Zap, Mail, Database, Code
} from 'lucide-react';

interface WorkflowNode {
  icon: React.ReactNode;
  name: string;
  x: number;
  y: number;
}

interface WorkflowExample {
  title: string;
  description: string;
  tag: string;
  nodes: WorkflowNode[];
  connections: Array<{ from: number; to: number }>;
}

const WORKFLOWS: WorkflowExample[] = [
  {
    title: 'AI Form Processing', description: 'Intercept form submissions, seamlessly structure data using AI, and instantly distribute notifications down your team\'s pipeline.', tag: 'Popular',
    nodes: [
      { icon: <FileText className="w-5 h-5" />, name: 'Typeform', x: 80, y: 170 }, { icon: <Sparkles className="w-5 h-5" />, name: 'OpenAI', x: 330, y: 170 }, { icon: <MessageSquare className="w-5 h-5" />, name: 'Slack', x: 580, y: 170 },
    ],
    connections: [{ from: 0, to: 1 }, { from: 1, to: 2 }],
  },
  {
    title: 'Smart Payment Flow', description: 'Listen securely for cleared payments, route critical alerts conditionally, and dispatch transactional emails.', tag: 'E-commerce',
    nodes: [
      { icon: <CreditCard className="w-5 h-5" />, name: 'Stripe', x: 80, y: 170 }, { icon: <GitBranch className="w-5 h-5" />, name: 'Condition', x: 250, y: 170 }, { icon: <Mail className="w-4 h-4" />, name: 'Email', x: 500, y: 60 }, { icon: <MessageSquare className="w-4 h-4" />, name: 'Slack', x: 500, y: 280 },
    ],
    connections: [{ from: 0, to: 1 }, { from: 1, to: 2 }, { from: 1, to: 3 }],
  },
  {
    title: 'Autonomous Content Bot', description: 'Rely on a precise CRON schedule to wake up, autogenerate rich media assets safely, and broadcast to community spaces.', tag: 'Content',
    nodes: [
      { icon: <Calendar className="w-5 h-5" />, name: 'Schedule', x: 80, y: 170 }, { icon: <Sparkles className="w-5 h-5" />, name: 'Gemini', x: 330, y: 170 }, { icon: <MessageSquare className="w-5 h-5" />, name: 'Discord', x: 580, y: 170 },
    ],
    connections: [{ from: 0, to: 1 }, { from: 1, to: 2 }],
  },
  {
    title: 'Ingest & Transform', description: 'Capture webhook payloads securely, rigorously map custom backend fields, and push blindly into your data warehouse.', tag: 'Developer',
    nodes: [
      { icon: <Zap className="w-5 h-5" />, name: 'Webhook', x: 80, y: 170 }, { icon: <Code className="w-5 h-5" />, name: 'Function', x: 330, y: 170 }, { icon: <Database className="w-5 h-5" />, name: 'Data Ops', x: 580, y: 170 },
    ],
    connections: [{ from: 0, to: 1 }, { from: 1, to: 2 }],
  },
  {
    title: 'Pulse Health Monitoring', description: 'Deploy aggressive uptime monitors pinging crucial endpoints, automating failover logs completely without infrastructure layers.', tag: 'DevOps',
    nodes: [
      { icon: <Clock className="w-5 h-5" />, name: 'Timer', x: 80, y: 170 }, { icon: <Globe className="w-5 h-5" />, name: 'HTTP Ping', x: 330, y: 170 }, { icon: <Zap className="w-5 h-5" />, name: 'PagerDuty', x: 580, y: 170 },
    ],
    connections: [{ from: 0, to: 1 }, { from: 1, to: 2 }],
  },
  {
    title: 'Multi-Channel Crisis Grid', description: 'Build robust fail-safe frameworks routing critical parallel notification fans across entirely disparate matrices.', tag: 'Security',
    nodes: [
      { icon: <FileText className="w-5 h-5" />, name: 'Payload', x: 60, y: 170 }, { icon: <GitBranch className="w-5 h-5" />, name: 'Fan Out', x: 210, y: 170 }, { icon: <MessageSquare className="w-4 h-4" />, name: 'Slack', x: 520, y: 50 }, { icon: <Send className="w-4 h-4" />, name: 'Telegram', x: 520, y: 170 }, { icon: <Mail className="w-4 h-4" />, name: 'Email', x: 520, y: 290 },
    ],
    connections: [{ from: 0, to: 1 }, { from: 1, to: 2 }, { from: 1, to: 3 }, { from: 1, to: 4 }],
  },
];

const S_CURVE_PATH = `
  M 140 140 
  L 890 140 
  A 170 170 0 0 1 890 480
  L 310 480
  A 170 170 0 0 0 310 820
  L 890 820
  A 170 170 0 0 1 890 1160
  L 310 1160
  A 170 170 0 0 0 310 1500
  L 890 1500
  A 170 170 0 0 1 890 1840
  L 140 1840
`;

function WovenConnection({ from, to, index }: any) {
  const isHorizontal = Math.abs(from.y - to.y) < 10;
  
  let d = "";
  if (isHorizontal) {
     const midX = (from.x + to.x) / 2;
     d = `M ${from.x} ${from.y} Q ${midX} ${from.y + 16}, ${to.x} ${to.y}`;
  } else {
     const midX = (from.x + to.x) / 2;
     d = `M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`;
  }

  // Add micro-delays sequentially mapping across the network topology for graceful drawing entrances
  const entranceDelay = index === -1 ? 0 : index * 0.15;

  return (
    <g>
      {/* Cinematic slowly drawing structural connection wires entirely overriding abrupt reveals */}
      <motion.path 
         d={d} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="2.5" strokeLinecap="round" 
         initial={{ pathLength: 0, opacity: 0 }}
         whileInView={{ pathLength: 1, opacity: 1 }}
         viewport={{ once: true }}
         transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: entranceDelay }}
      />
      
      {index !== -1 && (
        <motion.path 
          d={d} fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round"
          initial={{ pathLength: 0.1, pathOffset: -0.1, opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          animate={{ pathOffset: 1.1 }} 
          transition={{ 
            opacity: { duration: 1.5, ease: "easeOut", delay: entranceDelay + 0.8 },
            pathOffset: { duration: 2.2, repeat: Infinity, ease: "linear", delay: index * 0.35 }
          }}
        />
      )}
    </g>
  )
}

function WovenNode({ node, index }: any) {
  return (
    <motion.g
      initial={{ scale: 0.5, opacity: 0, y: 15 }}
      whileInView={{ scale: 1, opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "50px" }}
      // Premium cubic-bezier mapping explicitly providing the 'slow modern fluid' behavior requested
      transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1], delay: index * 0.08 + 0.2 }}
      style={{ cursor: 'pointer', transformOrigin: `${node.x}px ${node.y}px` }}
      className="group"
      whileHover={{ scale: 1.08 }} 
    >
      <circle 
        cx={node.x} cy={node.y} r="26" 
        fill="#ffffff" 
        stroke="rgba(0,0,0,0.08)" strokeWidth="1.5"
        className="transition-all duration-500 shadow-sm group-hover:shadow-[0_15px_30px_rgba(0,0,0,0.12)]"
      />
      
      <foreignObject x={node.x - 14} y={node.y - 14} width="28" height="28" style={{ pointerEvents: 'none' }}>
        <div className="w-full h-full flex items-center justify-center text-black/60 group-hover:text-black transition-colors duration-500 scale-100 group-hover:scale-[1.12]">
          {node.icon}
        </div>
      </foreignObject>
      
      <text 
        x={node.x} y={node.y + 46} textAnchor="middle" 
        className="text-[12px] md:text-[13px] font-bold fill-black/60 group-hover:fill-black transition-colors duration-500" 
        style={{ fontFamily: 'Sora, sans-serif' }}
      >
        {node.name}
      </text>
    </motion.g>
  )
}

function ToggleRow({ workflow, index }: any) {
  const isEven = index % 2 === 0;
  const [isToggled, setIsToggled] = useState(isEven); 
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePosition({ x, y });
  };
  
  const handleMouseLeave = () => {
    setMousePosition({ x: 0.5, y: 0.5 });
  };

  const rotateX = (mousePosition.y - 0.5) * -10; 
  const rotateY = (mousePosition.x - 0.5) * 10;  

  const centerY = 140 + index * 340; 
  
  const knobPositionX = isToggled ? 740 : 0; 
  const canvasPositionX = isToggled ? 60 : 480; 

  const toIndices = workflow.connections.map((c: any) => c.to);
  const fromIndices = workflow.connections.map((c: any) => c.from);
  const rootNodes = workflow.nodes.map((_: any, i: number) => i).filter((i: number) => !toIndices.includes(i));
  const terminalNodes = workflow.nodes.map((_: any, i: number) => i).filter((i: number) => !fromIndices.includes(i));

  return (
    <motion.div 
       ref={containerRef}
       onMouseMove={handleMouseMove}
       onMouseLeave={handleMouseLeave}
       className="absolute w-full h-[340px] left-0 pointer-events-none group px-6 lg:px-0" 
       style={{ top: centerY - 170, perspective: '2000px' }}
       
       // Massive sweeping 3D reveals explicitly mimicking sophisticated high-end scroll mechanics (translate + rotate back)
       initial={{ opacity: 0, y: 140, rotateX: 15, scale: 0.96 }}
       whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
       viewport={{ once: true, margin: "-120px" }}
       transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} // Highly customized non-linear deceleration
    >
       <motion.div 
          className="w-full h-full relative"
          animate={{ rotateX, rotateY }}
          transition={{ type: 'spring', stiffness: 180, damping: 30 }}
          style={{ transformStyle: 'preserve-3d' }}
       >
           <motion.div 
             className="absolute top-0 bottom-0 w-[660px] pointer-events-auto z-10" 
             initial={false}
             animate={{ x: canvasPositionX }}
             transition={{ type: 'spring', stiffness: 300, damping: 32, mass: 1.2 }}
             style={{ transform: 'translateZ(10px)' }}
           >
              <svg viewBox="0 0 660 340" className="w-full h-full overflow-visible">
                 {isToggled ? ( 
                    terminalNodes.map((tIndex: number) => (
                      <WovenConnection key={`term-${tIndex}`} from={workflow.nodes[tIndex]} to={{ x: 680, y: 170 }} index={-1} />
                    ))
                 ) : ( 
                    rootNodes.map((rIndex: number) => (
                      <WovenConnection key={`root-${rIndex}`} from={{ x: -20, y: 170 }} to={workflow.nodes[rIndex]} index={-1} />
                    ))
                 )}

                 {workflow.connections.map((conn: any, i: number) => (
                   <WovenConnection key={`conn-${i}`} from={workflow.nodes[conn.from]} to={workflow.nodes[conn.to]} index={i} />
                 ))}
                 {workflow.nodes.map((node: any, i: number) => (
                   <WovenNode key={`node-${i}`} node={node} index={i} />
                 ))}
              </svg>
           </motion.div>

           <motion.div 
             className={`absolute top-0 bottom-0 w-[460px] rounded-[3.5rem] bg-gradient-to-b from-white to-[#fbfbfb] backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.03),inset_0_2px_4px_rgba(255,255,255,0.8),inset_0_-2px_4px_rgba(0,0,0,0.02)] border-[0.5px] border-black/5 ring-1 ring-black/[0.02] flex flex-col justify-center pointer-events-auto cursor-pointer z-20 active:cursor-grabbing hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)] transition-shadow duration-500`}
             initial={false}
             animate={{ x: knobPositionX }}
             whileTap={{ scale: 0.98 }} 
             transition={{ type: 'spring', stiffness: 300, damping: 32, mass: 1.2 }} 
             onClick={() => setIsToggled(!isToggled)} 
             style={{ transform: 'translateZ(30px)' }}
           >
              <div className="flex flex-col justify-center h-full max-w-[360px] mx-auto py-8 text-left">
                 <span className="inline-block px-3 py-1 bg-black/5 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-black/50 mb-4 w-max border-[0.5px] border-black/5 shadow-sm">
                   {workflow.tag}
                 </span>
                 <h3 className="text-3xl md:text-[2.25rem] font-bold mb-3 text-black tracking-tight leading-[1.05]" style={{ fontFamily: 'Sora, sans-serif' }}>
                   {workflow.title}
                 </h3>
                 <p className="text-[15px] text-black/50 leading-relaxed font-normal mt-1 tracking-wide">
                   {workflow.description}
                 </p>
              </div>
           </motion.div>
       </motion.div>
    </motion.div>
  )
}

export function WorkflowExamples3D() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    // Safely mapping the draw progress natively ensuring the path traces exactly when elements cross the mid-viewport bounds
    offset: ["start 65%", "end 75%"]
  });
  
  // Applying an ultra-luxurious physics spring directly to the raw continuous scroll data guaranteeing a buttery flawless trace
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 20,
    mass: 0.5,
    restDelta: 0.001
  });

  const maxScroll = useMotionValue(0);

  // Permanently lock the highest scroll progression achieving an irreversible downward-only drawing state
  useMotionValueEvent(smoothProgress, "change", (latest) => {
    if (latest > maxScroll.get()) {
      maxScroll.set(latest);
    }
  });

  // Explicitly binds the layout drawing mechanics to fluid scroll pixels starting minimally at 0.03
  const pathLength = useTransform(maxScroll, [0, 1], [0.03, 1]);

  return (
    <section ref={containerRef} className="w-full py-16 md:py-24 relative z-10 overflow-hidden">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      <div className="flex flex-col gap-6 px-4 md:hidden pb-10">
         {WORKFLOWS.map((wf, i) => (
             <motion.div 
               key={i} 
               className="w-full rounded-[2.5rem] bg-white border border-black/5 shadow-[0_15px_35px_rgba(0,0,0,0.06),inset_0_2px_4px_rgba(255,255,255,0.8)] p-6 sm:p-8 flex flex-col gap-4 relative overflow-hidden"
               // Gracefully scaled-down decelerations targeting native snappy mobile experiences
               initial={{ opacity: 0, y: 70, scale: 0.97 }}
               whileInView={{ opacity: 1, y: 0, scale: 1 }}
               viewport={{ once: true, margin: "-60px" }}
               transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}
             >
                <div className="flex flex-col z-10 relative">
                   <span className="inline-block px-3 py-1 bg-black/5 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-black/60 mb-3 w-max">
                     {wf.tag}
                   </span>
                   <h3 className="text-2xl font-extrabold mb-2 text-black tracking-tight leading-tight" style={{ fontFamily: 'Sora, sans-serif' }}>{wf.title}</h3>
                   <p className="text-[14px] text-black/50 leading-relaxed font-light">{wf.description}</p>
                </div>
                <div className="w-full mt-2 lg:mt-4">
                  <svg viewBox="0 0 660 340" className="w-full h-auto overflow-visible max-w-full drop-shadow-sm">
                     {wf.connections.map((conn: any, k: number) => (
                       <WovenConnection key={`conn-${k}`} from={wf.nodes[conn.from]} to={wf.nodes[conn.to]} index={k} />
                     ))}
                     {wf.nodes.map((node: any, k: number) => (
                       <WovenNode key={`node-${k}`} node={node} index={k} />
                     ))}
                  </svg>
                </div>
             </motion.div>
         ))}
      </div>

      <div className="hidden md:block w-full overflow-x-auto no-scrollbar pb-[100px] pt-[60px] scroll-smooth">
         <div className="w-full max-w-[1200px] min-w-[1200px] mx-auto relative h-[1980px]">
         
            <svg className="absolute inset-0 w-full h-[1980px] pointer-events-none z-0 overflow-visible">
               <filter id="recessed-shadow" x="-20%" y="-10%" width="140%" height="120%">
                  <feOffset dx="0" dy="16"/>
                  <feGaussianBlur stdDeviation="24" result="offset-blur"/>
                  <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse"/>
                  <feFlood floodColor="black" floodOpacity="0.12" result="color"/>
                  <feComposite operator="in" in="color" in2="inverse" result="shadow"/>
                  <feComposite operator="over" in="shadow" in2="SourceGraphic"/>
               </filter>

               {/* Cinematic deep path tracing bound explicitly dynamically to the user scroll action replacing blind viewport delays */}
               <motion.path 
                 d={S_CURVE_PATH}
                 fill="none" 
                 stroke="#eaebec" 
                 strokeWidth="280"
                 strokeLinecap="round"
                 strokeLinejoin="round"
                 style={{ filter: 'url(#recessed-shadow)', pathLength }}
               />
               
               <motion.path 
                 d={S_CURVE_PATH}
                 fill="none" 
                 stroke="rgba(0,0,0,0.025)" 
                 strokeWidth="4"
                 strokeDasharray="4 16"
                 strokeLinecap="round"
                 strokeLinejoin="round"
                 style={{ pathLength }}
               />
            </svg>

            {WORKFLOWS.map((wf, index) => (
               <ToggleRow key={index} workflow={wf} index={index} />
            ))}

         </div>
      </div>
    </section>
  );
}
