"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const SERVICES = [
  {
    num: "01",
    name: "Delivery",
    tagline: "Halal food at your door",
    link: "/delivery",
    image: "/images/services/halal01.jpg",
    accent: "#7C3AED",
    col: "col-span-2",
    row: "h-72 md:h-[440px]",
  },
  {
    num: "02",
    name: "Kitchen",
    tagline: "AI-powered recipes",
    link: "/kitchen",
    image: "/images/services/halal02.png",
    accent: "#F03E9E",
    col: "",
    row: "h-72 md:h-[440px]",
  },
  {
    num: "03",
    name: "Hub",
    tagline: "The halal social network",
    link: "/hub",
    image: "/images/services/halal03.png",
    accent: "#F59E0B",
    col: "",
    row: "h-72 md:h-[440px]",
  },
  {
    num: "04",
    name: "Rewards",
    tagline: "Earn points, give to charity",
    link: "/rewards",
    image: "/images/services/halal04.png",
    accent: "#14B8A6",
    col: "col-span-2 md:col-span-4",
    row: "h-60 md:h-[320px]",
  },
];

export default function ServicesShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.batch(".svc-card", {
        interval: 0.08,
        batchMax: 4,
        start: "top 88%",
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            stagger: 0.1,
            duration: 0.9,
            ease: "expo.out",
            overwrite: true,
          }),
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 px-6 md:px-10 max-w-[95vw] mx-auto"
    >
      {SERVICES.map((s) => (
        <Link
          key={s.num}
          href={s.link}
          style={{ opacity: 0, transform: "translateY(60px)" }}
          className={`svc-card group relative overflow-hidden bg-[#102C26] ${s.col} ${s.row}`}
        >
          {/* Background image */}
          <Image
            src={s.image}
            alt={`HalalMe ${s.name}`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
            style={{ backgroundColor: '#102C26' }}
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050F0D]/95 via-[#102C26]/45 to-[#102C26]/10 transition-opacity duration-500 group-hover:from-[#050F0D]" />

          {/* Accent bar */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[3px] translate-y-full group-hover:translate-y-0 transition-transform duration-500"
            style={{ backgroundColor: s.accent }}
          />

          {/* Service number */}
          <span className="absolute top-5 left-5 text-[10px] font-bold tracking-[0.35em] uppercase text-[#F7E7CE]/30 select-none">
            {s.num}
          </span>

          {/* Arrow - slides in on hover */}
          <div className="absolute top-5 right-5 opacity-0 translate-x-2 -translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300">
            <ArrowUpRight className="w-5 h-5 text-[#F7E7CE]" />
          </div>

          {/* Bottom text */}
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
            <p className="text-[#F7E7CE]/40 text-[10px] uppercase tracking-[0.25em] mb-2 transition-opacity duration-300">
              {s.tagline}
            </p>
            <h3 className="text-[#F7E7CE] font-extrabold uppercase tracking-tighter leading-none text-xl md:text-2xl lg:text-[clamp(1.25rem,2vw,2.25rem)]">
              HalalMe {s.name}
            </h3>
          </div>
        </Link>
      ))}
    </div>
  );
}
