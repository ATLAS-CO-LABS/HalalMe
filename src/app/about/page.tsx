'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Fingerprint, BookOpen } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#102C26]">
      <HeroSection />
      <WhoWeAreSection />
      <WhatWeOfferSection />
      <WhyDifferentSection />
      <OurValuesSection />
      <FutureVisionSection />
      <CTASection />
    </div>
  );
}

/* ─── Hero ─────────────────────────────────────────────────────────── */

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#0A1C19] px-6 pt-36 pb-24 md:pt-44 md:pb-32">
      <div className="max-w-[95vw] mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-8 h-px bg-[#F59E0B]" />
          <span className="text-[#F59E0B] text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]">
            Our Story
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-5xl sm:text-6xl md:text-8xl lg:text-[clamp(4rem,10vw,10rem)] font-extrabold uppercase tracking-tighter leading-[0.88] text-[#F7E7CE]"
        >
          About
          <br />
          <span className="text-[#F7E7CE]/45">HalalMe</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-lg md:text-xl text-[#F7E7CE]/50 max-w-xl leading-relaxed"
        >
          Building the leading halal lifestyle ecosystem — where food, community, and purpose meet.
        </motion.p>
      </div>

      {/* Decorative bg text */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 right-0 text-[10rem] md:text-[18rem] font-extrabold uppercase tracking-tighter leading-none text-[#102C26]/60 select-none pointer-events-none translate-x-8 translate-y-8"
      >
        Halal
      </div>
    </section>
  );
}

/* ─── Who We Are ───────────────────────────────────────────────────── */

function WhoWeAreSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section ref={ref} className="bg-[#102C26] px-6 py-24 md:py-32">
      <div className="max-w-[95vw] mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-8 h-px bg-[#F59E0B]" />
          <span className="text-[#F59E0B] text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]">
            Who We Are
          </span>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-start">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold uppercase tracking-tighter leading-[0.88] text-[#F7E7CE]"
          >
            One Platform.
            <br />
            <span className="text-[#F7E7CE]/45">Endless Possibilities.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-[#F7E7CE]/55 text-base md:text-lg leading-relaxed pt-2"
          >
            HalalMe is a UK-focused halal ecosystem designed to make halal living easier, more transparent, and more rewarding — from food delivery to community and charity. We bring together everything you need for a complete halal lifestyle in one trusted platform.
          </motion.p>
        </div>
      </div>
    </section>
  );
}

/* ─── What We Offer ────────────────────────────────────────────────── */

function WhatWeOfferSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const services = [
    { num: '01', name: 'Delivery',    desc: 'Halal food delivery from trusted partners'        },
    { num: '02', name: 'Kitchen',     desc: 'Home-style kitchens & curated halal meals'        },
    { num: '03', name: 'Fresh',       desc: 'Pre-made ready meals delivered fresh'            },
    { num: '04', name: 'Hub',         desc: 'Community posts, recipes, and discussions'       },
    { num: '05', name: 'Rewards',     desc: 'Charity, sadaqah & reward-based donations'       },
    { num: '06', name: 'Travel',      desc: 'Online travel recommendations and flight booking' },
    { num: '07', name: 'Marketplace', desc: 'Halal products & everyday essentials'            },
  ];

  return (
    <section ref={ref} className="bg-[#0A1C19] px-6 py-24 md:py-32">
      <div className="max-w-[95vw] mx-auto mb-14 md:mb-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-8 h-px bg-[#F59E0B]" />
          <span className="text-[#F59E0B] text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]">
            What We Offer
          </span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88] text-[#F7E7CE]"
        >
          The Complete
          <br />
          <span className="text-[#F7E7CE]/45">Halal Ecosystem</span>
        </motion.h2>
      </div>

      {/* gap-px hairline grid */}
      <div className="max-w-[95vw] mx-auto grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-[#F7E7CE]/8">
        {services.map((s, i) => (
          <motion.div
            key={s.name}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="group relative bg-[#0A1C19] border border-[#F7E7CE]/8 p-8 overflow-hidden hover:bg-[#F7E7CE] transition-colors duration-300 cursor-default"
          >
            <span
              aria-hidden="true"
              className="absolute -top-4 -right-2 text-[6rem] font-extrabold text-[#102C26] group-hover:text-[#0A1C19]/15 leading-none select-none pointer-events-none transition-colors duration-300"
            >
              {s.num}
            </span>
            <div className="relative z-10">
              <h3 className="text-lg md:text-xl font-extrabold uppercase tracking-tighter text-[#F7E7CE] group-hover:text-[#102C26] mb-2 transition-colors duration-300">
                HalalMe {s.name}
              </h3>
              <p className="text-[#F7E7CE]/45 group-hover:text-[#102C26]/60 text-sm leading-relaxed transition-colors duration-300">
                {s.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ─── Why Different ────────────────────────────────────────────────── */

function WhyDifferentSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const differences = [
    '100% halal-focused ecosystem',
    'Community-driven platform',
    'Transparency & trust at every step',
    'Purpose beyond profit — charity & rewards',
  ];

  return (
    <section ref={ref} className="bg-[#102C26] px-6 py-24 md:py-32">
      <div className="max-w-[95vw] mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-8 h-px bg-[#F59E0B]" />
          <span className="text-[#F59E0B] text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]">
            Why Choose Us
          </span>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-start">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold uppercase tracking-tighter leading-[0.88] text-[#F7E7CE]"
          >
            Why HalalMe
            <br />
            <span className="text-[#F7E7CE]/45">Is Different</span>
          </motion.h2>

          <ul className="space-y-4 pt-2">
            {differences.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex items-start gap-4 border-b border-[#F7E7CE]/8 pb-4 last:border-0 last:pb-0"
              >
                <div className="flex-shrink-0 w-6 h-6 bg-[#F7E7CE]/8 border border-[#F7E7CE]/15 flex items-center justify-center mt-0.5">
                  <svg className="w-3.5 h-3.5 text-[#F7E7CE]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[#F7E7CE]/65 text-base md:text-lg leading-relaxed">
                  {item}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ─── Our Values ───────────────────────────────────────────────────── */

function OurValuesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const values = [
    { num: '01', Icon: ShieldCheck, title: 'Trust & Transparency',    desc: 'Every service is verified and halal-certified, ensuring complete transparency.'             },
    { num: '02', Icon: Fingerprint, title: 'Community First',         desc: 'Built by the community, for the community — your voice matters in everything we do.'        },
    { num: '03', Icon: BookOpen,    title: 'Halal Integrity',         desc: '100% commitment to halal standards across all our services, no compromises.'               },
    { num: '04', Icon: ArrowRight,  title: 'Innovation with Purpose', desc: 'Using technology to make halal living easier, more rewarding, and more connected.'          },
  ];

  return (
    <section ref={ref} className="bg-[#0A1C19] px-6 py-24 md:py-32">
      <div className="max-w-[95vw] mx-auto mb-14 md:mb-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-8 h-px bg-[#F59E0B]" />
          <span className="text-[#F59E0B] text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]">
            Our Values
          </span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88] text-[#F7E7CE]"
        >
          What We
          <br />
          <span className="text-[#F7E7CE]/45">Stand For</span>
        </motion.h2>
      </div>

      <div className="max-w-[95vw] mx-auto grid md:grid-cols-2 gap-px bg-[#F7E7CE]/8">
        {values.map((v, i) => {
          const Icon = v.Icon;
          return (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative bg-[#0A1C19] border border-[#F7E7CE]/8 p-8 md:p-10 overflow-hidden hover:bg-[#F7E7CE] transition-colors duration-300 cursor-default"
            >
              <span
                aria-hidden="true"
                className="absolute -top-4 -right-2 text-[6rem] font-extrabold text-[#102C26] group-hover:text-[#0A1C19]/12 leading-none select-none pointer-events-none transition-colors duration-300"
              >
                {v.num}
              </span>
              <div className="relative z-10">
                <Icon className="w-6 h-6 text-[#F7E7CE]/40 group-hover:text-[#102C26] mb-6 transition-colors duration-300" />
                <h3 className="text-xl md:text-2xl font-extrabold uppercase tracking-tighter text-[#F7E7CE] group-hover:text-[#102C26] mb-3 transition-colors duration-300">
                  {v.title}
                </h3>
                <p className="text-[#F7E7CE]/45 group-hover:text-[#102C26]/60 leading-relaxed text-sm md:text-base transition-colors duration-300">
                  {v.desc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ─── Future Vision ────────────────────────────────────────────────── */

function FutureVisionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section ref={ref} className="relative overflow-hidden bg-[#102C26] px-6 py-24 md:py-32">
      <div className="max-w-[95vw] mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-8 h-px bg-[#F59E0B]" />
          <span className="text-[#F59E0B] text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]">
            Future Vision
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88] text-[#F7E7CE] mb-10 max-w-4xl"
        >
          Building the Future
          <br />
          <span className="text-[#F7E7CE]/45">of Halal Living</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.25 }}
          className="text-[#F7E7CE]/55 text-base md:text-lg max-w-2xl leading-relaxed"
        >
          We aim to become the leading halal lifestyle platform in the UK and beyond — empowering users, partners, and communities globally. Our vision is to create a world where accessing halal services is seamless, trustworthy, and rewarding.
        </motion.p>
      </div>

      <div
        aria-hidden="true"
        className="absolute bottom-0 right-0 text-[8rem] md:text-[16rem] font-extrabold uppercase tracking-tighter leading-none text-[#0A1C19]/60 select-none pointer-events-none translate-x-8 translate-y-8"
      >
        Vision
      </div>
    </section>
  );
}

/* ─── CTA ──────────────────────────────────────────────────────────── */

function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section ref={ref} className="relative overflow-hidden bg-[#F7E7CE] py-24 md:py-32 px-6">
      <div className="max-w-[95vw] mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-8 h-px bg-[#102C26]/30" />
          <span className="text-[#102C26]/45 text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold">
            Join HalalMe
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88] text-[#102C26] mb-10 max-w-4xl"
        >
          Ready to Join
          <br />
          <span className="text-[#102C26]/45">HalalMe?</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
          className="text-[#102C26]/55 text-base md:text-lg max-w-xl mb-12 leading-relaxed"
        >
          Join a global community that values quality, faith, and seamless technology.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link href="/">
            <button className="flex items-center gap-3 px-8 py-4 bg-[#102C26] text-[#F7E7CE] font-extrabold uppercase tracking-tighter text-base hover:bg-[#0A1C19] transition-colors">
              Explore Services
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
          <Link href="/contact">
            <button className="flex items-center gap-3 px-8 py-4 border-2 border-[#102C26] text-[#102C26] font-extrabold uppercase tracking-tighter text-base hover:bg-[#102C26] hover:text-[#F7E7CE] transition-colors">
              Contact Us
            </button>
          </Link>
        </motion.div>
      </div>

      <div
        aria-hidden="true"
        className="absolute bottom-0 right-0 text-[8rem] md:text-[14rem] font-extrabold uppercase tracking-tighter leading-none text-[#102C26]/8 select-none pointer-events-none translate-x-6 translate-y-6"
      >
        Join
      </div>
    </section>
  );
}
