'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-32 pb-24 md:pt-40 md:pb-32 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900">
        {/* Ambient glow */}
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[150px]"></div>
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-[120px]"></div>

        <div className="mx-auto max-w-7xl relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-100 text-sm font-medium">We&apos;re Here For You</span>
            </motion.div>

            <motion.h1
              className="text-5xl font-extrabold tracking-tight text-white md:text-7xl"
              style={{ fontFamily: 'var(--font-headline)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Help &{' '}
              <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">
                Support
              </span>
            </motion.h1>
            <motion.p
              className="mt-8 text-xl leading-relaxed text-emerald-50/80 md:text-2xl font-normal"
              style={{ fontFamily: 'var(--font-body)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              How can we help you today?
            </motion.p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* Troubleshooting */}
      <TroubleshootingSection />

      {/* Contact CTA */}
      <ContactCTASection />
    </div>
  );
}

function FAQSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const faqCategories = [
    {
      category: 'General',
      questions: [
        {
          q: 'What is HalalMe?',
          a: 'HalalMe is a UK-focused halal ecosystem that brings together food delivery, recipes, community, charity, and travel services in one unified platform.',
        },
        {
          q: 'Is HalalMe free to use?',
          a: 'Yes! Creating an account and browsing services is completely free. You only pay when you place orders or use specific premium features.',
        },
        {
          q: 'Which countries do you operate in?',
          a: 'We currently operate in the United Kingdom, with plans to expand to other regions in the future.',
        },
      ],
    },
    {
      category: 'Accounts & Login',
      questions: [
        {
          q: 'How do I create an account?',
          a: 'Click the "Sign Up" button in the header, enter your email and password, and verify your email address to get started.',
        },
        {
          q: 'Can I use one account for all HalalMe services?',
          a: 'Yes! One HalalMe account gives you access to all our services: Delivery, Kitchen, Fresh, Hub, Travel, and Rewards.',
        },
        {
          q: 'I forgot my password — what do I do?',
          a: 'Click "Forgot Password" on the login page, enter your email, and we\'ll send you a reset link.',
        },
      ],
    },
    {
      category: 'Orders & Services',
      questions: [
        {
          q: 'How does HalalMe Delivery work?',
          a: 'Browse verified halal restaurants, add items to your cart, and checkout. Your order will be prepared and delivered to your address.',
        },
        {
          q: 'How do kitchens get approved?',
          a: 'All kitchens undergo strict halal certification verification and quality checks before being listed on our platform.',
        },
        {
          q: 'How do I earn or use rewards?',
          a: 'Earn rewards through orders, community engagement, and charity donations. Use them for discounts or donate them to causes.',
        },
      ],
    },
    {
      category: 'Payments & Refunds',
      questions: [
        {
          q: 'What payment methods are supported?',
          a: 'We accept all major credit/debit cards, Apple Pay, Google Pay, and PayPal.',
        },
        {
          q: 'How do refunds work?',
          a: 'Refunds are processed within 5-7 business days to your original payment method. Contact support for refund requests.',
        },
        {
          q: 'Is my payment information secure?',
          a: 'Yes! All payments are processed securely using industry-standard encryption and PCI-compliant payment gateways.',
        },
      ],
    },
    {
      category: 'Community & Rewards',
      questions: [
        {
          q: 'How does HalalMe Hub work?',
          a: 'Hub is our community space where you can share recipes, post food experiences, and connect with other halal food lovers.',
        },
        {
          q: 'How do donations & rewards work?',
          a: 'You can donate to verified charities through our Rewards service and earn points that can be used for discounts or further donations.',
        },
        {
          q: 'Is my charity donation secure?',
          a: 'Absolutely. All charity partners are verified, and donations are processed through secure, transparent channels.',
        },
      ],
    },
  ];

  return (
    <section ref={ref} className="px-6 py-24 bg-gradient-to-b from-white via-slate-50 to-white">
      <div className="mx-auto max-w-5xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            FAQs
          </span>
          <h2 className="text-4xl font-extrabold text-emerald-950 md:text-5xl mb-6" style={{ fontFamily: 'var(--font-headline)' }}>
            Frequently Asked Questions
          </h2>
        </motion.div>

        <div className="space-y-12">
          {faqCategories.map((category, idx) => (
            <div key={category.category}>
              <h3 className="text-2xl font-bold text-emerald-700 mb-6" style={{ fontFamily: 'var(--font-headline)' }}>
                {category.category}
              </h3>
              <div className="space-y-4">
                {category.questions.map((item, index) => (
                  <FAQItem key={index} question={item.q} answer={item.a} delay={idx * 0.1 + index * 0.05} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ question, answer, delay }: { question: string; answer: string; delay: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <motion.div
      ref={ref}
      className="border border-slate-200 rounded-xl overflow-hidden bg-white hover:border-emerald-300 transition-colors shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.4, delay }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-emerald-50/50 transition-colors"
      >
        <span className="text-lg font-semibold text-emerald-950" style={{ fontFamily: 'var(--font-headline)' }}>
          {question}
        </span>
        <svg
          className={`w-6 h-6 text-emerald-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-6 pb-4">
          <p className="text-slate-600 font-normal" style={{ fontFamily: 'var(--font-body)' }}>
            {answer}
          </p>
        </div>
      )}
    </motion.div>
  );
}

function TroubleshootingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const issues = [
    {
      issue: 'App/Website not loading',
      solution: 'Clear your browser cache and cookies, or try using a different browser. If the issue persists, contact support.',
    },
    {
      issue: 'Payment failed',
      solution: 'Check your card details and ensure you have sufficient funds. Try a different payment method or contact your bank.',
    },
    {
      issue: 'Order not received',
      solution: 'Check your order status in your account. If delayed beyond the estimated time, contact support with your order number.',
    },
    {
      issue: 'Account issues',
      solution: 'Try resetting your password. If you still can\'t access your account, contact support for assistance.',
    },
  ];

  return (
    <section ref={ref} className="px-6 py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="mx-auto max-w-5xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            Troubleshooting
          </span>
          <h2 className="text-4xl font-extrabold text-emerald-950 md:text-5xl mb-6" style={{ fontFamily: 'var(--font-headline)' }}>
            Common Issues & Solutions
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {issues.map((item, index) => (
            <motion.div
              key={item.issue}
              className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-emerald-300 hover:shadow-lg transition-all"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <h3 className="text-xl font-bold text-emerald-950 mb-3" style={{ fontFamily: 'var(--font-headline)' }}>
                {item.issue}
              </h3>
              <p className="text-slate-600 font-normal" style={{ fontFamily: 'var(--font-body)' }}>
                {item.solution}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactCTASection() {
  return (
    <section className="relative overflow-hidden px-6 py-24 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white">
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-emerald-600/30 to-teal-500/20 rounded-full blur-[150px] -translate-y-1/3 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-amber-500/15 to-orange-400/10 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4" />

      <div className="mx-auto max-w-4xl text-center relative z-10">
        <h2 className="text-4xl font-extrabold md:text-5xl mb-6" style={{ fontFamily: 'var(--font-headline)' }}>
          Still Need{' '}
          <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">
            Help?
          </span>
        </h2>
        <p className="text-xl text-emerald-100/70 mb-10 font-normal leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
          Our support team is here to assist you
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 px-8 py-4 text-lg font-bold text-emerald-950 transition-all shadow-lg shadow-amber-500/20"
          >
            Contact Support
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="mailto:support@halalme.co.uk"
            className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 bg-white/10 hover:bg-white/20 px-8 py-4 text-lg font-bold text-white transition-all"
          >
            Email Us
          </a>
        </div>
      </div>
    </section>
  );
}
