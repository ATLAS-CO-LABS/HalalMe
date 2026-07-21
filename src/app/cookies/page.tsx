"use client";

import { motion } from "framer-motion";

const CREAM = "#F7E7CE";
const GOLD = "#F59E0B";

const LAST_UPDATED = "21 July 2026";

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-[#102C26]">
      <Hero />
      <DocumentBody />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0A1C19] px-6 pt-36 pb-20 md:pt-44 md:pb-24">
      <div className="max-w-[95vw] mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-8 h-px bg-[#F59E0B]" />
          <span className="text-[#F59E0B] text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]">
            Legal
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88] text-[#F7E7CE]"
        >
          Cookie
          <br />
          <span className="text-[#F7E7CE]/45">Policy</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-sm text-[#F7E7CE]/40"
        >
          Last updated {LAST_UPDATED}
        </motion.p>
      </div>
    </section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-12">
      <h2 className="text-xl md:text-2xl font-extrabold uppercase tracking-tight mb-4" style={{ color: CREAM }}>
        {title}
      </h2>
      <div className="space-y-4 text-sm md:text-base leading-relaxed" style={{ color: `${CREAM}90` }}>
        {children}
      </div>
    </div>
  );
}

function DocumentBody() {
  return (
    <section className="bg-[#102C26] px-6 py-20 md:py-28">
      <div className="max-w-3xl mx-auto">
        <p className="text-sm md:text-base leading-relaxed mb-16" style={{ color: `${CREAM}70` }}>
          This policy explains what cookies and similar technologies (like local storage) HalalMe
          uses, and why.
        </p>

        <Section title="1. What cookies are">
          <p>
            Cookies are small text files stored on your device when you visit a website. They let a
            site remember who you are between page loads, so you don&apos;t have to sign in on every
            single page. We also use browser local storage and session storage for similar purposes,
            this policy covers both.
          </p>
        </Section>

        <Section title="2. What we use, and what we don&apos;t">
          <p>
            HalalMe currently uses only <strong style={{ color: CREAM }}>strictly necessary</strong>{" "}
            and <strong style={{ color: CREAM }}>functional</strong> cookies and storage:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong style={{ color: CREAM }}>Authentication</strong> — keeps you signed in securely between visits. Without this, you&apos;d need to log in again on every page.</li>
            <li><strong style={{ color: CREAM }}>App functionality</strong> — remembers things like an in-progress Kitchen AI conversation or draft form data, so you don&apos;t lose your place if you navigate away and come back.</li>
          </ul>
          <p>
            We do not currently use advertising cookies or third-party analytics/tracking cookies. If
            that changes in future, for example to add privacy-respecting analytics, we&apos;ll update
            this policy and, where required by law, ask for your consent first.
          </p>
        </Section>

        <Section title="3. Managing cookies">
          <p>
            Because we only use strictly necessary cookies, there&apos;s no separate cookie consent
            banner on HalalMe, they&apos;re required for the site to function. You can still clear or
            block cookies through your browser settings at any time, but doing so may sign you out or
            break parts of the site that depend on them.
          </p>
        </Section>

        <Section title="4. Changes to this policy">
          <p>
            We&apos;ll update this page if the cookies and technologies we use change.
          </p>
        </Section>

        <Section title="5. Contact us">
          <p>
            Questions about cookies? Email{" "}
            <a href="mailto:support@halalme.co.uk" className="underline" style={{ color: GOLD }}>
              support@halalme.co.uk
            </a>
            .
          </p>
        </Section>
      </div>
    </section>
  );
}
