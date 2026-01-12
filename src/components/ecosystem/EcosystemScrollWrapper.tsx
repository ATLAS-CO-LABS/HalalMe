'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

interface EcosystemScrollWrapperProps {
  children: React.ReactNode[];
}

interface AnimatedSectionProps {
  children: React.ReactNode;
  scrollYProgress: MotionValue<number>;
  index: number;
  sectionCount: number;
}

/**
 * Individual animated section component
 * - Separated to avoid hooks in loops
 */
function AnimatedSection({ children, scrollYProgress, index, sectionCount }: AnimatedSectionProps) {
  // Calculate when this section should be visible
  // Each section gets 1/sectionCount of the scroll progress
  const sectionStart = index / sectionCount;
  const sectionEnd = (index + 1) / sectionCount;

  // Opacity: fade in at start, fade out at end
  const opacity = useTransform(
    scrollYProgress,
    [
      Math.max(0, sectionStart - 0.1), // Start fading in slightly before
      sectionStart,                     // Fully visible
      sectionEnd - 0.05,                // Stay visible
      sectionEnd                        // Start fading out
    ],
    [0, 1, 1, 0]
  );

  // Y position: slide up on enter, slide up more on exit
  const y = useTransform(
    scrollYProgress,
    [
      Math.max(0, sectionStart - 0.1),
      sectionStart,
      sectionEnd - 0.05,
      sectionEnd
    ],
    [100, 0, 0, -100]
  );

  return (
    <motion.div
      className="absolute inset-0 w-full"
      style={{
        opacity,
        y,
        // Ensure sections stack properly (later sections on top)
        zIndex: index
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Scroll-driven pinned experience for ecosystem sections
 * - Pins the container on scroll
 * - Shows one section at a time with fade + slide transitions
 * - Controlled by scroll progress
 * - Mobile: disabled (stacked sections with light fade-in)
 */
export default function EcosystemScrollWrapper({ children }: EcosystemScrollWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Track scroll progress through the container
  // IMPORTANT: Must call hooks unconditionally before any early returns
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  // Detect mobile breakpoint
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const sectionCount = children.length;

  // Mobile fallback: simple stacked sections with fade-in
  if (isMobile) {
    return (
      <div className="space-y-0">
        {children.map((child, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {child}
          </motion.div>
        ))}
      </div>
    );
  }

  // Desktop: scroll-pinned behavior
  return (
    <div
      ref={containerRef}
      className="relative"
      style={{
        // Reduced scroll distance - more compact
        height: `${sectionCount * 60}vh`
      }}
    >
      {/* Sticky container that stays in viewport */}
      <div className="sticky top-0 h-screen overflow-hidden">
        {children.map((child, index) => (
          <AnimatedSection
            key={index}
            scrollYProgress={scrollYProgress}
            index={index}
            sectionCount={sectionCount}
          >
            {child}
          </AnimatedSection>
        ))}
      </div>
    </div>
  );
}
