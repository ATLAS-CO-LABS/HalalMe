'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { Star, ArrowRight } from 'lucide-react';

export default function AboutPage() {
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
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="text-emerald-100 text-sm font-medium">Our Story</span>
            </motion.div>

            <motion.h1
              className="text-5xl font-extrabold tracking-tight text-white md:text-7xl"
              style={{ fontFamily: 'var(--font-headline)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              About{' '}
              <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">
                HalalMe
              </span>
            </motion.h1>
            <motion.p
              className="mt-8 text-xl leading-relaxed text-emerald-50/80 md:text-2xl font-normal"
              style={{ fontFamily: 'var(--font-body)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Building the UK&apos;s leading halal lifestyle ecosystem
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
    <section ref={ref} className="px-6 py-24 bg-gradient-to-b from-white via-slate-50 to-white">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Star className="w-4 h-4" />
            Who We Are
          </span>
          <h2 className="text-4xl font-extrabold text-emerald-950 md:text-5xl mb-6" style={{ fontFamily: 'var(--font-headline)' }}>
            One Platform.{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Endless Possibilities.
            </span>
          </h2>
          <p className="text-xl text-slate-600 leading-relaxed font-normal" style={{ fontFamily: 'var(--font-body)' }}>
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
    <section ref={ref} className="px-6 py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            Our Mission
          </span>
          <h2 className="text-4xl font-extrabold text-emerald-950 md:text-5xl mb-6" style={{ fontFamily: 'var(--font-headline)' }}>
            Connecting Food, Community &{' '}
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              Purpose
            </span>
          </h2>
          <p className="text-xl text-slate-600 leading-relaxed font-normal" style={{ fontFamily: 'var(--font-body)' }}>
            Our mission is to build a single halal-first digital ecosystem that connects food, community, and purpose — all in one trusted platform. We&apos;re solving the fragmentation in halal services by creating a unified experience where every interaction adds value to your life.
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
      gradient: 'from-emerald-50 to-teal-50',
      border: 'hover:border-emerald-300',
    },
    {
      name: 'HalalMe | Kitchen',
      description: 'Home-style kitchens & curated halal meals',
      gradient: 'from-amber-50 to-orange-50',
      border: 'hover:border-amber-300',
    },
    {
      name: 'HalalMe | Fresh',
      description: 'Pre-made ready meals delivered fresh',
      gradient: 'from-emerald-50 to-teal-50',
      border: 'hover:border-emerald-300',
    },
    {
      name: 'HalalMe | Hub',
      description: 'Community posts, recipes, and discussions',
      gradient: 'from-teal-50 to-emerald-50',
      border: 'hover:border-teal-300',
    },
    {
      name: 'HalalMe | Rewards',
      description: 'Charity, sadaqah & reward-based donations',
      gradient: 'from-emerald-50 to-teal-50',
      border: 'hover:border-emerald-300',
    },
    {
      name: 'HalalMe | Travel',
      description: 'Online travel recommendations and flight booking',
      gradient: 'from-amber-50 to-orange-50',
      border: 'hover:border-amber-300',
    },
  ];

  return (
    <section ref={ref} className="px-6 py-24 bg-gradient-to-b from-white via-slate-50 to-white relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-100 rounded-full filter blur-3xl opacity-40 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-100 rounded-full filter blur-3xl opacity-40 translate-x-1/2 translate-y-1/2"></div>

      <div className="mx-auto max-w-6xl relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            What We Offer
          </span>
          <h2 className="text-4xl font-extrabold text-emerald-950 md:text-5xl mb-6" style={{ fontFamily: 'var(--font-headline)' }}>
            The Complete{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Halal Ecosystem
            </span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.name}
              className={`group relative bg-white border border-slate-200 rounded-2xl p-6 ${service.border} hover:shadow-lg transition-all`}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-emerald-950 mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
                  {service.name}
                </h3>
                <p className="text-slate-600 font-normal" style={{ fontFamily: 'var(--font-body)' }}>
                  {service.description}
                </p>
              </div>
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
    <section ref={ref} className="px-6 py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            Why Choose Us
          </span>
          <h2 className="text-4xl font-extrabold text-emerald-950 md:text-5xl mb-8" style={{ fontFamily: 'var(--font-headline)' }}>
            Why HalalMe Is{' '}
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              Different
            </span>
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
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-xl text-slate-600 font-normal" style={{ fontFamily: 'var(--font-body)' }}>
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
      gradient: 'from-emerald-50 to-teal-50',
    },
    {
      title: 'Community First',
      description: 'Built by the community, for the community — your voice matters',
      gradient: 'from-amber-50 to-orange-50',
    },
    {
      title: 'Halal Integrity',
      description: '100% commitment to halal standards across all our services',
      gradient: 'from-teal-50 to-emerald-50',
    },
    {
      title: 'Innovation with Purpose',
      description: 'Using technology to make halal living easier and more rewarding',
      gradient: 'from-emerald-50 to-teal-50',
    },
  ];

  return (
    <section ref={ref} className="px-6 py-24 bg-gradient-to-b from-white via-slate-50 to-white">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            Our Values
          </span>
          <h2 className="text-4xl font-extrabold text-emerald-950 md:text-5xl mb-6" style={{ fontFamily: 'var(--font-headline)' }}>
            What We{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Stand For
            </span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              className="group relative bg-white border border-slate-200 rounded-2xl p-8 hover:border-emerald-300 hover:shadow-lg transition-all"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${value.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-emerald-950 mb-3" style={{ fontFamily: 'var(--font-headline)' }}>
                  {value.title}
                </h3>
                <p className="text-slate-600 font-normal" style={{ fontFamily: 'var(--font-body)' }}>
                  {value.description}
                </p>
              </div>
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
    <section ref={ref} className="relative overflow-hidden px-6 py-24 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white">
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-emerald-600/30 to-teal-500/20 rounded-full blur-[150px] -translate-y-1/3 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-amber-500/15 to-orange-400/10 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4" />

      <div className="mx-auto max-w-4xl text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
            <span className="text-emerald-200/80 text-sm font-medium tracking-wide uppercase">
              Future Vision
            </span>
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
          </span>
          <h2 className="text-4xl font-extrabold md:text-5xl mb-6" style={{ fontFamily: 'var(--font-headline)' }}>
            Building the Future of{' '}
            <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
              Halal Living
            </span>
          </h2>
          <p className="text-xl text-emerald-100/70 leading-relaxed font-normal" style={{ fontFamily: 'var(--font-body)' }}>
            We aim to become the leading halal lifestyle platform in the UK and beyond — empowering users, partners, and communities globally. Our vision is to create a world where accessing halal services is seamless, trustworthy, and rewarding.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="px-6 py-24 bg-gradient-to-b from-white via-slate-50 to-white">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-4xl font-extrabold text-emerald-950 mb-6 md:text-5xl" style={{ fontFamily: 'var(--font-headline)' }}>
          Ready to Join{' '}
          <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            HalalMe?
          </span>
        </h2>
        <p className="text-lg text-slate-600 mb-10 max-w-xl mx-auto" style={{ fontFamily: 'var(--font-body)' }}>
          Join a global community that values quality, faith, and seamless technology.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-8 py-4 text-lg font-bold text-white transition-all shadow-lg shadow-emerald-500/20"
          >
            Explore Services
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full border-2 border-emerald-600 bg-white hover:bg-emerald-50 px-8 py-4 text-lg font-bold text-emerald-700 transition-all"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}
