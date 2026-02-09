'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  Bike,
  Store,
  ShoppingBag,
  ShieldCheck,
  Zap,
  Star,
  ArrowRight,
  Clock,
  BadgePercent,
  Flame,
  Heart,
  Timer,
  Radio,
  Tag,
} from 'lucide-react';

/* ── External delivery partner URL (swap with real URL) ── */
const DELIVERY_URL = 'https://www.halalme.co.uk';

/* ── Mock restaurant data ── */
const restaurants = [
  {
    id: 1,
    name: 'Kebab Kingdom',
    cuisine: 'Turkish & Middle Eastern',
    rating: 4.9,
    deliveryTime: '20-30 min',
    deliveryFee: 'Free',
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&auto=format&fit=crop&q=80',
    popular: true,
  },
  {
    id: 2,
    name: 'Spice Route',
    cuisine: 'Indian & Pakistani',
    rating: 4.8,
    deliveryTime: '25-35 min',
    deliveryFee: '£1.49',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80',
    popular: true,
  },
  {
    id: 3,
    name: 'Shawarma House',
    cuisine: 'Lebanese',
    rating: 4.7,
    deliveryTime: '15-25 min',
    deliveryFee: 'Free',
    image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600&auto=format&fit=crop&q=80',
    popular: false,
  },
  {
    id: 4,
    name: 'Naan Stop',
    cuisine: 'Tandoori & Grill',
    rating: 4.9,
    deliveryTime: '20-30 min',
    deliveryFee: '£0.99',
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop&q=80',
    popular: true,
  },
  {
    id: 5,
    name: 'Falafel Factory',
    cuisine: 'Mediterranean',
    rating: 4.6,
    deliveryTime: '15-20 min',
    deliveryFee: 'Free',
    image: 'https://images.unsplash.com/photo-1540914124281-342587941389?w=600&auto=format&fit=crop&q=80',
    popular: false,
  },
  {
    id: 6,
    name: 'Biryani Brothers',
    cuisine: 'South Asian',
    rating: 4.8,
    deliveryTime: '30-40 min',
    deliveryFee: '£1.99',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
    popular: true,
  },
];

/* ═══════════════════════ Page Root ═══════════════════════ */
export default function DeliveryLandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 overflow-x-hidden">
      <PromoBar />
      <HeroSection />
      <HowItWorksSection />
      <RestaurantsSection />
      <WhyDeliverySection />
      <StatsSection />
      <PromoBanner />
      <FinalCTA />
    </div>
  );
}

