'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import FlowingMenu from '@/components/navigation/FlowingMenu';
import GradientCarousel from '@/components/ecosystem/GradientCarousel';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans antialiased">
      {/* Hero Section - Warm gradient with emerald and amber */}
      <HeroSection />

      {/* What is HalalMe - Enhanced */}
      <WhatIsHalalMeSection />

      {/* The HalalMe Network - Enhanced */}
      <section className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 relative overflow-hidden">
        <div className="mx-auto max-w-5xl relative px-6 py-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-white md:text-5xl mb-6 fade-in-section" style={{ fontFamily: 'var(--font-headline)' }}>The HalalMe Network</h2>
            <div className="bg-gradient-to-br from-white/10 via-gray-500/20 to-white/5 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-xl border border-gray-400/30 fade-in-section animation-delay-400">
              <p className="text-xl leading-relaxed text-gray-100 mb-6 font-normal" style={{ fontFamily: 'var(--font-body)' }}>
                The HalalMe Network is made up of <span className="font-semibold text-gray-300">six connected services</span>,
                each designed to solve a <span className="font-semibold text-[#FF8A1E]">specific need</span> in the halal food space.
              </p>
              <p className="text-lg leading-relaxed text-gray-200 font-normal" style={{ fontFamily: 'var(--font-body)' }}>
                Every service works independently but is connected through <span className="font-semibold text-gray-300">one HalalMe account</span>.
                Users can move between services <span className="font-semibold text-[#FF8A1E]">seamlessly</span> while staying within the HalalMe platform.
              </p>
            </div>
          </div>
        </div>

        {/* Flowing Menu */}
        <FlowingMenu
          items={[
            {
              link: '#delivery',
              text: 'HalalMe Delivery',
              image: '/images/services/delivery.jpg'
            },
            {
              link: '#kitchen',
              text: 'HalalMe Kitchen',
              image: '/images/services/kitchen.jpg'
            },
            {
              link: '#fresh',
              text: 'HalalMe Fresh',
              image: '/images/services/fresh.jpg'
            },
            {
              link: '#hub',
              text: 'HalalMe Hub',
              image: '/images/services/hub.jpg'
            },
            {
              link: '#travel',
              text: 'HalalMe Travel',
              image: '/images/services/travel.jpg'
            },
            {
              link: '#rewards',
              text: 'HalalMe Rewards',
              image: '/images/services/rewards.jpg'
            }
          ]}
          speed={15}
          textColor="#fff"
          bgColor="#060010"
          marqueeBgColor="#fff"
          marqueeTextColor="#060010"
          borderColor="#fff"
        />
      </section>


      {/* Why Choose HalalMe - Enhanced */}
      <WhyChooseHalalMeSection />

      {/* How HalalMe Works - Enhanced */}
      <section className="px-6 py-24 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16 fade-in-section">
            <h2 className="text-4xl font-extrabold text-white md:text-5xl mb-4" style={{ fontFamily: 'var(--font-headline)' }}>How HalalMe Works</h2>
            <p className="mt-4 text-xl text-gray-200 font-normal" style={{ fontFamily: 'var(--font-body)' }}>Simple steps to get started</p>
          </div>

          <div className="grid gap-8 md:grid-cols-4 relative">
            {/* Connection lines */}
            <div className="hidden md:block absolute top-8 left-0 right-0 h-1 bg-gradient-to-r from-gray-500 via-gray-400 to-gray-500"></div>

            <StepCard
              number="1"
              title="Create a HalalMe account"
              description="Sign up once and access all services"
              color="purple"
              delay="200"
            />
            <StepCard
              number="2"
              title="Choose a service"
              description="Delivery, Kitchen, Fresh, Hub, Travel, or Rewards"
              color="purple"
              delay="400"
            />
            <StepCard
              number="3"
              title="Order, cook, share, or donate"
              description="Use the service that fits your needs"
              color="purple"
              delay="600"
            />
            <StepCard
              number="4"
              title="Stay connected"
              description="Move seamlessly between services"
              color="purple"
              delay="800"
            />
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="px-6 py-24 md:py-32 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full filter blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-20"></div>
        </div>

        <div className="mx-auto max-w-5xl text-center relative">
          <h2 className="text-4xl font-extrabold text-white md:text-5xl mb-6" style={{ fontFamily: 'var(--font-headline)' }}>
            Start your <span className="text-transparent bg-gradient-to-r from-purple-300 to-purple-100 bg-clip-text">halal food journey</span> with HalalMe
          </h2>
          <p className="mt-6 text-xl text-gray-300 mb-12 font-normal" style={{ fontFamily: 'var(--font-body)' }}>
            Join thousands of users enjoying the complete halal lifestyle platform
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <CTAButton variant="primary">Get Started</CTAButton>
            <CTAButton variant="secondary">Join HalalMe Today</CTAButton>
          </div>
        </div>
      </section>
    </div>
  );
}

