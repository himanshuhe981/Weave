"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WeaveLogo } from './weave-logo-animated';
import { LiquidGlassButton } from './liquid-glass';
import { Menu, X, ArrowRight, Palette, Zap, Plug, FileText, DollarSign } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export function MobileNavigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const scrollToSection = (id: string) => {
    // If not on the home page, redirect to the home page at the specific section
    if (pathname !== '/') {
      router.push(`/#${id}`);
      setIsMenuOpen(false);
      return;
    }

    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/80 backdrop-blur-2xl border-b border-black/10 shadow-lg shadow-black/5' : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => scrollToSection('hero')}
            className="flex items-center gap-2 hover:opacity-70 transition-opacity"
          >
            <WeaveLogo className="w-6 h-6" />
            <span className="text-lg font-semibold" style={{ fontFamily: 'Sora, sans-serif' }}>
              Weave
            </span>
          </button>

          {/* Hamburger Menu */}
          <motion.button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2.5 hover:bg-black/5 rounded-xl transition-colors relative"
            aria-label="Toggle menu"
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait">
              {isMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/30 backdrop-blur-md z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm z-50 overflow-y-auto"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              {/* Liquid Glass Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-stone-50/30 backdrop-blur-3xl" />
              
              {/* Border gradient */}
              <div 
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to bottom, rgba(120, 113, 108, 0.15), rgba(255, 255, 255, 0.05), rgba(120, 113, 108, 0.10))',
                  borderLeft: '1px solid rgba(120, 113, 108, 0.15)',
                }}
              />

              {/* Inner glow */}
              <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />

              <div className="relative z-10 p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-black/5 backdrop-blur-sm rounded-xl">
                      <WeaveLogo className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
                      Weave
                    </span>
                  </div>
                  <motion.button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2.5 hover:bg-black/5 rounded-xl transition-colors backdrop-blur-sm"
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>

                {/* Navigation Links */}
                <nav className="space-y-1 mb-8">
                  {[
                    { label: 'Demo', id: 'demo', icon: Palette },
                    { label: 'Product', id: 'features', icon: Zap },
                    { label: 'Integrations', id: 'integrations', icon: Plug },
                    { label: 'Workflows', id: 'examples', icon: FileText },
                    { label: 'Pricing', id: 'pricing', icon: DollarSign },
                  ].map((item, index) => (
                    <motion.button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className="group flex items-center justify-between w-full px-5 py-4 text-lg font-medium hover:bg-black/5 rounded-2xl transition-all"
                      style={{ fontFamily: 'Sora, sans-serif' }}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 + 0.1 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 text-black/70" />
                        {item.label}
                      </span>
                      <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.button>
                  ))}
                </nav>

                {/* CTA Buttons */}
                <div className="space-y-3">
                  <motion.button
                    onClick={() => scrollToSection('demo')}
                    className="w-full px-6 py-4 bg-black text-white rounded-full font-semibold hover:bg-black/90 transition-all"
                    style={{ fontFamily: 'Sora, sans-serif' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    See Demo
                  </motion.button>
                  <motion.button
                    onClick={() => router.push('/docs')}
                    className="w-full px-6 py-4 bg-white/50 backdrop-blur-sm border border-black/10 text-black rounded-full font-semibold hover:bg-white/80 transition-all"
                    style={{ fontFamily: 'Sora, sans-serif' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Documentation
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
