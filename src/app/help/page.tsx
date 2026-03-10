'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-[#102C26]">
      <HeroSection />
      <FAQSection />
      <TroubleshootingSection />
      <ContactCTASection />
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
            We&apos;re Here For You
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-5xl sm:text-6xl md:text-8xl lg:text-[clamp(4rem,10vw,10rem)] font-extrabold uppercase tracking-tighter leading-[0.88] text-[#F7E7CE]"
        >
          Help &amp;
          <br />
          <span className="text-[#F7E7CE]/45">Support</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-lg md:text-xl text-[#F7E7CE]/50 max-w-md leading-relaxed"
        >
          How can we help you today?
        </motion.p>
      </div>

      <div
        aria-hidden="true"
        className="absolute bottom-0 right-0 text-[10rem] md:text-[18rem] font-extrabold uppercase tracking-tighter leading-none text-[#102C26]/60 select-none pointer-events-none translate-x-8 translate-y-8"
      >
        Help
      </div>
    </section>
  );
}

/* ─── FAQ ──────────────────────────────────────────────────────────── */

function FAQSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const faqCategories = [
    {
      category: 'General',
      questions: [
        { q: 'What is HalalMe?',              a: 'HalalMe is a UK-focused halal ecosystem that brings together food delivery, recipes, community, charity, and travel services in one unified platform.' },
        { q: 'Is HalalMe free to use?',       a: 'Yes! Creating an account and browsing services is completely free. You only pay when you place orders or use specific premium features.' },
        { q: 'Which countries do you operate in?', a: 'We currently operate in the United Kingdom, with plans to expand to other regions in the future.' },
      ],
    },
    {
      category: 'Accounts & Login',
      questions: [
        { q: 'How do I create an account?',                     a: 'Click the "Sign Up" button in the header, enter your email and password, and verify your email address to get started.' },
        { q: 'Can I use one account for all HalalMe services?', a: 'Yes! One HalalMe account gives you access to all our services: Delivery, Kitchen, Fresh, Hub, Travel, and Rewards.' },
        { q: "I forgot my password — what do I do?",            a: "Click \"Forgot Password\" on the login page, enter your email, and we'll send you a reset link." },
      ],
    },
    {
      category: 'Orders & Services',
      questions: [
        { q: 'How does HalalMe Delivery work?', a: 'Browse verified halal restaurants, add items to your cart, and checkout. Your order will be prepared and delivered to your address.' },
        { q: 'How do kitchens get approved?',   a: 'All kitchens undergo strict halal certification verification and quality checks before being listed on our platform.' },
        { q: 'How do I earn or use rewards?',   a: 'Earn rewards through orders, community engagement, and charity donations. Use them for discounts or donate them to causes.' },
      ],
    },
    {
      category: 'Payments & Refunds',
      questions: [
        { q: 'What payment methods are supported?', a: 'We accept all major credit/debit cards, Apple Pay, Google Pay, and PayPal.' },
        { q: 'How do refunds work?',                a: 'Refunds are processed within 5-7 business days to your original payment method. Contact support for refund requests.' },
        { q: 'Is my payment information secure?',   a: 'Yes! All payments are processed securely using industry-standard encryption and PCI-compliant payment gateways.' },
      ],
    },
    {
      category: 'Community & Rewards',
      questions: [
        { q: 'How does HalalMe Hub work?',        a: 'Hub is our community space where you can share recipes, post food experiences, and connect with other halal food lovers.' },
        { q: 'How do donations & rewards work?',  a: 'You can donate to verified charities through our Rewards service and earn points that can be used for discounts or further donations.' },
        { q: 'Is my charity donation secure?',    a: 'Absolutely. All charity partners are verified, and donations are processed through secure, transparent channels.' },
      ],
    },
  ];

  return (
    <section ref={ref} className="bg-[#102C26] px-6 py-24 md:py-32">
      <div className="max-w-[95vw] mx-auto mb-14 md:mb-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-8 h-px bg-[#F59E0B]" />
          <span className="text-[#F59E0B] text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]">
            FAQs
          </span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88] text-[#F7E7CE]"
        >
          Frequently
          <br />
          <span className="text-[#F7E7CE]/45">Asked Questions</span>
        </motion.h2>
      </div>

      <div className="max-w-[95vw] mx-auto space-y-12 md:space-y-16">
        {faqCategories.map((cat, idx) => (
          <div key={cat.category}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-6 h-px bg-[#F7E7CE]/20" />
              <h3 className="text-[#F7E7CE]/40 text-xs uppercase tracking-[0.25em] font-bold">
                {cat.category}
              </h3>
            </div>
            <div className="space-y-px bg-[#F7E7CE]/8">
              {cat.questions.map((item, i) => (
                <FAQItem key={i} question={item.q} answer={item.a} delay={idx * 0.1 + i * 0.05} isInView={isInView} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FAQItem({ question, answer, delay, isInView }: { question: string; answer: string; delay: number; isInView: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay }}
      className="bg-[#102C26] border-x border-[#F7E7CE]/8"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-[#F7E7CE]/5 transition-colors"
      >
        <span className="text-base md:text-lg font-semibold text-[#F7E7CE]/80 pr-6 uppercase tracking-tight">
          {question}
        </span>
        <svg
          className={`w-5 h-5 text-[#F7E7CE]/35 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="px-6 pb-5 border-t border-[#F7E7CE]/8"
        >
          <p className="text-[#F7E7CE]/50 leading-relaxed pt-4 text-sm md:text-base">
            {answer}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ─── Troubleshooting ──────────────────────────────────────────────── */

function TroubleshootingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const issues = [
    { num: '01', issue: 'App/Website not loading', solution: 'Clear your browser cache and cookies, or try using a different browser. If the issue persists, contact support.' },
    { num: '02', issue: 'Payment failed',           solution: 'Check your card details and ensure you have sufficient funds. Try a different payment method or contact your bank.' },
    { num: '03', issue: 'Order not received',       solution: 'Check your order status in your account. If delayed beyond the estimated time, contact support with your order number.' },
    { num: '04', issue: 'Account issues',           solution: "Try resetting your password. If you still can't access your account, contact support for assistance." },
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
            Troubleshooting
          </span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88] text-[#F7E7CE]"
        >
          Common Issues
          <br />
          <span className="text-[#F7E7CE]/45">&amp; Solutions</span>
        </motion.h2>
      </div>

      <div className="max-w-[95vw] mx-auto grid md:grid-cols-2 gap-px bg-[#F7E7CE]/8">
        {issues.map((item, i) => (
          <motion.div
            key={item.issue}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="group relative bg-[#0A1C19] border border-[#F7E7CE]/8 p-8 overflow-hidden hover:bg-[#F7E7CE] transition-colors duration-300 cursor-default"
          >
            <span
              aria-hidden="true"
              className="absolute -top-4 -right-2 text-[6rem] font-extrabold text-[#102C26] group-hover:text-[#0A1C19]/12 leading-none select-none pointer-events-none transition-colors duration-300"
            >
              {item.num}
            </span>
            <div className="relative z-10">
              <h3 className="text-lg md:text-xl font-extrabold uppercase tracking-tighter text-[#F7E7CE] group-hover:text-[#102C26] mb-3 transition-colors duration-300">
                {item.issue}
              </h3>
              <p className="text-[#F7E7CE]/45 group-hover:text-[#102C26]/60 leading-relaxed text-sm md:text-base transition-colors duration-300">
                {item.solution}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ─── Contact CTA ──────────────────────────────────────────────────── */

function ContactCTASection() {
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
            Still Need Help?
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88] text-[#102C26] mb-8 max-w-3xl"
        >
          Still Need
          <br />
          <span className="text-[#102C26]/45">Help?</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
          className="text-[#102C26]/55 text-base md:text-lg max-w-md mb-12 leading-relaxed"
        >
          Our support team is here to assist you.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link href="/contact">
            <button className="flex items-center gap-3 px-8 py-4 bg-[#102C26] text-[#F7E7CE] font-extrabold uppercase tracking-tighter text-base hover:bg-[#0A1C19] transition-colors">
              Contact Support
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
          <a href="mailto:support@halalme.co.uk">
            <button className="flex items-center gap-3 px-8 py-4 border-2 border-[#102C26] text-[#102C26] font-extrabold uppercase tracking-tighter text-base hover:bg-[#102C26] hover:text-[#F7E7CE] transition-colors">
              Email Us
            </button>
          </a>
        </motion.div>
      </div>

      <div
        aria-hidden="true"
        className="absolute bottom-0 right-0 text-[8rem] md:text-[14rem] font-extrabold uppercase tracking-tighter leading-none text-[#102C26]/8 select-none pointer-events-none translate-x-6 translate-y-6"
      >
        Support
      </div>
    </section>
  );
}