// Hero Section Component - Simplified
function HeroSection() {
  return (
    <section className="relative overflow-hidden h-screen min-h-[600px] max-h-[900px]">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero/halal4.jpg"
          alt="Halal Food Background"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Subtle gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40"></div>
      </div>
      <div className="mx-auto max-w-7xl relative z-10 h-full flex items-center justify-center px-6">
        <div className="mx-auto max-w-4xl text-center">
          <motion.h1
            className="text-5xl font-extrabold tracking-tight text-white md:text-7xl drop-shadow-lg"
            style={{ fontFamily: 'var(--font-headline)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            HalalMe <span className="text-amber-300">One Platform</span> for{' '}
            <span className="text-white">
              Halal Food, Recipes, Community & Giving
            </span>
          </motion.h1>
          <motion.div
            className="mt-12 flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            <motion.a
              href="#ecosystem"
              className="group inline-flex items-center gap-3 rounded-full bg-[#FF8A1E] px-8 py-4 text-lg font-medium text-white transition-all shadow-lg"
              whileHover={{ scale: 1.05, boxShadow: "0 20px 60px -15px rgba(255, 138, 30, 0.6)" }}
              whileTap={{ scale: 0.98 }}
            >
              Explore HalalMe
              <motion.svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </motion.svg>
            </motion.a>
            <motion.a
              href="#ecosystem"
              className="group inline-flex items-center gap-3 rounded-full border-2 border-white/80 bg-white/10 backdrop-blur-sm px-8 py-4 text-lg font-medium text-white transition-all"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.2)", borderColor: "#ffffff", boxShadow: "0 10px 40px -15px rgba(255, 255, 255, 0.3)" }}
              whileTap={{ scale: 0.98 }}
            >
              Join HalalMe
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// What is HalalMe Section with Gradient Carousel
function WhatIsHalalMeSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const carouselItems = [
    {
      icon: renderRetroIcon("target", "w-12 h-12 text-white"),
      title: "One Platform",
      description: "Instead of using multiple apps or platforms, HalalMe brings everything together in one place.",
      gradient: "from-gray-700 via-gray-800 to-gray-900"
    },
    {
      icon: renderRetroIcon("shield", "w-12 h-12 text-white"),
      title: "Trusted & Verified",
      description: "Every service is halal-certified and verified, ensuring trust and quality at every step.",
      gradient: "from-[#FF8A1E] via-[#E67A15] to-[#CC6A0F]"
    },
    {
      icon: renderRetroIcon("users", "w-12 h-12 text-white"),
      title: "Community-Focused",
      description: "Built for the global Muslim community with values of trust, transparency, and innovation.",
      gradient: "from-gray-700 via-gray-800 to-gray-900"
    }
  ];

  return (
    <section ref={ref} className="px-6 py-24 bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900 relative overflow-hidden">
      <motion.div
        className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-600/20 to-transparent rounded-full filter blur-3xl opacity-30"
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-amber-500/20 to-transparent rounded-full filter blur-3xl opacity-30"
        animate={{ scale: [1, 1.1, 1], rotate: [0, -90, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />

      <div className="mx-auto max-w-6xl relative">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2
            className="text-4xl font-extrabold text-white md:text-5xl mb-6"
            style={{ fontFamily: 'var(--font-headline)' }}
          >
            What is HalalMe?
          </h2>
          <p
            className="text-xl leading-relaxed text-gray-200 max-w-3xl mx-auto font-normal"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            HalalMe is a <span className="font-semibold text-gray-300">multi-service</span> halal food platform designed to cover every part of the halal food
            experience — from <span className="font-semibold text-[#FF8A1E]">ordering halal meals</span>, discovering and sharing recipes, getting ready-made meals,
            connecting with a <span className="font-semibold text-[#FF8A1E]">food community</span>, experiencing halal travel, and contributing to halal causes.
          </p>
        </motion.div>

        <GradientCarousel items={carouselItems} />
      </div>
    </section>
  );
}

// Render retro SVG icons
function renderRetroIcon(iconName: string, className: string = "w-8 h-8") {
  const icons: Record<string, React.ReactElement> = {
    globe: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
    ),
    check: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    ),
    cpu: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
        <rect x="9" y="9" width="6" height="6"></rect>
        <line x1="9" y1="1" x2="9" y2="4"></line>
        <line x1="15" y1="1" x2="15" y2="4"></line>
        <line x1="9" y1="20" x2="9" y2="23"></line>
        <line x1="15" y1="20" x2="15" y2="23"></line>
        <line x1="20" y1="9" x2="23" y2="9"></line>
        <line x1="20" y1="14" x2="23" y2="14"></line>
        <line x1="1" y1="9" x2="4" y2="9"></line>
        <line x1="1" y1="14" x2="4" y2="14"></line>
      </svg>
    ),
    box: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
        <line x1="12" y1="22.08" x2="12" y2="12"></line>
      </svg>
    ),
    users: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    ),
    map: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
        <line x1="8" y1="2" x2="8" y2="18"></line>
        <line x1="16" y1="6" x2="16" y2="22"></line>
      </svg>
    ),
    heart: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    ),
    target: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="12" r="6"></circle>
        <circle cx="12" cy="12" r="2"></circle>
      </svg>
    ),
    shield: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </svg>
    ),
    truck: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13"></rect>
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
        <circle cx="5.5" cy="18.5" r="2.5"></circle>
        <circle cx="18.5" cy="18.5" r="2.5"></circle>
      </svg>
    ),
    chef: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"></path>
        <line x1="6" y1="17" x2="18" y2="17"></line>
      </svg>
    ),
    package: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
        <line x1="12" y1="22.08" x2="12" y2="12"></line>
      </svg>
    ),
  };

  return icons[iconName] || icons.box;
}

