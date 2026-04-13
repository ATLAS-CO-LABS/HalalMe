'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Image from 'next/image';

interface LoadingScreenProps {
  onLoadingComplete?: () => void;
}

export default function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const loadingLetters = container.querySelectorAll('.loading-letter');
    const box = container.querySelectorAll('.loader-box');
    const growingImage = container.querySelectorAll('.growing-image');
    const headingStart = container.querySelectorAll('.h1-start');
    const headingEnd = container.querySelectorAll('.h1-end');

    // GSAP Timeline
    const tl = gsap.timeline({
      defaults: {
        ease: 'expo.inOut',
      },
      onComplete: () => {
        onLoadingComplete?.();
      },
    });

    // Letters animate in from bottom
    if (loadingLetters.length) {
      tl.from(loadingLetters, {
        yPercent: 100,
        stagger: 0.025,
        duration: 1.25,
      });
    }

    // Box expands
    if (box.length) {
      tl.fromTo(
        box,
        { width: '0em' },
        { width: '1em', duration: 1.25 },
        '< 1.25'
      );
    }

    // Image grows inside box
    if (growingImage.length) {
      tl.fromTo(
        growingImage,
        { width: '0%' },
        { width: '100%', duration: 1.25 },
        '<'
      );
    }

    // Letters split apart slightly
    if (headingStart.length) {
      tl.fromTo(
        headingStart,
        { x: '0em' },
        { x: '-0.05em', duration: 1.25 },
        '<'
      );
    }

    if (headingEnd.length) {
      tl.fromTo(
        headingEnd,
        { x: '0em' },
        { x: '0.05em', duration: 1.25 },
        '<'
      );
    }

    // Image expands to fullscreen
    if (growingImage.length) {
      tl.to(
        growingImage,
        { width: '100vw', height: '100dvh', duration: 1.5 },
        '< 1'
      );
    }

    if (box.length) {
      tl.to(box, { width: '110vw', duration: 1.5 }, '<');
    }

    // Fade out the entire loading screen
    tl.to(container, {
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
    });

    return () => {
      tl.kill();
    };
  }, [onLoadingComplete]);

  return (
    <div
      ref={containerRef}
      className="loading-header"
    >
      {/* Loader */}
      <div className="loading-loader">
        <div className="loading-h1">
          <div className="h1-start">
            <span className="loading-letter">H</span>
            <span className="loading-letter">a</span>
            <span className="loading-letter">l</span>
          </div>
          <div className="loader-box">
            <div className="loader-box-inner">
              <div className="growing-image">
                <div className="growing-image-wrap">
                  <Image
                    src="/logo/logo.png"
                    alt="HalalMe Logo"
                    width={80}
                    height={80}
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="h1-end">
            <span className="loading-letter">a</span>
            <span className="loading-letter">l</span>
            <span className="loading-letter">M</span>
            <span className="loading-letter">e</span>
          </div>
        </div>
      </div>
    </div>
  );
}