/* ───────────────────────── Promo Ticker ───────────────────────── */
function PromoBar() {
  const tickerText =
    '£10 OFF YOUR FIRST ORDER  \u00B7  100% HALAL CERTIFIED  \u00B7  FREE DELIVERY OVER £25  \u00B7  500+ RESTAURANTS  \u00B7  30 MIN AVG DELIVERY  \u00B7  ';

  return (
    <div className="bg-gradient-to-r from-red-600 via-rose-500 to-red-600 overflow-hidden">
      <div
        className="flex whitespace-nowrap py-2.5"
        style={{ animation: 'ticker 18s linear infinite' }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <span
            key={i}
            className="text-sm font-bold text-white mx-4 tracking-wide"
          >
            {tickerText}
          </span>
        ))}
      </div>
      <style jsx>{`
        @keyframes ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}

/* ───────────────────────── Hero ───────────────────────── */
function HeroSection() {
  return (
    <section className="relative h-screen min-h-[640px] max-h-[920px] flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1920&auto=format&fit=crop&q=80"
          alt="Halal food delivery"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-gray-950 via-gray-950/75 to-transparent" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-gray-950 via-transparent to-gray-950/40" />

      {/* Ambient crimson glow */}
      <div className="absolute bottom-0 left-1/4 w-[420px] h-[420px] bg-red-600/12 rounded-full blur-3xl z-[1]" />
      <div className="absolute top-1/3 right-0 w-[280px] h-[280px] bg-rose-500/8 rounded-full blur-3xl z-[1]" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12">
        <div className="max-w-3xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2.5 bg-red-500/15 border border-red-400/25 backdrop-blur-md rounded-full px-5 py-2.5 mb-8"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse" />
            <span className="text-red-300 text-sm font-semibold tracking-wide">
              Halal Delivery at Your Doorstep
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] mb-6 tracking-tight"
            style={{ fontFamily: 'var(--font-headline)' }}
          >
            HalalMe{' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-red-400 via-rose-400 to-red-500 bg-clip-text text-transparent">
                Delivery
              </span>
              <motion.span
                className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-rose-500 rounded-full origin-left"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 1 }}
              />
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-base sm:text-lg md:text-xl text-gray-300/90 max-w-xl leading-relaxed mb-10"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Craving something delicious? Order from 500+ certified halal
            restaurants and get it delivered hot to your door in 30 minutes.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-12 sm:mb-14"
          >
            <a
              href={DELIVERY_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <motion.button
                whileHover={{
                  scale: 1.04,
                  boxShadow: '0 20px 50px -12px rgba(220,38,38,0.5)',
                }}
                whileTap={{ scale: 0.97 }}
                className="group relative w-full sm:w-auto px-8 py-4 md:px-10 md:py-5 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-lg rounded-full shadow-xl shadow-red-600/25 overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2.5">
                  Order Now
                  <ArrowRight className="w-5 h-5" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </motion.button>
            </a>

            <a
              href={DELIVERY_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <motion.button
                whileHover={{
                  scale: 1.04,
                  backgroundColor: 'rgba(255,255,255,0.12)',
                }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto px-8 py-4 md:px-10 md:py-5 bg-white/8 border border-white/20 backdrop-blur-sm text-white font-bold text-lg rounded-full hover:border-white/40 transition-all"
              >
                View Restaurants
              </motion.button>
            </a>
          </motion.div>

          {/* Trust row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="flex flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm"
          >
            {[
              { icon: ShieldCheck, text: '100% Halal', color: 'text-red-400' },
              { icon: Timer, text: '30-min Delivery', color: 'text-rose-400' },
              { icon: Store, text: '500+ Restaurants', color: 'text-red-400' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-400">
                <item.icon className={`w-4 h-4 ${item.color}`} />
                <span>{item.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-red-400 rounded-full" />
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── How It Works ───────────────────────── */
function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const steps = [
    {
      num: '01',
      icon: Store,
      title: 'Browse Restaurants',
      desc: 'Explore 500+ certified halal restaurants near you. Filter by cuisine, rating, or delivery time.',
      gradient: 'from-red-500 to-red-600',
    },
    {
      num: '02',
      icon: ShoppingBag,
      title: 'Place Your Order',
      desc: 'Build your perfect meal, customise to your liking, and check out in seconds. Simple as that.',
      gradient: 'from-rose-500 to-rose-600',
    },
    {
      num: '03',
      icon: Bike,
      title: 'Fast Delivery',
      desc: 'Track your order in real-time as our riders bring your food hot and fresh to your doorstep.',
      gradient: 'from-red-600 to-rose-600',
    },
  ];

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="relative py-28 md:py-36 bg-gray-950 overflow-hidden"
    >
      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #EF4444 1px, transparent 0)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Clock className="w-4 h-4" />
            Quick & Easy
          </span>
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight"
            style={{ fontFamily: 'var(--font-headline)' }}
          >
            How It{' '}
            <span className="bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p
            className="text-lg text-gray-400 max-w-xl mx-auto"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            From craving to delivery in three simple steps.
            No hassle, no compromise on halal standards.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line — desktop */}
          <div className="hidden md:block absolute top-28 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-red-500/40 via-rose-500/40 to-red-600/40" />

          <div className="grid md:grid-cols-3 gap-10 md:gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.2 + i * 0.15, duration: 0.55 }}
                  className="relative text-center group"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : {}}
                    transition={{
                      delay: 0.4 + i * 0.15,
                      type: 'spring',
                      stiffness: 180,
                    }}
                    className="relative mx-auto mb-8"
                  >
                    <div
                      className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-2xl shadow-red-500/10 mx-auto group-hover:shadow-red-500/25 transition-shadow duration-500 group-hover:scale-105 transform-gpu`}
                    >
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-3 -right-3 w-9 h-9 rounded-xl bg-gray-900 border border-gray-700 flex items-center justify-center shadow-lg">
                      <span className="text-xs font-bold text-red-400">
                        {step.num}
                      </span>
                    </div>
                  </motion.div>

                  <h3
                    className="text-2xl font-bold text-white mb-3"
                    style={{ fontFamily: 'var(--font-headline)' }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-gray-400 leading-relaxed max-w-xs mx-auto"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {step.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── Partner Restaurants ─────────────────── */
function RestaurantsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section ref={ref} className="relative py-28 md:py-36 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-red-950/20 to-gray-950" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14"
        >
          <div>
            <span className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Flame className="w-4 h-4" />
              Top Rated
            </span>
            <h2
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              Partner{' '}
              <span className="bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
                Restaurants
              </span>
            </h2>
          </div>
          <a
            href={DELIVERY_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="text-red-400 font-bold flex items-center gap-2 hover:text-red-300 transition-colors text-lg"
            >
              View All
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </a>
        </motion.div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.12 + i * 0.08, duration: 0.5 }}
            >
              <a
                href={DELIVERY_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <motion.div
                  whileHover={{ y: -8 }}
                  className="group bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-red-500/50 transition-all duration-300 cursor-pointer"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent z-10" />
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                      style={{
                        backgroundImage: `url(${r.image})`,
                        backgroundColor: '#1f2937',
                      }}
                    />
                    {r.popular && (
                      <div className="absolute top-3 left-3 z-20">
                        <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                          Popular
                        </span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-9 h-9 bg-gray-900/60 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/10">
                        <Heart className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="text-lg font-bold text-white group-hover:text-red-300 transition-colors line-clamp-1">
                        {r.name}
                      </h3>
                      <div className="flex items-center gap-1 bg-red-500/15 px-2 py-0.5 rounded-full shrink-0">
                        <Star className="w-3.5 h-3.5 text-red-400 fill-red-400" />
                        <span className="text-red-300 text-sm font-bold">
                          {r.rating}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm mb-4">{r.cuisine}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {r.deliveryTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Bike className="w-3 h-3" />
                          {r.deliveryFee}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </motion.div>
              </a>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="text-center mt-14"
        >
          <a href={DELIVERY_URL} target="_blank" rel="noopener noreferrer">
            <motion.button
              whileHover={{
                scale: 1.04,
                boxShadow: '0 20px 50px -12px rgba(220,38,38,0.35)',
              }}
              whileTap={{ scale: 0.97 }}
              className="px-10 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-lg rounded-full shadow-xl shadow-red-600/20"
            >
              Explore All Restaurants
            </motion.button>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────── Why HalalMe Delivery ──────────────────── */
function WhyDeliverySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const benefits = [
    {
      icon: ShieldCheck,
      title: '100% Halal Certified',
      desc: 'Every restaurant on our platform is verified halal. We audit regularly so you can order with complete confidence.',
      gradient: 'from-red-500 to-red-600',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      desc: 'Average delivery in just 30 minutes. Our rider network ensures your food arrives hot and fresh, every time.',
      gradient: 'from-rose-500 to-rose-600',
    },
    {
      icon: Radio,
      title: 'Live Order Tracking',
      desc: 'Track your order every step of the way — from kitchen to your door. Real-time updates, no guessing.',
      gradient: 'from-red-600 to-red-700',
    },
    {
      icon: Tag,
      title: 'Exclusive Deals',
      desc: 'Unlock special offers, loyalty rewards, and first-order discounts. Save more with every order you place.',
      gradient: 'from-rose-600 to-red-600',
    },
  ];

  return (
    <section
      ref={ref}
      className="relative py-28 md:py-36 bg-gray-950 overflow-hidden"
    >
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-red-500/5 rounded-full blur-3xl -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Heart className="w-4 h-4" />
            Why Choose Us
          </span>
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight"
            style={{ fontFamily: 'var(--font-headline)' }}
          >
            Why{' '}
            <span className="bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
              HalalMe Delivery
            </span>
          </h2>
          <p
            className="text-lg text-gray-400 max-w-xl mx-auto"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            The only delivery platform built from the ground up for the halal
            community. No compromises — ever.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.15 + i * 0.1, duration: 0.5 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-gray-900 border border-gray-800 group-hover:border-red-500/30 rounded-2xl p-7 transition-all duration-500">
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${b.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3
                    className="text-xl font-bold text-white mb-3 group-hover:text-red-300 transition-colors"
                    style={{ fontFamily: 'var(--font-headline)' }}
                  >
                    {b.title}
                  </h3>
                  <p
                    className="text-gray-500 text-sm leading-relaxed"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {b.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── Stats ──────────────────────── */
function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  const stats = [
    { value: '500+', label: 'Restaurants', icon: Store },
    { value: '50K+', label: 'Orders Delivered', icon: ShoppingBag },
    { value: '30min', label: 'Avg Delivery', icon: Timer },
    { value: '4.8', label: 'Star Rating', icon: Star },
  ];

  return (
    <section ref={ref} className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-red-950/40 via-gray-950 to-red-950/40" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <Icon className="w-6 h-6 text-red-400 mx-auto mb-3" />
                <div
                  className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight"
                  style={{ fontFamily: 'var(--font-headline)' }}
                >
                  {s.value}
                </div>
                <div
                  className="text-gray-500 text-sm font-medium uppercase tracking-wider"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {s.label}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── Promo Banner ─────────────────────── */
function PromoBanner() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <section ref={ref} className="py-16 px-6 md:px-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto relative overflow-hidden rounded-3xl"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-rose-500 to-red-600" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 px-8 md:px-14 py-12 md:py-14">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shrink-0">
              <BadgePercent className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3
                className="text-2xl md:text-3xl font-extrabold text-white mb-1"
                style={{ fontFamily: 'var(--font-headline)' }}
              >
                Get £10 Off Your First Order
              </h3>
              <p
                className="text-white/80 text-base"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Use code{' '}
                <span className="font-bold text-white">HALAL10</span> at
                checkout. Certified halal food, delivered for less.
              </p>
            </div>
          </div>
          <a href={DELIVERY_URL} target="_blank" rel="noopener noreferrer">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-4 bg-gray-900 text-red-400 font-bold text-lg rounded-full hover:bg-gray-800 transition-colors whitespace-nowrap shadow-xl"
            >
              Claim Offer
            </motion.button>
          </a>
        </div>
      </motion.div>
    </section>
  );
}

/* ───────────────────────── Final CTA ───────────────────────── */
function FinalCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section ref={ref} className="relative py-28 md:py-36 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-red-950 to-gray-900" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-red-500/8 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-rose-500/6 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, type: 'spring' }}
          className="mb-8"
        >
          <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
            <Bike className="w-10 h-10 text-red-400" />
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight"
          style={{ fontFamily: 'var(--font-headline)' }}
        >
          Hungry?{' '}
          <span className="bg-gradient-to-r from-red-300 via-red-400 to-rose-400 bg-clip-text text-transparent">
            Order Now
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          500+ halal restaurants. 30-minute delivery. Zero compromise.
          Your next favourite meal is just a tap away.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
        >
          <a href={DELIVERY_URL} target="_blank" rel="noopener noreferrer">
            <motion.button
              whileHover={{
                scale: 1.04,
                boxShadow: '0 20px 50px -12px rgba(220,38,38,0.45)',
              }}
              whileTap={{ scale: 0.97 }}
              className="px-10 py-5 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-lg rounded-full shadow-xl shadow-red-600/25 flex items-center gap-2"
            >
              Start Ordering
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </a>
        </motion.div>

        {/* Back links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="flex justify-center gap-8"
        >
          <Link
            href="/fresh"
            className="text-gray-500 hover:text-red-400 transition-colors text-sm font-semibold"
          >
            &larr; Fresh
          </Link>
          <Link
            href="/kitchen"
            className="text-gray-500 hover:text-red-400 transition-colors text-sm font-semibold"
          >
            Kitchen &rarr;
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