// Why Choose HalalMe Section with Gradient Carousel
function WhyChooseHalalMeSection() {
  const carouselItems = [
    {
      icon: renderRetroIcon("globe", "w-12 h-12 text-white"),
      title: "One platform, multiple halal services",
      description: "Access all halal services from a single account",
      gradient: "from-gray-700 via-gray-800 to-gray-900"
    },
    {
      icon: renderRetroIcon("check", "w-12 h-12 text-white"),
      title: "Trusted halal-focused system",
      description: "Every service verified and halal-certified",
      gradient: "from-[#FF8A1E] via-[#E67A15] to-[#CC6A0F]"
    },
    {
      icon: renderRetroIcon("cpu", "w-12 h-12 text-white"),
      title: "AI-powered recipe discovery",
      description: "Smart suggestions based on your ingredients",
      gradient: "from-gray-700 via-gray-800 to-gray-900"
    },
    {
      icon: renderRetroIcon("box", "w-12 h-12 text-white"),
      title: "Ready-made meal convenience",
      description: "Save time with pre-prepared halal meals",
      gradient: "from-[#FF8A1E] via-[#E67A15] to-[#CC6A0F]"
    },
    {
      icon: renderRetroIcon("users", "w-12 h-12 text-white"),
      title: "Community-driven food sharing",
      description: "Connect with food lovers worldwide",
      gradient: "from-gray-700 via-gray-800 to-gray-900"
    },
    {
      icon: renderRetroIcon("map", "w-12 h-12 text-white"),
      title: "Halal travel experiences",
      description: "Explore the world with halal-friendly options",
      gradient: "from-[#FF8A1E] via-[#E67A15] to-[#CC6A0F]"
    },
    {
      icon: renderRetroIcon("heart", "w-12 h-12 text-white"),
      title: "Charity and giving integrated",
      description: "Make a difference with every action",
      gradient: "from-gray-700 via-gray-800 to-gray-900"
    }
  ];

  return (
    <section className="px-6 py-24 bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900 relative overflow-hidden">
      <motion.div
        className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-600/20 to-transparent rounded-full filter blur-3xl opacity-30"
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-amber-500/20 to-transparent rounded-full filter blur-3xl opacity-30"
        animate={{ scale: [1, 1.1, 1], rotate: [0, -90, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />

      <div className="mx-auto max-w-6xl relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-white md:text-5xl mb-4" style={{ fontFamily: 'var(--font-headline)' }}>
            Why Choose HalalMe?
          </h2>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto font-normal" style={{ fontFamily: 'var(--font-body)' }}>
            Experience the future of halal lifestyle with our comprehensive platform
          </p>
        </div>

        <GradientCarousel items={carouselItems} />
      </div>
    </section>
  );
}

// Step Card Component - Enhanced with Framer Motion
function StepCard({ number, title, description, color, delay }: { number: string; title: string; description: string; color: string; delay: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const colorClasses = {
    purple: 'from-purple-500 to-purple-600 shadow-purple-200',
    pink: 'from-pink-500 to-pink-600 shadow-pink-200',
    orange: 'from-orange-500 to-orange-600 shadow-orange-200',
    amber: 'from-amber-500 to-amber-600 shadow-amber-200',
    teal: 'from-teal-500 to-teal-600 shadow-teal-200',
    emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-200',
  };

  const gradientClass = colorClasses[color as keyof typeof colorClasses];

  return (
    <motion.div
      ref={ref}
      className="text-center relative bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/20"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: parseInt(delay) / 1000 }}
      whileHover={{
        scale: 1.05,
        y: -8,
        boxShadow: "0 20px 40px -12px rgba(156, 163, 175, 0.5)",
        backgroundColor: "rgba(255, 255, 255, 0.15)"
      }}
    >
      <motion.div
        className={`relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${gradientClass} text-white text-2xl font-bold mb-6 shadow-lg`}
        animate={{
          boxShadow: [
            "0 10px 30px rgba(156, 163, 175, 0.4)",
            "0 10px 30px rgba(156, 163, 175, 0.7)",
            "0 10px 30px rgba(156, 163, 175, 0.4)"
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {number}
      </motion.div>
      <h3 className="text-lg font-bold text-white mb-3" style={{ fontFamily: 'var(--font-headline)' }}>{title}</h3>
      <p className="text-gray-200 text-sm leading-relaxed font-normal" style={{ fontFamily: 'var(--font-body)' }}>{description}</p>
    </motion.div>
  );
}

// CTA Button Component with Framer Motion
function CTAButton({ children, variant }: { children: React.ReactNode; variant: 'primary' | 'secondary' }) {
  if (variant === 'primary') {
    return (
      <motion.a
        href="/select-role"
        className="rounded-full bg-white px-8 py-4 font-semibold text-gray-900 shadow-lg inline-block"
        whileHover={{
          scale: 1.05,
          backgroundColor: "#f9fafb",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.a
      href="/select-role"
      className="rounded-full border-2 border-white/40 px-8 py-4 font-semibold text-white backdrop-blur-sm inline-block"
      whileHover={{
        scale: 1.05,
        borderColor: "rgba(255, 255, 255, 1)",
        backgroundColor: "rgba(255, 255, 255, 0.1)"
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.a>
  );
}
