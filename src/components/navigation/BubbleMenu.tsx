'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface MenuItem {
  label: string;
  href: string;
  color?: string;
}

interface BubbleMenuProps {
  items: MenuItem[];
  logo?: React.ReactNode;
  onLoginClick?: () => void;
  onSignUpClick?: () => void;
}

export default function BubbleMenu({ items, logo, onLoginClick, onSignUpClick }: BubbleMenuProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [bubbleStyle, setBubbleStyle] = useState({ left: 0, width: 0 });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const updateBubble = (index: number) => {
    const item = itemRefs.current[index];
    if (item && navRef.current) {
      const navRect = navRef.current.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();
      setBubbleStyle({
        left: itemRect.left - navRect.left,
        width: itemRect.width,
      });
    }
  };

  const handleMouseEnter = (index: number) => {
    setActiveIndex(index);
    updateBubble(index);
  };

  const handleMouseLeave = () => {
    setActiveIndex(null);
  };

  const handleMobileMenuItemClick = () => {
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleResize = () => {
      if (activeIndex !== null) {
        updateBubble(activeIndex);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeIndex]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        // Scrolling up or at the top
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past threshold
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg border-b border-gray-200/50"
      initial={{ y: -100 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      style={{ backgroundColor: "rgba(55, 65, 81, 0.95)" }}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Image
              src="/logo/logo.png"
              alt="HalalMe Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="text-xl font-black text-white">HalalMe</span>
          </motion.div>

          {/* Desktop Bubble Menu Navigation */}
          <nav
            ref={navRef}
            className="hidden lg:flex items-center gap-1 relative"
            onMouseLeave={handleMouseLeave}
          >
            {/* Background Bubble */}
            <AnimatePresence>
              {activeIndex !== null && (
                <motion.div
                  className="absolute h-10 bg-gradient-to-r from-gray-600/30 to-gray-500/30 rounded-full border border-gray-400/40"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    left: bubbleStyle.left,
                    width: bubbleStyle.width,
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30
                  }}
                  style={{
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}
                />
              )}
            </AnimatePresence>

            {/* Menu Items */}
            {items.map((item, index) => (
              <a
                key={item.href}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                href={item.href}
                className="relative px-4 py-2 text-sm font-medium text-gray-300 transition-colors z-10 hover:text-white"
                onMouseEnter={() => handleMouseEnter(index)}
                style={{
                  color: activeIndex === index ? '#ffffff' : undefined,
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <motion.button
              className="text-sm font-medium text-gray-300"
              whileHover={{ scale: 1.05, color: "#ffffff" }}
              whileTap={{ scale: 0.95 }}
              onClick={onLoginClick}
            >
              Login
            </motion.button>
            <motion.button
              className="rounded-full bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-2 text-sm font-medium text-white border border-gray-500"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 10px 25px -5px rgba(107, 114, 128, 0.5)"
              }}
              whileTap={{ scale: 0.95 }}
              onClick={onSignUpClick}
            >
              Sign Up
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg text-gray-300"
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.svg
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </motion.svg>
              ) : (
                <motion.svg
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </motion.svg>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden overflow-hidden border-t border-gray-200/50"
          >
            <div className="px-6 py-4 space-y-2 bg-gray-700">
              {/* Mobile Menu Items */}
              {items.map((item, index) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  className="block py-3 px-4 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-600/50 transition-colors"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={handleMobileMenuItemClick}
                >
                  {item.label}
                </motion.a>
              ))}

              {/* Mobile Action Buttons */}
              <div className="pt-4 space-y-2 border-t border-gray-600/50">
                <motion.button
                  className="w-full py-3 px-4 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: items.length * 0.05 }}
                  onClick={() => {
                    handleMobileMenuItemClick();
                    onLoginClick?.();
                  }}
                >
                  Login
                </motion.button>
                <motion.button
                  className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-gray-600 to-gray-700 text-sm font-medium text-white border border-gray-500"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: (items.length + 1) * 0.05 }}
                  onClick={() => {
                    handleMobileMenuItemClick();
                    onSignUpClick?.();
                  }}
                >
                  Sign Up
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
