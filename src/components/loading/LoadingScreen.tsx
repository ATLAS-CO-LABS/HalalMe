'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Image from 'next/image';

interface LoadingScreenProps {
  onLoadingComplete?: () => void;
}

const SERVICES = [
  { num: '01', name: 'Delivery', tagline: 'Halal food at your door',     image: '/images/services/halal01.jpg', accent: '#B96AF0', logoColor: '#5E188F', style: { left:  '3%', top: '5%'  } },
  { num: '02', name: 'Kitchen',  tagline: 'AI-powered recipes',           image: '/images/services/halal02.png', accent: '#F03E9E', logoColor: '#F03E9E', style: { right: '3%', top: '5%'  } },
  { num: '03', name: 'Social',   tagline: 'The halal social network',     image: '/images/services/halal03.png', accent: '#F59E0B', logoColor: '#F59E0B', style: { left:  '2%', top: '74%' } },
  { num: '04', name: 'Rewards',  tagline: 'Earn points, give to charity', image: '/images/services/halal04.png', accent: '#14B8A6', logoColor: '#14B8A6', style: { right: '2%', top: '74%' } },
];

const WORDMARK = ['H', 'a', 'l', 'a', 'l', 'M', 'e'];

export default function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const letters  = container.querySelectorAll('.loading-letter');
    const badges   = container.querySelectorAll('.loading-badge');
    const tagline  = container.querySelector('.loading-tagline');
    const mainLogo = container.querySelector('.loading-main-logo');

    gsap.set(badges,    { opacity: 0, scale: 0.65, y: 24 });
    gsap.set(mainLogo,  { opacity: 0, scale: 0.5,  y: 20 });
    gsap.set(container, { clipPath: 'circle(150% at 50% 50%)' });

    const tl = gsap.timeline({
      defaults: { ease: 'expo.inOut' },
      onComplete: () => onLoadingComplete?.(),
    });

    // Phase 1a — main logo springs in
    tl.to(mainLogo, {
      opacity: 1, scale: 1, y: 0,
      duration: 0.75,
      ease: 'back.out(1.6)',
    }, 0.05);

    // Phase 1b — service badges drift in
    tl.to(badges, {
      opacity: 1, scale: 1, y: 0,
      stagger: 0.1,
      duration: 0.65,
      ease: 'back.out(1.4)',
    }, 0);

    // Start independent floating loops
    tl.call(() => {
      badges.forEach((badge, i) => {
        gsap.to(badge, {
          y:        i % 2 === 0 ? -14 : 12,
          x:        i % 3 === 0 ?   7 : -7,
          rotation: i % 2 === 0 ?   2 : -2,
          duration: 2.2 + i * 0.38,
          yoyo: true, repeat: -1,
          ease: 'sine.inOut',
        });
      });
    }, [], 0.7);

    // Phase 2 — wordmark letters rise in
    tl.from(letters, {
      yPercent: 100,
      stagger:  0.03,
      duration: 1.1,
    }, 0.4);

    // Tagline fades in during hold
    if (tagline) tl.from(tagline, { opacity: 0, y: 10, duration: 0.5, ease: 'power2.out' }, 1.6);

    // Phase 3 — hold
    tl.to({}, { duration: 0.55 }, 2.1);

    // Phase 4 — exit
    tl.call(() => gsap.killTweensOf(badges), [], 2.65);

    tl.to(badges, {
      opacity: 0, y: -28, scale: 0.65,
      stagger: 0.06,
      duration: 0.4,
    }, 2.65);

    if (tagline)  tl.to(tagline,  { opacity: 0, y: -12, duration: 0.3 }, 2.65);
    if (mainLogo) tl.to(mainLogo, { opacity: 0, scale: 1.15, y: -16, duration: 0.4 }, 2.65);

    tl.to(container, {
      clipPath: 'circle(0% at 50% 50%)',
      duration: 0.72,
      ease: 'power2.inOut',
    }, 2.72);

    return () => {
      tl.kill();
      gsap.killTweensOf(badges);
    };
  }, [onLoadingComplete]);

  return (
    <div ref={containerRef} className="loading-header">
      <div className="loading-loader">

        {/* Floating service cards */}
        {SERVICES.map((s) => (
          <div
            key={s.name}
            className="loading-badge"
            style={{ ...s.style, '--badge-accent': s.accent } as React.CSSProperties}
          >
            {/* Background image */}
            <div className="loading-badge-img-wrap">
              <Image src={s.image} alt={s.name} fill sizes="210px" className="loading-badge-img" />
            </div>

            {/* Gradient — dark left, image reveals right (matches HorizontalServices) */}
            <div className="loading-badge-overlay" />

            {/* Panel content */}
            <div className="loading-badge-content">
              {/* Counter */}
              <div className="loading-badge-counter">
                <span className="loading-badge-counter-line" style={{ backgroundColor: '#F59E0B' }} />
                <span className="loading-badge-counter-text">{s.num} / 04</span>
              </div>

              {/* Masked HalalMe logo + wordmark */}
              <div className="loading-badge-brand">
                <span style={{ position: 'relative', width: 16, height: 16, flexShrink: 0, display: 'inline-block' }}>
                  <span style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: '50%' }} />
                  <span style={{
                    position: 'absolute', inset: 0,
                    backgroundColor: s.logoColor,
                    WebkitMaskImage: 'url(/logo/logo.png)',
                    maskImage: 'url(/logo/logo.png)',
                    WebkitMaskSize: 'contain', maskSize: 'contain',
                    WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
                    maskMode: 'alpha',
                    WebkitMaskPosition: 'center', maskPosition: 'center',
                  } as React.CSSProperties} />
                </span>
                <span className="loading-badge-halalme">HalalMe</span>
              </div>

              {/* Service name */}
              <div className="loading-badge-service" style={{ color: s.accent }}>{s.name}</div>

              {/* Tagline */}
              <div className="loading-badge-tagline">{s.tagline}</div>
            </div>

            {/* Accent line at bottom */}
            <div className="loading-badge-line" style={{ backgroundColor: s.accent }} />
          </div>
        ))}

        {/* Main logo — natural colors inside white circle */}
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
