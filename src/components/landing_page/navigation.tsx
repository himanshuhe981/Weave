"use client";

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { WeaveLogo } from './weave-logo-animated';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    // If not on the home page, redirect to the home page at the specific section
    if (pathname !== '/') {
      router.push(`/#${id}`);
      return;
    }
    
    // Smooth scroll if already on the home page
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 backdrop-blur-xl border-b border-black/5' : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => scrollToSection('hero')}
          className="flex items-center gap-2 hover:opacity-70 transition-opacity"
        >
          <WeaveLogo className="w-8 h-8" />
          <span className="text-xl font-semibold" style={{ fontFamily: 'Sora, sans-serif' }}>
            Weave
          </span>
        </button>

        {/* Navigation Links */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => scrollToSection('features')}
            className="text-sm font-medium hover:opacity-60 transition-opacity"
            style={{ fontFamily: 'Sora, sans-serif' }}
          >
            Product
          </button>
          <button
            onClick={() => scrollToSection('integrations')}
            className="text-sm font-medium hover:opacity-60 transition-opacity"
            style={{ fontFamily: 'Sora, sans-serif' }}
          >
            Integrations
          </button>
          <button
            onClick={() => scrollToSection('examples')}
            className="text-sm font-medium hover:opacity-60 transition-opacity"
            style={{ fontFamily: 'Sora, sans-serif' }}
          >
            Workflows
          </button>
          <button
            onClick={() => scrollToSection('pricing')}
            className="text-sm font-medium hover:opacity-60 transition-opacity"
            style={{ fontFamily: 'Sora, sans-serif' }}
          >
            Pricing
          </button>
          <Link
            href="/docs"
            className="text-sm font-medium hover:opacity-60 transition-opacity"
            style={{ fontFamily: 'Sora, sans-serif' }}
          >
            Docs
          </Link>
          <button
            onClick={() => scrollToSection('demo')}
            className="px-6 py-2.5 bg-black text-white rounded-full text-sm font-medium hover:bg-black/80 transition-all"
            style={{ fontFamily: 'Sora, sans-serif' }}
          >
            See Demo
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
