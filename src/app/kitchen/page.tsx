'use client';

import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  ChefHat,
  Utensils,
  Globe,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import AQISection from './AQISection';

/* ─── Magenta base — matches AI assistant palette ───── */
const BG      = '#0D0D14';
const BG2     = '#09090F';
const CREAM   = '#F7E7CE';
const MAGENTA = '#F03E9E';
const DEEP    = '#C41E73';

export default function KitchenLandingPage() {
  const router = useRouter();

  const statsRef    = useRef(null);
  const cardsRef    = useRef(null);
  const featuresRef = useRef(null);
  const ctaRef      = useRef(null);

  const statsInView    = useInView(statsRef,    { once: true });
  const cardsInView    = useInView(cardsRef,    { once: true });
  const featuresInView = useInView(featuresRef, { once: true });
  const ctaInView      = useInView(ctaRef,      { once: true });

  const features = [
    { num: '01', Icon: ChefHat,  title: 'Personalised Recipes', desc: 'Get personalized recipe suggestions based on your ingredients' },
    { num: '02', Icon: BookOpen, title: 'Recipe Library',        desc: 'Browse thousands of verified halal recipes' },
    { num: '03', Icon: Utensils, title: 'Cooking Tips',          desc: 'Expert advice and substitution suggestions' },
    { num: '04', Icon: ChefHat,  title: 'Share Recipes',         desc: 'Upload and share your own culinary creations' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG }}>

      {/* ─── Hero ───────────────────────────────────────── */}
      <section
        className="relative h-screen min-h-[600px] flex items-center overflow-hidden"
        style={{ backgroundColor: BG }}
      >
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1920&auto=format&fit=crop&q=80"
            alt="Halal cooking"
            fill
            className="object-cover opacity-[0.14] scale-105"
            priority
            sizes="100vw"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to right, ${BG} 45%, ${BG}/90 70%, ${BG}/55 100%)`,
            }}
          />
        </div>

        <div className="relative z-10 w-full max-w-[95vw] mx-auto px-6 md:px-10 pt-20">
          <div className="max-w-5xl">

            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-3 mb-6 md:mb-8"
            >
              <div className="w-8 h-px" style={{ backgroundColor: MAGENTA }} />
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]" style={{ color: MAGENTA }}>
                Your Halal Cooking Companion
              </span>
            </motion.div>

            {/* H1 */}
            <h1 className="font-extrabold uppercase tracking-tighter leading-[0.88]">
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7 }}
                className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-1"
                style={{ color: `${CREAM}40` }}
              >
                HalalMe
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32, duration: 0.7 }}
                className="block text-[clamp(3rem,8vw,8rem)]"
                style={{ color: CREAM }}
              >
                Kitchen.
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.44, duration: 0.7 }}
                className="block text-[clamp(2rem,5vw,5rem)]"
                style={{ color: MAGENTA }}
              >
                AI-Powered.
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 md:mt-7 text-base md:text-lg max-w-md leading-relaxed"
              style={{ color: `${CREAM}50` }}
            >
              Get AI-powered recipe suggestions, discover community recipes,
              and master the art of halal cooking with your personal culinary assistant.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.72 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <motion.button
                onClick={() => router.push('/kitchen/ai-assistant')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 px-7 sm:px-8 py-3.5 sm:py-4 text-white font-extrabold uppercase tracking-tighter text-sm sm:text-base"
                style={{ backgroundColor: DEEP }}
              >
                Start Cooking with AI
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>

              <motion.button
                onClick={() => router.push('/kitchen/recipes')}
                whileHover={{ scale: 1.03, backgroundColor: 'rgba(247,231,206,0.08)' }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 px-7 sm:px-8 py-3.5 sm:py-4 border-2 font-extrabold uppercase tracking-tighter text-sm sm:text-base transition-all"
                style={{
                  borderColor: `${CREAM}25`,
                  color: CREAM,
                }}
              >
                Browse Recipes
              </motion.button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-8 flex flex-wrap gap-6"
            >
              {[
                { Icon: Sparkles, text: 'AI-Powered'  },
                { Icon: BookOpen, text: '5K+ Recipes' },
                { Icon: Globe,    text: '50+ Cuisines'},
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide"
                  style={{ color: `${CREAM}40` }}
                >
                  <item.Icon className="w-4 h-4" style={{ color: MAGENTA }} />
                  {item.text}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Stats Strip ──────────────────────────────────── */}
      <div
        ref={statsRef}
        className="grid grid-cols-2 md:grid-cols-4"
        style={{ gap: '1px', backgroundColor: `${CREAM}08` }}
      >
        {[
          { value: '5K+',  label: 'Recipes'            },
          { value: '1K+',  label: 'AI Chats Daily'     },
          { value: '10K+', label: 'Community Members'  },
          { value: '50+',  label: 'Cuisines'           },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="py-10 md:py-14 px-8 md:px-12 text-center md:text-left"
            style={{ backgroundColor: BG2 }}
          >
            <div
              className="text-[3rem] md:text-[4.5rem] font-extrabold tracking-tighter leading-none"
              style={{ color: CREAM }}
            >
              {s.value}
            </div>
            <div
              className="text-[10px] md:text-xs uppercase tracking-[0.25em] mt-2 font-medium"
              style={{ color: 'rgba(240,62,158,0.5)' }}
            >
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ─── AQI Promo ────────────────────────────────────── */}
      <AQISection />

      {/* ─── Cards (What You Can Do) ───────────────────────── */}
      <section
        ref={cardsRef}
        className="py-24 md:py-32"
        style={{ backgroundColor: BG }}
      >
        <div className="max-w-[95vw] mx-auto px-6 md:px-10 mb-14 md:mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={cardsInView ? { opacity: 1, x: 0 } : {}}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-8 h-px" style={{ backgroundColor: MAGENTA }} />
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]" style={{ color: MAGENTA }}>
              What You Can Do
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={cardsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88]"
            style={{ color: CREAM }}
          >
            Cook Smarter.
            <br />
            <span style={{ color: `${CREAM}50` }}>Eat Halal.</span>
          </motion.h2>
        </div>

        <div
          className="max-w-[95vw] mx-auto px-6 md:px-10 grid md:grid-cols-2"
          style={{ gap: '1px', backgroundColor: `${CREAM}08` }}
        >
          {/* AI Card — hover to fuchsia */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={cardsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <Link href="/kitchen/ai-assistant">
              <div
                className="group relative p-8 md:p-10 overflow-hidden cursor-pointer min-h-[340px] flex flex-col transition-colors duration-300"
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = DEEP)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = BG)}
                style={{
                  backgroundColor: BG,
                  border: `1px solid ${CREAM}08`,
                }}
              >
                {/* Ghost number */}
                <span
                  aria-hidden="true"
                  className="absolute -top-6 -right-3 text-[8rem] md:text-[10rem] font-extrabold leading-none select-none pointer-events-none transition-colors duration-300"
                  style={{ color: '#140820' }}
                >
                  01
                </span>
                <div className="relative z-10 flex flex-col flex-1">
                  <ChefHat
                    className="w-7 h-7 mb-8 flex-shrink-0 transition-colors duration-300 group-hover:text-white"
                    style={{ color: MAGENTA }}
                  />
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-extrabold uppercase tracking-tighter mb-4 transition-colors duration-300 group-hover:text-white" style={{ color: CREAM }}>
                    AI Recipe Assistant
                  </h3>
                  <p className="leading-relaxed text-sm md:text-base transition-colors duration-300 group-hover:text-white/80 flex-1" style={{ color: `${CREAM}50` }}>
                    Have ingredients but don&apos;t know what to cook? Let our AI
                    create delicious halal recipes with step-by-step instructions.
                  </p>
                  <div className="mt-6 flex flex-col gap-2">
                    {[
                      'Paste your ingredients and get recipe suggestions',
                      'Ask for cooking help and substitutions',
                      'Get step-by-step cooking instructions',
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 text-sm transition-colors duration-300 group-hover:text-white/75"
                        style={{ color: `${CREAM}35` }}
                      >
                        <span className="group-hover:text-white mt-0.5 font-bold" style={{ color: MAGENTA }}>✓</span>
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 flex items-center gap-2 text-sm font-extrabold uppercase tracking-tighter transition-colors duration-300 group-hover:text-white" style={{ color: MAGENTA }}>
                    Start Now <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Recipes Card — hover to cream */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={cardsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Link href="/kitchen/recipes">
              <div
                className="group relative p-8 md:p-10 overflow-hidden cursor-pointer min-h-[340px] flex flex-col hover:bg-[#F7E7CE] transition-colors duration-300"
                style={{
                  backgroundColor: BG,
                  border: `1px solid ${CREAM}08`,
                }}
              >
                <span
                  aria-hidden="true"
                  className="absolute -top-6 -right-3 text-[8rem] md:text-[10rem] font-extrabold leading-none select-none pointer-events-none transition-colors duration-300"
                  style={{ color: '#0e0c18' }}
                >
                  02
                </span>
                <div className="relative z-10 flex flex-col flex-1">
                  <BookOpen
                    className="w-7 h-7 mb-8 flex-shrink-0 transition-colors duration-300 group-hover:text-[#C41E73]"
                    style={{ color: `${CREAM}60` }}
                  />
                  <h3
                    className="text-xl md:text-2xl lg:text-3xl font-extrabold uppercase tracking-tighter mb-4 transition-colors duration-300 group-hover:text-[#08060F]"
                    style={{ color: CREAM }}
                  >
                    Explore Recipes
                  </h3>
                  <p
                    className="leading-relaxed text-sm md:text-base transition-colors duration-300 group-hover:text-[#08060F]/65 flex-1"
                    style={{ color: `${CREAM}50` }}
                  >
                    Browse thousands of halal recipes from our community.
                    Find inspiration and share your own creations.
                  </p>
                  <div className="mt-6 flex flex-col gap-2">
                    {[
                      'Discover recipes from around the world',
                      'Filter by cuisine, difficulty, and cooking time',
                      'Upload and share your own recipes',
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 text-sm transition-colors duration-300 group-hover:text-[#08060F]/60"
                        style={{ color: `${CREAM}35` }}
                      >
                        <span className="mt-0.5 font-bold" style={{ color: MAGENTA }}>✓</span>
                        {item}
                      </div>
                    ))}
                  </div>
                  <div
                    className="mt-8 flex items-center gap-2 text-sm font-extrabold uppercase tracking-tighter transition-colors duration-300 group-hover:text-[#C41E73]"
                    style={{ color: `${CREAM}60` }}
                  >
                    Browse Now <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── Features Grid ────────────────────────────────── */}
      <section
        ref={featuresRef}
        className="py-24 md:py-32"
        style={{ backgroundColor: BG2 }}
      >
        <div className="max-w-[95vw] mx-auto px-6 md:px-10 mb-14 md:mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={featuresInView ? { opacity: 1, x: 0 } : {}}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-8 h-px" style={{ backgroundColor: MAGENTA }} />
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]" style={{ color: MAGENTA }}>
              Why HalalMe Kitchen
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88]"
            style={{ color: CREAM }}
          >
            Your Complete
            <br />
            <span style={{ color: `${CREAM}50` }}>Culinary Companion.</span>
          </motion.h2>
        </div>

        <div
          className="max-w-[95vw] mx-auto px-6 md:px-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          style={{ gap: '1px', backgroundColor: `${CREAM}08` }}
        >
          {features.map((f, i) => {
            const Icon = f.Icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group relative p-8 overflow-hidden hover:bg-[#F7E7CE] transition-colors duration-300 cursor-default"
                style={{
                  backgroundColor: BG2,
                  border: `1px solid ${CREAM}08`,
                  minHeight: '220px',
                }}
              >
                <span
                  aria-hidden="true"
                  className="absolute -top-6 -right-3 text-[7rem] font-extrabold leading-none select-none pointer-events-none transition-colors duration-300"
                  style={{ color: '#0a0818' }}
                >
                  {f.num}
                </span>
                <div className="relative z-10 flex flex-col" style={{ minHeight: '180px' }}>
                  <Icon
                    className="w-6 h-6 mb-6 transition-colors duration-300 group-hover:text-[#C41E73]"
                    style={{ color: MAGENTA }}
                  />
                  <h3
                    className="text-lg md:text-xl font-extrabold uppercase tracking-tighter mb-3 transition-colors duration-300 group-hover:text-[#08060F]"
                    style={{ color: CREAM }}
                  >
                    {f.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed transition-colors duration-300 group-hover:text-[#08060F]/65"
                    style={{ color: `${CREAM}50` }}
                  >
                    {f.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ─── Final CTA ────────────────────────────────────── */}
      <section
        ref={ctaRef}
        className="relative overflow-hidden py-28 md:py-36"
        style={{ backgroundColor: DEEP }}
      >
        <div className="relative z-10 max-w-[95vw] mx-auto px-6 md:px-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={ctaInView ? { opacity: 1 } : {}}
            className="flex items-center gap-3 mb-8"
          >
            <div className="w-8 h-px bg-white/30" />
            <span className="text-white/45 text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold">
              Ready to Cook
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88] text-white mb-10 max-w-4xl"
          >
            Ready to Start
            <br />
            Cooking?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={ctaInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-base md:text-lg max-w-xl mb-12 leading-relaxed"
          >
            Let our AI assistant help you create delicious halal meals today.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 mb-16"
          >
            <button
              onClick={() => router.push('/kitchen/ai-assistant')}
              className="flex items-center gap-3 px-8 py-4 bg-white font-extrabold uppercase tracking-tighter text-base hover:bg-[#F7E7CE] transition-colors"
              style={{ color: DEEP }}
            >
              Start Cooking with AI
              <ArrowRight className="w-5 h-5" />
            </button>
            <Link href="/kitchen/recipes">
              <button className="flex items-center gap-3 px-8 py-4 border-2 border-white/30 text-white font-extrabold uppercase tracking-tighter text-base hover:bg-white/10 transition-colors">
                Browse Recipes
              </button>
            </Link>
          </motion.div>

          <div className="flex flex-wrap gap-6 md:gap-10">
            {[
              { Icon: Sparkles, text: 'AI-Powered Suggestions' },
              { Icon: BookOpen, text: '5K+ Halal Recipes'      },
              { Icon: Globe,    text: '50+ Cuisines'           },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-white/40 text-xs font-semibold uppercase tracking-wide"
              >
                <item.Icon className="w-4 h-4" />
                {item.text}
              </div>
            ))}
          </div>
        </div>

        {/* Watermark */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 right-0 font-extrabold uppercase tracking-tighter leading-none text-white/8 select-none pointer-events-none translate-x-6 translate-y-6 text-[8rem] md:text-[14rem]"
        >
          Kitchen
        </div>
      </section>

      {/* ─── Back Links ───────────────────────────────────── */}
      <div
        className="px-6 py-8"
        style={{ backgroundColor: BG, borderTop: `1px solid ${CREAM}08` }}
      >
        <div className="max-w-[95vw] mx-auto flex justify-between items-center">
          <Link
            href="/hub"
            className="text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:text-fuchsia-400"
            style={{ color: `${CREAM}30` }}
          >
            ← Hub
          </Link>
          <Link
            href="/rewards"
            className="text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:text-fuchsia-400"
            style={{ color: `${CREAM}30` }}
          >
            Rewards →
          </Link>
        </div>
      </div>
    </div>
  );
}
