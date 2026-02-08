'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  Leaf,
  UtensilsCrossed,
  Truck,
  ChefHat,
  ShieldCheck,
  Clock,
  Star,
  ArrowRight,
  Sparkles,
  Heart,
  Flame,
  BadgePercent,
} from 'lucide-react';
import { meals } from '@/data/freshMockData';

const popularMeals = meals.filter((m) => m.isPopular).slice(0, 4);

export default function FreshLandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 overflow-x-hidden">
      {/* Promo Ticker Bar */}
      <PromoBar />

      {/* Hero */}
      <HeroSection />

      {/* How It Works */}
      <HowItWorksSection />

      {/* Featured Meals */}
      <FeaturedMealsSection />

      {/* Why HalalMe Fresh */}
      <WhyFreshSection />

      {/* Social Proof Stats */}
      <StatsSection />

      {/* Promotional Banner */}
      <PromoBanner />

      {/* Final CTA */}
      <FinalCTA />
    </div>
  );
}

/* ───────────────────────────── Promo Bar ───────────────────────────── */
function PromoBar() {
  const tickerText = 'FREE DELIVERY OVER £30  \u00B7  100% HALAL CERTIFIED  \u00B7  20% OFF YOUR FIRST ORDER  \u00B7  CHEF-PREPARED DAILY  \u00B7  ';

  return (
    <div className="bg-gradient-to-r from-lime-500 via-green-500 to-lime-500 overflow-hidden">
      <div
        className="flex whitespace-nowrap py-2.5"
        style={{
          animation: 'ticker 18s linear infinite',
        }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <span
            key={i}
            className="text-sm font-bold text-gray-900 mx-4 tracking-wide"
          >
            {tickerText}
          </span>
        ))}
      </div>
      <style jsx>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

