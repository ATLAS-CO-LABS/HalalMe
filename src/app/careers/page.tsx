"use client";

import { motion } from "framer-motion";

const CREAM = "#F7E7CE";
const GOLD = "#F59E0B";

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-[#102C26]">
      <Hero />
      <Body />
    </div>
  );
}

function Hero() {
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
            Join Us
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl sm:text-6xl md:text-8xl font-extrabold uppercase tracking-tighter leading-[0.88] text-[#F7E7CE]"
        >
          Careers at
          <br />
          <span className="text-[#F7E7CE]/45">HalalMe</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-lg md:text-xl text-[#F7E7CE]/50 max-w-xl leading-relaxed"
        >
          We&apos;re building the UK&apos;s halal lifestyle ecosystem, one team at a time.
        </motion.p>
      </div>

      <div
        aria-hidden="true"
        className="absolute bottom-0 right-0 text-[10rem] md:text-[18rem] font-extrabold uppercase tracking-tighter leading-none text-[#102C26]/60 select-none pointer-events-none translate-x-8 translate-y-8"
      >
        Careers
      </div>
    </section>
  );
}

function Body() {
  return (
    <section className="bg-[#102C26] px-6 py-24 md:py-32">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight mb-6" style={{ color: CREAM }}>
          Not hiring right now
        </h2>
        <p className="text-sm md:text-base leading-relaxed mb-10" style={{ color: `${CREAM}70` }}>
          We don&apos;t have open roles at the moment, we&apos;re a small team focused on getting
          HalalMe right for our early users. But we&apos;re always glad to hear from people who care
          about halal food, community, and building something meaningful. If that&apos;s you, send us
          a note about what you&apos;d want to work on and why HalalMe, we read everything.
        </p>
        <a
          href="mailto:support@halalme.co.uk?subject=Interested%20in%20HalalMe"
          className="inline-flex items-center gap-2 px-8 py-4 font-extrabold uppercase tracking-tighter text-sm transition-colors"
          style={{ backgroundColor: GOLD, color: "#0A1C19" }}
        >
          Get in touch
        </a>
      </div>
    </section>
  );
}
