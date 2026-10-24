'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import Image from 'next/image';

const WORDMARK = ['H', 'a', 'l', 'a', 'l', 'M', 'e'];

// The whole intro is CSS (see "LOADING SCREEN ANIMATION" in globals.css), so it
// starts on first paint instead of after hydration and can never restart when
// this component re-renders. JS only waits for the closing animation to end.
const CLOSE_ANIMATIONS = ['hm-loader-close', 'hm-loader-close-fade'];
const INTRO_MS = 3440; // fallback only, for browsers without getAnimations()

export default function LoadingScreen({ onLoadingComplete }: { onLoadingComplete?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onCompleteRef = useRef(onLoadingComplete);

  useEffect(() => {
    onCompleteRef.current = onLoadingComplete;
  }, [onLoadingComplete]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    const finish = () => {
      if (!cancelled) onCompleteRef.current?.();
    };

    // On a slow phone the animation may already be over by the time React
    // hydrates. A finished animation's promise resolves straight away.
    const close = container
      .getAnimations?.({ subtree: true })
      .find((a) => CLOSE_ANIMATIONS.includes((a as CSSAnimation).animationName));

    let timer: ReturnType<typeof setTimeout> | undefined;
    if (close) {
      close.finished.then(finish, finish);
    } else {
      timer = setTimeout(finish, INTRO_MS);
    }

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <div ref={containerRef} className="loading-header">
      <div className="loading-bg" />
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
              <span className="loading-letter" style={{ '--i': i } as CSSProperties}>{char}</span>
            </span>
          ))}
        </div>

        {/* Tagline */}
        <p className="loading-tagline">Halal Living, Simplified</p>

      </div>
    </div>
  );
}
