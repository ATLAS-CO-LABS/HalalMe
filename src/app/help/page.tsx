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
          className="text-4xl sm:text-6xl md:text-8xl font-extrabold uppercase tracking-tighter leading-[0.88] text-[#F7E7CE]"
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
        { q: 'What is HalalMe?',                   a: 'HalalMe is a UK-focused halal lifestyle platform that brings together food delivery, AI-powered recipes, community, and charity rewards in one unified account.' },
        { q: 'Is HalalMe free to use?',            a: 'Yes! Creating an account and browsing services is completely free. You only pay when you place orders through Delivery or donate through Rewards.' },
        { q: 'Which countries do you operate in?', a: 'We currently operate in the United Kingdom, with plans to expand to other regions in the future.' },
        { q: 'How is HalalMe different from other food apps?', a: 'HalalMe is exclusively halal - every partner, recipe, and product is vetted. We also go beyond food, connecting delivery, recipes, community, and charity in one place.' },
        { q: 'Are all services live?',             a: 'Delivery, Kitchen, Hub, and Rewards are live now. Additional services are in development and will be launched in future phases.' },
      ],
    },
    {
      category: 'Accounts & Login',
      questions: [
        { q: 'How do I create an account?',                     a: 'Click the "Sign Up" button in the header, choose your account type, enter your email and password, and verify your email address to get started.' },
        { q: 'Can I use one account for all HalalMe services?', a: 'Yes! One HalalMe account gives you access to all active services: Delivery, Kitchen, Hub, and Rewards - with more coming.' },
        { q: 'I forgot my password - what do I do?',            a: 'Click "Forgot Password" on the login page, enter your email, and we\'ll send you a one-time password reset link.' },
        { q: 'How do I update my profile information?',         a: 'Go to your Dashboard and click "Edit Profile" or navigate to the Settings page from the header.' },
        { q: 'Can I delete my account?',                        a: 'Yes. Contact our support team at support@halalme.co.uk and we will process your account deletion request within 7 working days.' },
        { q: 'Is my personal data safe?',                       a: 'Absolutely. We follow GDPR guidelines and never sell your data to third parties. See our Privacy Policy for full details.' },
      ],
    },
    {
      category: 'Delivery',
      questions: [
        { q: 'How does HalalMe Delivery work?',         a: 'Browse verified halal restaurants near you, add items to your cart, and checkout. Your order will be prepared and delivered to your address.' },
        { q: 'How are restaurants verified as halal?',  a: 'All restaurants must provide valid halal certification from a recognised body. Our team reviews and verifies each application before listing.' },
        { q: 'What areas does delivery cover?',         a: 'We are currently expanding our delivery network across the UK. Check the Delivery page to see if your postcode is covered.' },
        { q: 'Can I track my order?',                   a: 'Yes. Once your order is confirmed, you can track its status in real time from your account dashboard.' },
        { q: 'What if my order is wrong or missing items?', a: 'Contact support immediately through the app or at support@halalme.co.uk with your order number and we will resolve it promptly.' },
      ],
    },
    {
      category: 'Kitchen & Recipes',
      questions: [
        { q: 'What is HalalMe Kitchen?',                   a: 'Kitchen is your halal recipe hub - browse thousands of verified halal recipes, generate AI-powered meal plans, and get step-by-step cooking guidance.' },
        { q: 'How does the AI recipe assistant work?',     a: 'Our AI assistant uses your preferences, dietary requirements, and available ingredients to suggest personalised halal recipes and meal plans.' },
        { q: 'Can I upload my own recipes?',               a: 'Yes! Signed-in users can upload and share their own halal recipes with the community from the Kitchen section.' },
        { q: 'Are all recipes certified halal?',           a: 'All recipes on the platform are reviewed to ensure they use only halal ingredients. Community-uploaded recipes go through a moderation process.' },
        { q: 'Can I save my favourite recipes?',           a: 'Yes. Hit the bookmark icon on any recipe to save it. Access all saved recipes from your Dashboard under "Saved Items".' },
      ],
    },
    {
      category: 'Hub & Community',
      questions: [
        { q: 'What is HalalMe Hub?',                      a: 'Hub is our halal community space where you can share posts, recipes, food experiences, and connect with Muslims around the world.' },
        { q: 'How do I create a post on Hub?',            a: 'Sign in and click the "Create Post" button on the Hub page. You can add text, images, and tags to share with the community.' },
        { q: 'Can I follow other users?',                  a: 'Yes. Visit any user\'s profile and click Follow. Their new posts will appear in your feed.' },
        { q: 'How are posts moderated?',                   a: 'Our moderation team reviews flagged content. You can report any post or comment that violates our community guidelines.' },
        { q: 'Is Hub free to use?',                        a: 'Yes, Hub is completely free. All you need is a HalalMe account to post, comment, follow, and engage with the community.' },
      ],
    },
    {
      category: 'Rewards & Charity',
      questions: [
        { q: 'How do I earn reward points?',              a: 'Earn points by placing orders through Delivery, engaging on Hub, saving recipes on Kitchen, and completing your profile.' },
        { q: 'How do I use my reward points?',            a: 'Points can be redeemed for discounts on future orders, or donated to a verified Islamic charity of your choice through the Rewards page.' },
        { q: 'Which charities are supported?',            a: 'We partner with verified UK-registered Islamic charities. You can browse and select from the full list on the Rewards page.' },
        { q: 'Is my charity donation secure?',            a: 'Absolutely. All charity partners are verified organisations, and donations are processed through secure, transparent payment channels.' },
        { q: 'Do reward points expire?',                  a: 'Points are valid for 12 months from the date they were earned. You will receive a reminder before any points are set to expire.' },
      ],
    },
    {
      category: 'Payments & Refunds',
      questions: [
        { q: 'What payment methods are supported?',  a: 'We accept all major credit and debit cards, Apple Pay, Google Pay, and PayPal.' },
        { q: 'How do refunds work?',                 a: 'Refunds are processed within 5–7 business days to your original payment method. Contact support with your order number to request a refund.' },
        { q: 'Is my payment information secure?',    a: 'Yes. All payments are processed through PCI-compliant, industry-standard encrypted payment gateways. We do not store your card details.' },
        { q: 'Will I receive a receipt?',            a: 'Yes. A receipt is automatically emailed to your registered address after every successful transaction.' },
        { q: 'Can I get a VAT invoice?',             a: 'Yes. Contact support@halalme.co.uk with your order details and we will issue a VAT invoice within 2 working days.' },
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
