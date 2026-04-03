"use client";
import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform } from 'motion/react';
import { Navigation } from '@/components/landing_page/navigation';
import { MobileNavigation } from '@/components/landing_page/mobile-navigation';
import { CustomCursor } from '@/components/landing_page/custom-cursor';
import { SmoothInteractiveBG } from '@/components/landing_page/smooth-interactive-bg';
import { HeroSection, ScrollIndicator } from '@/components/landing_page/hero-section';
import { SectionHeader } from '@/components/landing_page/section-header';
import { AdvancedWorkflowDemo } from '@/components/landing_page/advanced-workflow-demo';
import { FeatureGrid } from '@/components/landing_page/feature-grid';
import { NodeLibrary } from '@/components/landing_page/node-library';
import { WorkflowExamples3D } from '@/components/landing_page/workflow-examples-3d';
import { UseCases3D } from '@/components/landing_page/use-cases-3d';
import { ModernPricing } from '@/components/landing_page/modern-pricing';
import { FAQSection } from '@/components/landing_page/faq-section';
import { InteractiveTilt } from '@/components/landing_page/interactive-text-tilt';
import { Text3DEffect } from '@/components/landing_page/text-3d-effect';
import { LiquidGlassButton } from '@/components/landing_page/liquid-glass';
import {
  FlowingThreadsBG,
  WeavingPatternBG,
  RadialThreadsBG,
  DiagonalThreadsBG,
  FabricMeshBG,
  SpiralThreadsBG,
} from '@/components/landing_page/section-backgrounds';
import { WeaveLogo } from '@/components/landing_page/weave-logo-animated';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Page() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const ctx = gsap.context(() => {
      gsap.utils.toArray('.reveal-section').forEach((section: any) => {
        gsap.from(section, {
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            end: 'top 30%',
            scrub: 1,
          },
          y: 60,
          opacity: 0,
        });
      });
    }, containerRef);

    return () => {
      ctx.revert();
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen bg-white overflow-x-hidden">
      <CustomCursor />
      {isMobile ? <MobileNavigation /> : <Navigation />}

      {/* Hero Section */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6 md:px-8"
      >
        <SmoothInteractiveBG />
        <HeroSection heroY={heroY} heroOpacity={heroOpacity} isMobile={isMobile} />
        <ScrollIndicator />
      </section>

      {/* Visual Workflow Demo */}
      <section
        id="demo"
        className="reveal-section relative py-24 md:py-40 px-4 sm:px-6 md:px-8"
      >
        <FlowingThreadsBG />
        <div className="relative z-10 max-w-7xl mx-auto">
          <SectionHeader
            title="Build Workflows Visually"
            subtitle="Drag. Connect. Deploy. No code required—just pure visual automation."
          />
          <AdvancedWorkflowDemo />
        </div>
        {/* Smooth gradient transition to next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-white pointer-events-none" />
      </section>

      {/* Features Section */}
      <section id="features" className="reveal-section relative py-24 md:py-40 px-4 sm:px-6 md:px-8">
        <WeavingPatternBG />
        <div className="relative z-10 max-w-7xl mx-auto">
          <SectionHeader
            title="Everything You Need"
            subtitle="A complete platform for intelligent automation—from visual editor to enterprise security."
            maxWidth="xl"
          />
          <FeatureGrid />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-white pointer-events-none" />
      </section>

      {/* Use Cases */}
      <section className="reveal-section relative py-24 md:py-40 px-4 sm:px-6 md:px-8">
        <FabricMeshBG />
        <div className="relative z-10 max-w-7xl mx-auto">
          <SectionHeader
            title="Built for Every Team"
            subtitle="From marketing to engineering—automate workflows across your entire organization."
          />
          <UseCases3D />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-white pointer-events-none" />
      </section>

      {/* Node Library */}
      <section id="integrations" className="reveal-section relative py-24 md:py-40 px-4 sm:px-6 md:px-8">
        <RadialThreadsBG />
        <div className="relative z-10 max-w-7xl mx-auto">
          <SectionHeader
            title="15 Powerful Nodes"
            subtitle="Triggers and actions for every automation scenario—webhooks, AI, messaging, and more."
          />
          <NodeLibrary />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-white pointer-events-none" />
      </section>

      {/* Workflow Examples */}
      <section id="examples" className="reveal-section relative py-24 md:py-40 px-4 sm:px-6 md:px-8">
        <FabricMeshBG />
        <div className="relative z-10 max-w-7xl mx-auto">
          <SectionHeader
            title="Real-World Examples"
            subtitle="Proven workflow patterns you can deploy in minutes."
          />
          <WorkflowExamples3D />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-white pointer-events-none" />
      </section>

      {/* Pricing */}
      <section id="pricing" className="reveal-section relative py-24 md:py-40 px-4 sm:px-6 md:px-8">
        <DiagonalThreadsBG />
        <div className="relative z-10 max-w-7xl mx-auto">
          <SectionHeader 
            title="Simple, Transparent Pricing" 
            subtitle="Start free. Scale as you grow. No hidden fees."
          />
          <ModernPricing />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-white pointer-events-none" />
      </section>

      {/* FAQ */}
      <section className="reveal-section relative py-24 md:py-40 px-4 sm:px-6 md:px-8">
        <FabricMeshBG />
        <div className="relative z-10 max-w-4xl mx-auto">
          <SectionHeader 
            title="Frequently Asked Questions" 
            subtitle="Everything you need to know about Weave."
          />
          <FAQSection />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-white pointer-events-none" />
      </section>

      {/* Final CTA */}
      <section className="reveal-section relative py-24 md:py-40 px-4 sm:px-6 md:px-8">
        <SpiralThreadsBG />
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <InteractiveTilt>
              <Text3DEffect
                as="h2"
                className="text-5xl md:text-8xl font-bold mb-6 md:mb-8 tracking-tight"
                delay={0.2}
              >
                <span style={{ fontFamily: 'Sora, sans-serif' }}>
                  Ready to Automate?
                </span>
              </Text3DEffect>
            </InteractiveTilt>
            <motion.p
              className="text-lg md:text-2xl text-black/60 mb-8 md:mb-12 font-light px-4 max-w-2xl mx-auto"
              style={{ fontFamily: 'Sora, sans-serif' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Join thousands of teams building intelligent workflows with Weave.
              Start free—no credit card required.
            </motion.p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <LiquidGlassButton 
                variant="primary" 
                size="lg"
                onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Start Building Free
              </LiquidGlassButton>
              <LiquidGlassButton 
                variant="secondary" 
                size="lg"
                onClick={() => router.push('/docs')}
              >
                View Documentation
              </LiquidGlassButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="relative border-t border-black/10 py-12 md:py-20 px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-16 mb-12 md:mb-16">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <WeaveLogo className="w-8 h-8" />
              <h4 className="text-2xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
                Weave
              </h4>
            </div>
            <p className="text-sm text-black/50 leading-relaxed" style={{ fontFamily: 'Sora, sans-serif' }}>
              Visual workflow automation for intelligent systems. Build, deploy, and scale automated workflows without code.
            </p>
          </div>
          <FooterLinks title="Product" links={['Features', 'Integrations', 'Pricing', 'Examples']} />
          <FooterLinks title="Resources" links={['Documentation', 'API Reference', 'Templates', 'Community']} />
          <FooterLinks title="Company" links={['About', 'Blog', 'Careers', 'Contact']} />
        </div>
        <div className="pt-8 border-t border-black/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-black/40" style={{ fontFamily: 'Sora, sans-serif' }}>
            © 2026 Weave. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-black/40">
            <button className="hover:text-black transition-colors" style={{ fontFamily: 'Sora, sans-serif' }}>
              Privacy Policy
            </button>
            <button className="hover:text-black transition-colors" style={{ fontFamily: 'Sora, sans-serif' }}>
              Terms of Service
            </button>
            <button className="hover:text-black transition-colors" style={{ fontFamily: 'Sora, sans-serif' }}>
              Security
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLinks({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h5 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ fontFamily: 'Sora, sans-serif' }}>
        {title}
      </h5>
      <div className="space-y-3">
        {links.map((link) => (
          <button
            key={link}
            className="block text-sm text-black/60 hover:text-black transition-colors"
            style={{ fontFamily: 'Sora, sans-serif' }}
          >
            {link}
          </button>
        ))}
      </div>
    </div>
  );
}
