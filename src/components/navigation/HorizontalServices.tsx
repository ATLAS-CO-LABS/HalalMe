"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const SERVICES = [
  {
    num: "01",
    name: "Delivery",
    tagline: "Halal food at your door",
    desc: "Order from the best halal restaurants near you, delivered in minutes.",
    link: "/delivery",
    image: "/images/services/halal_delivery1.png",
    accent: "#B96AF0",
    logoColor: "#5E188F",
  },
  {
    num: "02",
    name: "Kitchen",
    tagline: "AI-powered recipes",
    desc: "Discover thousands of halal recipes and get AI-generated meal plans tailored to you.",
    link: "/kitchen",
    image: "/images/services/halal02.png",
    accent: "#F03E9E",
  },
  {
    num: "03",
    name: "Social",
    tagline: "The halal social network",
    desc: "Connect with the global Muslim community. Share recipes, reviews, and halal finds.",
    link: "/hub",
    image: "/images/services/halal03.png",
    accent: "#F59E0B",
  },
  {
    num: "04",
    name: "Rewards",
    tagline: "Earn points, give to charity",
    desc: "Every purchase earns loyalty points you can donate to verified Islamic charities.",
    link: "/rewards",
    image: "/images/services/halal04.png",
    accent: "#14B8A6",
  },
];

export default function HorizontalServices() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const track = trackRef.current!;
      const section = sectionRef.current!;
      const progress = progressRef.current!;

      gsap.set(track, { width: `${SERVICES.length * 100}vw` });

      const getDistance = () => track.scrollWidth - window.innerWidth;

      gsap.to(track, {
        x: () => -getDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 1.2,
          start: "top top",
          end: () => `+=${getDistance()}`,
          invalidateOnRefresh: true,
        },
      });

      gsap.to(progress, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          scrub: true,
          start: "top top",
          end: () => `+=${getDistance()}`,
          invalidateOnRefresh: true,
        },
      });

      return () => {
        gsap.set(track, { clearProps: "width,x" });
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-[#050F0D]">
      {/* Scroll track - flex-col on mobile, flex-row on desktop (width set by GSAP) */}
      <div ref={trackRef} className="flex flex-col md:flex-row">
        {SERVICES.map((s, i) => (
          <div
            key={s.num}
            className="relative flex-shrink-0 w-screen h-[78vh] md:h-screen overflow-hidden"
          >
            {/* Background image */}
            <Image
              src={s.image}
              alt={`HalalMe ${s.name}`}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover object-center"
              style={{ backgroundColor: "#102C26" }}
            />

            {/* Cinematic gradient - dark left, image reveals right */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#050F0D] via-[#102C26]/82 to-[#102C26]/15" />

            {/* Oversized decorative number */}
            <div
              aria-hidden="true"
              className="absolute -bottom-4 left-0 font-extrabold tracking-tighter leading-none select-none pointer-events-none text-[#F7E7CE]/[0.035]"
              style={{ fontSize: "clamp(8rem, 28vw, 38rem)" }}
            >
              {s.num}
            </div>

            {/* Panel content */}
            <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-20 lg:px-28 max-w-[90vw] md:max-w-[52vw]">
              {/* Counter */}
              <div className="flex items-center gap-3 mb-6 md:mb-8">
                <div className="w-6 md:w-8 h-px bg-[#F59E0B]" />
                <span className="text-[#F59E0B] text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-bold">
                  {s.num} / {String(SERVICES.length).padStart(2, "0")}
                </span>
              </div>

              {/* Heading */}
              <h2 className="font-extrabold uppercase tracking-tighter leading-[0.88] mb-4 md:mb-5">
                <span className="flex items-center gap-2 mb-2 normal-case">
                  <span
                    style={{
                      position: "relative",
                      width: 30,
                      height: 30,
                      flexShrink: 0,
                      display: "inline-block",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        inset: 0,
                        backgroundColor: "rgba(255,255,255,0.92)",
                        borderRadius: "50%",
                      }}
                    />
                    <span
                      style={
                        {
                          position: "absolute",
                          inset: 0,
                          backgroundColor: s.logoColor ?? s.accent,
                          WebkitMaskImage: "url(/logo/logo.png)",
                          maskImage: "url(/logo/logo.png)",
                          WebkitMaskSize: "contain",
                          maskSize: "contain",
                          WebkitMaskRepeat: "no-repeat",
                          maskRepeat: "no-repeat",
                          maskMode: "alpha",
                          WebkitMaskPosition: "center",
                          maskPosition: "center",
                        } as React.CSSProperties
                      }
                    />
                  </span>
                  <span
                    className="text-base md:text-2xl lg:text-3xl font-black tracking-tight"
                    style={{ fontFamily: "var(--font-logo)", color: "#F7E7CE" }}
                  >
                    HalalMe
                  </span>
                </span>
                <span
                  className="block"
                  style={{
                    color: s.accent,
                    fontSize: "clamp(2.8rem, 7vw, 8rem)",
                  }}
                >
                  {s.name}
                </span>
              </h2>

              {/* Tagline */}
              <p className="text-[#F7E7CE]/70 text-[9px] md:text-[10px] uppercase tracking-[0.25em] mb-3 md:mb-4">
                {s.tagline}
              </p>

              {/* Description */}
              <p className="text-[#F7E7CE]/60 text-sm md:text-base lg:text-lg max-w-xs md:max-w-sm leading-relaxed mb-8 md:mb-10">
                {s.desc}
              </p>

              {/* CTA */}
              <Link href={s.link}>
                <button
                  className="group/btn self-start flex items-center gap-3 px-6 md:px-8 py-3 md:py-4 font-extrabold uppercase tracking-tighter text-xs md:text-sm transition-all duration-300 border-2 hover:gap-5"
                  style={{ borderColor: s.accent, color: s.accent }}
                >
                  Explore {s.name}
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </button>
              </Link>
            </div>

            {/* Scroll hint - first panel, desktop only */}
            {i === 0 && (
              <div className="hidden md:flex absolute bottom-14 right-16 items-center gap-3 text-[#F7E7CE]/22 text-[9px] uppercase tracking-[0.3em]">
                <span>Scroll to explore</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            )}

            {/* Colored accent line on each panel */}
            <div
              className="absolute bottom-0 left-0 w-full h-0.75 opacity-60"
              style={{ backgroundColor: s.accent }}
            />
          </div>
        ))}
      </div>

      {/* Progress bar - desktop only */}
      <div className="hidden md:block absolute bottom-0 left-0 right-0 h-0.75 bg-[#F7E7CE]/8 z-10">
        <div
          ref={progressRef}
          className="h-full bg-[#F7E7CE]/50 origin-left"
          style={{ transform: "scaleX(0)" }}
        />
      </div>
    </section>
  );
}
