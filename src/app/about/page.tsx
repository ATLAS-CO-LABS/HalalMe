'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-32 pb-24 md:pt-40 md:pb-32 bg-gradient-to-br from-[#3B0764] via-[#A855F7] to-[#9333ea]">
        <div className="mx-auto max-w-7xl relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <motion.h1
              className="text-5xl font-extrabold tracking-tight text-white md:text-7xl"
              style={{ fontFamily: 'var(--font-headline)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              About HalalMe
            </motion.h1>
            <motion.p
              className="mt-8 text-xl leading-relaxed text-purple-50 md:text-2xl font-normal"
              style={{ fontFamily: 'var(--font-body)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Building the UK's leading halal lifestyle ecosystem
            </motion.p>
          </div>
        </div>
      </section>

      {/* Who We Are */}
      <WhoWeAreSection />

      {/* Our Mission */}
      <OurMissionSection />

      {/* What We Offer */}
      <WhatWeOfferSection />

      {/* Why Different */}
      <WhyDifferentSection />

      {/* Our Values */}
      <OurValuesSection />

      {/* Future Vision */}
      <FutureVisionSection />

      {/* CTA Section */}
      <CTASection />

    </div>
  );
}

function WhoWeAreSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section ref={ref} className="px-6 py-24 bg-white">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-6 py-2 rounded-full bg-purple-100 text-purple-700 font-semibold text-sm mb-6">
            Who We Are
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 md:text-5xl mb-6" style={{ fontFamily: 'var(--font-headline)' }}>
            One Platform. Endless Possibilities.
          </h2>
          <p className="text-xl text-gray-700 leading-relaxed font-normal" style={{ fontFamily: 'var(--font-body)' }}>
            HalalMe is a UK-focused halal ecosystem designed to make halal living easier, more transparent, and more rewarding — from food delivery to community and charity. We bring together everything you need for a complete halal lifestyle in one trusted platform.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function OurMissionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section ref={ref} className="px-6 py-24 bg-gradient-to-br from-purple-50 via-white to-purple-50/30">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-6 py-2 rounded-full bg-purple-100 text-purple-700 font-semibold text-sm mb-6">
            Our Mission
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 md:text-5xl mb-6" style={{ fontFamily: 'var(--font-headline)' }}>
            Connecting Food, Community & Purpose
          </h2>
          <p className="text-xl text-gray-700 leading-relaxed font-normal" style={{ fontFamily: 'var(--font-body)' }}>
            Our mission is to build a single halal-first digital ecosystem that connects food, community, and purpose — all in one trusted platform. We're solving the fragmentation in halal services by creating a unified experience where every interaction adds value to your life.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function WhatWeOfferSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const services = [
    {
      name: 'HalalMe | Delivery',
      description: 'Halal food delivery from trusted partners',
      icon: '🚚',
    },
    {
      name: 'HalalMe | Kitchen',
      description: 'Home-style kitchens & curated halal meals',
      icon: '🍳',
    },
    {
      name: 'HalalMe | Fresh',
      description: 'Pre-made ready meals delivered fresh',
      icon: '📦',
    },
    {
      name: 'HalalMe | Hub',
      description: 'Community posts, recipes, and discussions',
      icon: '👥',
    },
    {
      name: 'HalalMe | Rewards',
      description: 'Charity, sadaqah & reward-based donations',
      icon: '💚',
    },
    {
      name: 'HalalMe | Travel',
      description: 'Online travel recommendations and flight booking',
      icon: '✈️',
    },
  ];

  return (
    <section ref={ref} className="px-6 py-24 bg-white">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-6 py-2 rounded-full bg-purple-100 text-purple-700 font-semibold text-sm mb-6">
            What We Offer
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 md:text-5xl mb-6" style={{ fontFamily: 'var(--font-headline)' }}>
            The Complete Halal Ecosystem
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.name}
              className="bg-white border-2 border-purple-200 rounded-2xl p-6 hover:shadow-lg hover:border-purple-400 transition-all"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="text-4xl mb-4">{service.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
                {service.name}
              </h3>
              <p className="text-gray-600 font-normal" style={{ fontFamily: 'var(--font-body)' }}>
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyDifferentSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const differences = [
    '100% halal-focused ecosystem',
    'Community-driven platform',
    'Transparency & trust at every step',
    'Purpose beyond profit (charity & rewards)',
  ];

  return (
    <section ref={ref} className="px-6 py-24 bg-gradient-to-br from-purple-50 via-white to-purple-50/30">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-6 py-2 rounded-full bg-purple-100 text-purple-700 font-semibold text-sm mb-6">
            Why Choose Us
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 md:text-5xl mb-8" style={{ fontFamily: 'var(--font-headline)' }}>
            Why HalalMe Is Different
          </h2>
          <ul className="space-y-4">
            {differences.map((item, index) => (
              <motion.li
                key={index}
                className="flex items-start gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-xl text-gray-700 font-normal" style={{ fontFamily: 'var(--font-body)' }}>
                  {item}
                </span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}

function OurValuesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const values = [
    {
      title: 'Trust & Transparency',
      description: 'Every service is verified and halal-certified, ensuring complete transparency',
      icon: '🔒',
    },
    {
      title: 'Community First',
      description: 'Built by the community, for the community — your voice matters',
      icon: '👥',
    },
    {
      title: 'Halal Integrity',
      description: '100% commitment to halal standards across all our services',
      icon: '✓',
    },
    {
      title: 'Innovation with Purpose',
      description: 'Using technology to make halal living easier and more rewarding',
      icon: '💡',
    },
  ];

  return (
    <section ref={ref} className="px-6 py-24 bg-white">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-6 py-2 rounded-full bg-purple-100 text-purple-700 font-semibold text-sm mb-6">
            Our Values
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 md:text-5xl mb-6" style={{ fontFamily: 'var(--font-headline)' }}>
            What We Stand For
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              className="bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-2xl p-8"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="text-5xl mb-4">{value.icon}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'var(--font-headline)' }}>
                {value.title}
              </h3>
              <p className="text-gray-600 font-normal" style={{ fontFamily: 'var(--font-body)' }}>
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FutureVisionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section ref={ref} className="px-6 py-24 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-6 py-2 rounded-full bg-purple-600/30 text-purple-200 font-semibold text-sm mb-6">
            Future Vision
          </div>
          <h2 className="text-4xl font-extrabold md:text-5xl mb-6" style={{ fontFamily: 'var(--font-headline)' }}>
            Building the Future of Halal Living
          </h2>
          <p className="text-xl text-gray-300 leading-relaxed font-normal" style={{ fontFamily: 'var(--font-body)' }}>
            We aim to become the leading halal lifestyle platform in the UK and beyond — empowering users, partners, and communities globally. Our vision is to create a world where accessing halal services is seamless, trustworthy, and rewarding.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="px-6 py-16 bg-white border-t border-gray-200">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6" style={{ fontFamily: 'var(--font-headline)' }}>
          Ready to Join HalalMe?
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-purple-600 hover:bg-purple-700 px-8 py-4 text-lg font-medium text-white transition-all shadow-lg"
          >
            Explore Services
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full border-2 border-purple-600 bg-white hover:bg-purple-50 px-8 py-4 text-lg font-medium text-purple-600 transition-all"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}