/* ───────────────────────────── Hero ───────────────────────────── */
function HeroSection() {
  return (
    <section className="relative h-screen min-h-[600px] max-h-[900px] flex items-center overflow-hidden">
      {/* Background Image — static, no JS parallax */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&auto=format&fit=crop&q=80"
          alt="Fresh halal meals"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-gray-950 via-gray-950/70 to-transparent opacity-60" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-gray-950 via-transparent to-gray-950/30" />

      {/* Ambient lime glow — reduced blur for perf */}
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-lime-500/10 rounded-full blur-3xl z-[1]" />
      <div className="absolute top-1/3 right-0 w-[250px] h-[250px] bg-green-500/8 rounded-full blur-3xl z-[1]" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12">
        <div className="max-w-3xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2.5 bg-lime-500/15 border border-lime-400/25 backdrop-blur-md rounded-full px-5 py-2.5 mb-8"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-pulse" />
            <span className="text-lime-300 text-sm font-semibold tracking-wide">
              Fresh & Halal Certified
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] mb-6 tracking-tight"
          >
            Fresh Halal Meals,{' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-lime-300 via-lime-400 to-green-400 bg-clip-text text-transparent">
                Delivered
              </span>
              <motion.span
                className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-lime-400 to-green-500 rounded-full origin-left"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 1 }}
              />
            </span>{' '}
            to Your Door
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-base sm:text-lg md:text-xl text-gray-300/90 max-w-xl leading-relaxed mb-10"
          >
            Chef-prepared meals made fresh daily with certified halal ingredients.
            No cooking, no hassle — just heat, eat, and enjoy.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-12 sm:mb-14"
          >
            <Link href="/fresh/meals">
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 20px 50px -12px rgba(132,204,22,0.45)' }}
                whileTap={{ scale: 0.97 }}
                className="group relative w-full sm:w-auto px-8 py-4 md:px-10 md:py-5 bg-gradient-to-r from-lime-400 to-lime-500 text-gray-900 font-bold text-lg rounded-full shadow-xl shadow-lime-500/25 overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2.5">
                  View Our Menu
                  <ArrowRight className="w-5 h-5" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </motion.button>
            </Link>

            <a href="#how-it-works">
              <motion.button
                whileHover={{ scale: 1.04, backgroundColor: 'rgba(255,255,255,0.12)' }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto px-8 py-4 md:px-10 md:py-5 bg-white/8 border border-white/20 backdrop-blur-sm text-white font-bold text-lg rounded-full hover:border-white/40 transition-all"
              >
                How It Works
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
              { icon: ShieldCheck, text: '100% Halal', color: 'text-lime-400' },
              { icon: Sparkles, text: 'Fresh Daily', color: 'text-green-400' },
              { icon: Truck, text: 'Free Delivery over £30', color: 'text-lime-400' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-400">
                <item.icon className={`w-4 h-4 ${item.color}`} />
                <span>{item.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll hint — CSS only */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-lime-400 rounded-full" />
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
      icon: UtensilsCrossed,
      title: 'Choose Your Meals',
      desc: 'Browse our weekly rotating menu of chef-prepared halal meals. Pick your favourites, no subscription required.',
      gradient: 'from-lime-500 to-green-500',
    },
    {
      num: '02',
      icon: Truck,
      title: 'We Prepare & Deliver',
      desc: 'Fresh meals cooked daily in halal-certified kitchens. Delivered straight to your door in eco-friendly packaging.',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      num: '03',
      icon: ChefHat,
      title: 'Heat & Enjoy',
      desc: 'Ready in just 5-10 minutes. No cooking, no hassle — restaurant-quality meals at home in minutes.',
      gradient: 'from-emerald-500 to-teal-500',
    },
  ];

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="relative py-28 md:py-36 bg-gray-950 overflow-hidden"
    >
      {/* Subtle pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #84CC16 1px, transparent 0)',
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
          <span className="inline-flex items-center gap-2 bg-lime-500/10 border border-lime-500/20 text-lime-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Clock className="w-4 h-4" />
            Simple as 1-2-3
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight">
            How It{' '}
            <span className="bg-gradient-to-r from-lime-400 to-green-400 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-xl mx-auto">
            From our kitchen to your table in three simple steps.
            No subscriptions, no commitments.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line — desktop */}
          <div className="hidden md:block absolute top-28 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-lime-500/40 via-green-500/40 to-emerald-500/40" />

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
                  {/* Number + Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : {}}
                    transition={{ delay: 0.4 + i * 0.15, type: 'spring', stiffness: 180 }}
                    className="relative mx-auto mb-8"
                  >
                    <div
                      className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-2xl shadow-lime-500/10 mx-auto group-hover:shadow-lime-500/25 transition-shadow duration-500 group-hover:scale-105 transform-gpu`}
                    >
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-3 -right-3 w-9 h-9 rounded-xl bg-gray-900 border border-gray-700 flex items-center justify-center shadow-lg">
                      <span className="text-xs font-bold text-lime-400">{step.num}</span>
                    </div>
                  </motion.div>

                  <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed max-w-xs mx-auto">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── Featured Meals ─────────────────────── */
function FeaturedMealsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section ref={ref} className="relative py-28 md:py-36 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-lime-950/30 to-gray-950" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-lime-500/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14"
        >
          <div>
            <span className="inline-flex items-center gap-2 bg-lime-500/10 border border-lime-500/20 text-lime-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Flame className="w-4 h-4" />
              Most Popular
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight">
              This Week&apos;s{' '}
              <span className="bg-gradient-to-r from-lime-400 to-green-400 bg-clip-text text-transparent">
                Favourites
              </span>
            </h2>
          </div>
          <Link href="/fresh/meals">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="text-lime-400 font-bold flex items-center gap-2 hover:text-lime-300 transition-colors text-lg"
            >
              View Full Menu
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Meals Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularMeals.map((meal, i) => (
            <motion.div
              key={meal.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15 + i * 0.1, duration: 0.5 }}
            >
              <Link href={`/fresh/meals/${meal.id}`}>
                <motion.div
                  whileHover={{ y: -8 }}
                  className="group bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-lime-500/50 transition-all duration-300 cursor-pointer"
                >
                  {/* Image */}
                  <div className="relative h-52 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent z-10" />
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                      style={{ backgroundImage: `url(${meal.image})`, backgroundColor: '#1f2937' }}
                    />
                    <div className="absolute top-3 left-3 z-20">
                      <span className="bg-lime-500 text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full">
                        Popular
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-9 h-9 bg-gray-900/60 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/10">
                        <Heart className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-lime-300 transition-colors">
                        {meal.name}
                      </h3>
                      <span className="text-lime-400 font-bold whitespace-nowrap text-lg">
                        £{meal.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{meal.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        {meal.calories && (
                          <span className="flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            {meal.calories} cal
                          </span>
                        )}
                        {meal.prepTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {meal.prepTime}
                          </span>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-lime-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Full menu CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="text-center mt-14"
        >
          <Link href="/fresh/meals">
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 20px 50px -12px rgba(132,204,22,0.3)' }}
              whileTap={{ scale: 0.97 }}
              className="px-10 py-4 bg-gradient-to-r from-lime-500 to-green-500 text-gray-900 font-bold text-lg rounded-full shadow-xl shadow-lime-500/20"
            >
              Browse All Meals
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────── Why Fresh ──────────────────────── */
function WhyFreshSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const benefits = [
    {
      icon: ShieldCheck,
      title: '100% Halal Certified',
      desc: 'Every meal prepared in halal-certified kitchens with fully traceable ingredients. No compromises.',
      gradient: 'from-lime-500 to-lime-600',
    },
    {
      icon: ChefHat,
      title: 'Chef-Prepared Daily',
      desc: 'Professional chefs craft each meal fresh daily using premium ingredients. No preservatives, no shortcuts.',
      gradient: 'from-green-500 to-green-600',
    },
    {
      icon: Clock,
      title: 'Flexible & Convenient',
      desc: 'No subscription required. Order when you want, as much as you want. Full flexibility, zero commitment.',
      gradient: 'from-emerald-500 to-emerald-600',
    },
    {
      icon: Truck,
      title: 'Free Delivery',
      desc: 'Free delivery on all orders over £30. Eco-friendly packaging keeps your meals fresh and safe.',
      gradient: 'from-teal-500 to-teal-600',
    },
  ];

  return (
    <section ref={ref} className="relative py-28 md:py-36 bg-gray-950 overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-lime-500/5 rounded-full blur-3xl -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 bg-lime-500/10 border border-lime-500/20 text-lime-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Heart className="w-4 h-4" />
            Why Choose Us
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Why{' '}
            <span className="bg-gradient-to-r from-lime-400 to-green-400 bg-clip-text text-transparent">
              HalalMe Fresh
            </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-xl mx-auto">
            We believe everyone deserves access to delicious, certified halal meals
            without the hassle of cooking from scratch.
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
                <div className="absolute inset-0 bg-gradient-to-br from-lime-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-gray-900 border border-gray-800 group-hover:border-lime-500/30 rounded-2xl p-7 transition-all duration-500">
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${b.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-lime-300 transition-colors">
                    {b.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{b.desc}</p>
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
    { value: '50,000+', label: 'Meals Delivered', icon: Truck },
    { value: '4.9', label: 'Star Rating', icon: Star },
    { value: '100%', label: 'Halal Certified', icon: ShieldCheck },
    { value: '12+', label: 'Weekly Options', icon: UtensilsCrossed },
  ];

  return (
    <section ref={ref} className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-lime-950/50 via-gray-950 to-lime-950/50" />

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
                <Icon className="w-6 h-6 text-lime-400 mx-auto mb-3" />
                <div className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">
                  {s.value}
                </div>
                <div className="text-gray-500 text-sm font-medium uppercase tracking-wider">
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
        <div className="absolute inset-0 bg-gradient-to-r from-lime-600 via-green-500 to-emerald-500" />
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
              <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-1">
                Get 20% Off Your First Order
              </h3>
              <p className="text-white/80 text-base">
                Use code <span className="font-bold text-white">FRESH20</span> at checkout.
                Fresh halal meals, delivered for less.
              </p>
            </div>
          </div>
          <Link href="/fresh/meals">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-4 bg-gray-900 text-lime-400 font-bold text-lg rounded-full hover:bg-gray-800 transition-colors whitespace-nowrap shadow-xl"
            >
              Claim Offer
            </motion.button>
          </Link>
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
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-lime-950 to-gray-900" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-lime-500/8 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-green-500/6 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Leaf icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, type: 'spring' }}
          className="mb-8"
        >
          <div className="w-20 h-20 rounded-full bg-lime-500/10 border border-lime-500/20 flex items-center justify-center mx-auto">
            <Leaf className="w-10 h-10 text-lime-400" />
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight"
        >
          Ready to Eat{' '}
          <span className="bg-gradient-to-r from-lime-300 via-lime-400 to-green-400 bg-clip-text text-transparent">
            Fresh?
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Browse our chef-prepared halal meals and have them delivered fresh to your door.
          No subscriptions, no hassle.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
        >
          <Link href="/fresh/meals">
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 20px 50px -12px rgba(132,204,22,0.4)' }}
              whileTap={{ scale: 0.97 }}
              className="px-10 py-5 bg-gradient-to-r from-lime-400 to-lime-500 text-gray-900 font-bold text-lg rounded-full shadow-xl shadow-lime-500/25 flex items-center gap-2"
            >
              View Our Menu
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Back links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="flex justify-center gap-8"
        >
          <Link
            href="/"
            className="text-gray-500 hover:text-lime-400 transition-colors text-sm font-semibold"
          >
            &larr; Home
          </Link>
          <Link
            href="/kitchen"
            className="text-gray-500 hover:text-lime-400 transition-colors text-sm font-semibold"
          >
            Kitchen &rarr;
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
