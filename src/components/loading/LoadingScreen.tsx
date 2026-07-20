'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Image from 'next/image';

const WORDMARK = ['H', 'a', 'l', 'a', 'l', 'M', 'e'];

export default function LoadingScreen({ onLoadingComplete }: { onLoadingComplete?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const letters   = container.querySelectorAll('.loading-letter');
    const tagline   = container.querySelector('.loading-tagline');
    const mainLogo  = container.querySelector('.loading-main-logo');

    gsap.set(mainLogo, { opacity: 0, scale: 0.5, y: 20 });
    gsap.set(tagline,  { opacity: 0, y: 10 });
    gsap.set(container, { clipPath: 'circle(150% at 50% 50%)' });

    const tl = gsap.timeline({
      defaults: { ease: 'expo.inOut' },
      onComplete: () => onLoadingComplete?.(),
    });

    // Phase 1 - logo springs in
    tl.to(mainLogo, {
      opacity: 1, scale: 1, y: 0,
      duration: 0.75,
      ease: 'back.out(1.6)',
    }, 0.05);

    // Phase 2 - wordmark letters rise in
    tl.from(letters, {
      yPercent: 100,
      stagger: 0.03,
      duration: 1.1,
    }, 0.4);

    // Tagline fades in
    tl.to(tagline, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 1.6);

    // Hold
    tl.to({}, { duration: 0.55 }, 2.1);

    // Phase 3 - exit
    tl.to(letters,  { yPercent: -100, stagger: 0.02, duration: 0.4, ease: 'expo.in' }, 2.65);
    if (tagline)  tl.to(tagline,  { opacity: 0, y: -12, duration: 0.3 }, 2.65);
    if (mainLogo) tl.to(mainLogo, { opacity: 0, scale: 1.15, y: -16, duration: 0.4 }, 2.65);

    tl.to(container, {
      clipPath: 'circle(0% at 50% 50%)',
      duration: 0.72,
      ease: 'power2.inOut',
    }, 2.72);

    return () => {
      tl.kill();
    };
  }, [onLoadingComplete]);

  return (
    <div ref={containerRef} className="loading-header">
      <div className="loading-loader">

        {/* Logo */}
        <div className="loading-main-logo">
          <div className="loading-logo-circle">
            <Image src="/logo/logo.png" alt="HalalMe" width={80} height={80} priority className="object-contain w-full h-full" />
          </div>
        </div>

        {/* Wordmark */}
        <div className="loading-h1">
          {WORDMARK.map((char, i) => (
            <span key={i} className="loading-letter-wrap">
              <span className="loading-letter">{char}</span>
            </span>
          ))}
        </div>

        {/* Tagline */}
        <p className="loading-tagline">Halal Living, Simplified</p>

      </div>
    </div>
  );
}
