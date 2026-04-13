'use client';

import { motion, useInView } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useRef } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

const BG      = '#0D0D14';
const BG2     = '#09090F';
const CREAM   = '#F7E7CE';
const MAGENTA = '#F03E9E';
const DEEP    = '#C41E73';

const DEMO = [
  { role: 'user',      text: 'I have chicken and rice' },
  { role: 'assistant', text: 'You can make Chicken Biryani. Want the recipe?' },
];

export default function AQISection() {
  const router  = useRouter();
  const ref     = useRef(null);
  const inView  = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      ref={ref}
      className="relative overflow-hidden py-24 md:py-32"
      style={{ backgroundColor: BG2 }}
    >
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 55% at 70% 50%, rgba(196,30,115,0.07) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-[95vw] mx-auto px-6 md:px-10">

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-8 h-px" style={{ backgroundColor: MAGENTA }} />
          <span
            className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]"
            style={{ color: MAGENTA }}
          >
            AI Kitchen Assistant
          </span>
        </motion.div>

        {/* Two-column layout */}
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">

          {/* ── Left: copy + CTA ── */}
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold uppercase tracking-tighter leading-[0.9] mb-6"
              style={{ color: CREAM }}
            >
              Meet AQI —{' '}
              <span
                style={{
                  background: `linear-gradient(135deg, ${MAGENTA}, ${DEEP})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Your AI Kitchen
              </span>{' '}
              Assistant
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.22 }}
              className="text-sm md:text-base leading-relaxed mb-8 max-w-sm"
              style={{ color: `${CREAM}55` }}
            >
              Cook smarter with AI-powered recipes, guidance, and suggestions.
            </motion.p>

            {/* Feature pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-2 mb-10"
            >
              {[
                { Icon: Sparkles, text: 'Recipe ideas from your fridge' },
                { Icon: Sparkles, text: 'Step-by-step guidance' },
                { Icon: Sparkles, text: 'Halal-verified every time' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider"
                  style={{
                    background: 'rgba(240,62,158,0.06)',
                    border: '1px solid rgba(240,62,158,0.15)',
                    color: `${CREAM}55`,
                  }}
                >
                  <item.Icon className="w-3 h-3" style={{ color: MAGENTA }} />
                  {item.text}
                </div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.38 }}
            >
              <motion.button
                onClick={() => router.push('/kitchen/ai-assistant')}
                whileHover={{ scale: 1.03, filter: 'brightness(1.1)' }}
                whileTap={{ scale: 0.97 }}
                className="group flex items-center gap-3 px-7 py-4 text-white font-extrabold uppercase tracking-tighter text-sm transition-all"
                style={{
                  background: `linear-gradient(135deg, ${DEEP}, ${MAGENTA})`,
                }}
              >
                Try AQI
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </motion.button>
            </motion.div>
          </div>

          {/* ── Right: chat demo ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {/* Chat card */}
            <div
              className="relative"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(240,62,158,0.14)',
              }}
            >
              {/* Window chrome */}
              <div
                className="flex items-center gap-2.5 px-4 py-3"
                style={{ borderBottom: '1px solid rgba(240,62,158,0.08)' }}
              >
                <Image
                  src="/logo/logo.png"
                  alt="AQI"
                  width={20}
                  height={20}
                  className="object-contain"
                />
                <span
                  className="text-[10px] font-black uppercase"
                  style={{ color: CREAM, letterSpacing: '0.2em' }}
                >
                  AQI
                </span>
                <span
                  className="text-[8px] font-medium ml-1"
                  style={{ color: `${CREAM}30` }}
                >
                  · AI Kitchen Assistant
                </span>
                <div className="flex items-center gap-1 ml-auto">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: '#4ade80',
                      boxShadow: '0 0 4px #4ade80',
                    }}
                  />
                  <span
                    className="text-[8px] font-bold uppercase"
                    style={{ color: '#4ade8080', letterSpacing: '0.14em' }}
                  >
                    Online
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div className="px-4 py-5 space-y-3">
                {DEMO.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.45 + i * 0.15 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="max-w-[78%]">
                      {msg.role === 'assistant' && (
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Image
                            src="/logo/logo.png"
                            alt="AQI"
                            width={12}
                            height={12}
                            className="object-contain"
                          />
                          <span
                            className="text-[8px] font-black uppercase"
                            style={{ color: `${MAGENTA}90`, letterSpacing: '0.22em' }}
                          >
                            AQI
                          </span>
                        </div>
                      )}
                      <div
                        className="px-3.5 py-2.5 text-xs leading-relaxed"
                        style={
                          msg.role === 'user'
                            ? {
                                background: 'linear-gradient(135deg, #1E0A18, #180A12)',
                                border: '1px solid rgba(240,62,158,0.18)',
                                color: CREAM,
                              }
                            : {
                                background: 'rgba(28,8,18,0.85)',
                                border: '1px solid rgba(240,62,158,0.10)',
                                borderLeft: `3px solid ${MAGENTA}70`,
                                color: `${CREAM}CC`,
                              }
                        }
                      >
                        {msg.text}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Input row hint */}
                <div
                  className="flex items-center gap-2 mt-4 px-2 py-2"
                  style={{ border: '1px solid rgba(240,62,158,0.08)' }}
                >
                  <span
                    className="flex-1 text-[10px]"
                    style={{ color: `${CREAM}18` }}
                  >
                    Ask AQI anything…
                  </span>
                  <div
                    className="w-6 h-6 flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${DEEP}, ${MAGENTA})`,
                    }}
                  >
                    <ArrowRight className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Ghost label beneath card */}
            <p
              className="mt-4 text-[10px] font-semibold uppercase tracking-widest text-center"
              style={{ color: `${CREAM}18` }}
            >
              Live demo · Click "Try AQI" to start
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
