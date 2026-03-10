'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  ShieldCheck,
  Star,
  ArrowRight,
  Clock,
  BadgePercent,
  Flame,
  Heart,
  Search,
  Truck,
  Lock,
  Users,
  Store,
  Shirt,
  ShoppingBasket,
  BookOpen,
  Moon,
  Sparkles,
  Baby,
  UtensilsCrossed,
  Smartphone,
  Tag,
} from 'lucide-react';

/* ── Mock product data ── */
const products = [
  {
    id: 1,
    name: 'Premium Silk Hijab Collection',
    category: 'Modest Fashion',
    price: 24.99,
    rating: 4.9,
    seller: 'Noor Boutique',
    image: 'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=600&auto=format&fit=crop&q=80',
    popular: true,
  },
  {
    id: 2,
    name: 'Modest Linen Abaya',
    category: 'Clothing',
    price: 59.99,
    rating: 4.9,
    seller: 'Aya Modest Wear',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80',
    popular: true,
  },
  {
    id: 3,
    name: 'Men\u2019s Premium Thobe',
    category: 'Clothing',
    price: 44.99,
    rating: 4.8,
    seller: 'Sunnah Threads',
    image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&auto=format&fit=crop&q=80',
    popular: true,
  },
  {
    id: 4,
    name: 'Handcrafted Prayer Mat',
    category: 'Prayer',
    price: 49.99,
    rating: 4.9,
    seller: 'Barakah Crafts',
    image: 'https://images.unsplash.com/photo-1585036156171-384164a8c159?w=600&auto=format&fit=crop&q=80',
    popular: false,
  },
  {
    id: 5,
    name: 'Organic Halal Skincare Set',
    category: 'Beauty',
    price: 34.99,
    rating: 4.8,
    seller: 'Pure Glow Co.',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&auto=format&fit=crop&q=80',
    popular: false,
  },
  {
    id: 6,
    name: 'Modest Activewear Set',
    category: 'Clothing',
    price: 38.99,
    rating: 4.7,
    seller: 'FitModest Co.',
    image: 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&auto=format&fit=crop&q=80',
    popular: true,
  },
  {
    id: 7,
    name: 'Halal Vitamin D3 Supplements',
    category: 'Essentials',
    price: 14.99,
    rating: 4.7,
    seller: 'Tayyib Health',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    popular: false,
  },
  {
    id: 8,
    name: 'Premium Oud Attar Collection',
    category: 'Prayer',
    price: 39.99,
    rating: 4.9,
    seller: 'Arabian Essence',
    image: 'https://images.unsplash.com/photo-1594035910387-fea081ac26b0?w=600&auto=format&fit=crop&q=80',
    popular: true,
  },
];

/* ── Marketplace categories ── */
const categories = [
  { icon: Shirt, title: 'Modest Fashion', desc: 'Hijabs, abayas, thobes & modest activewear' },
  { icon: ShoppingBasket, title: 'Daily Essentials', desc: 'Halal toiletries, home care & supplements' },
  { icon: BookOpen, title: 'Books & Education', desc: 'Quran, Islamic literature & learning' },
  { icon: Moon, title: 'Prayer & Worship', desc: 'Prayer mats, tasbih, attar & decor' },
  { icon: Sparkles, title: 'Beauty & Skincare', desc: 'Wudu-friendly makeup & halal skincare' },
  { icon: Baby, title: 'Kids & Family', desc: 'Islamic toys, books & modest kids clothing' },
  { icon: UtensilsCrossed, title: 'Food & Pantry', desc: 'Halal snacks, spices & international ingredients' },
  { icon: Smartphone, title: 'Tech & Accessories', desc: 'Gadgets, phone accessories & smart devices' },
];

/* ═══════════════════════ Page Root ═══════════════════════ */
export default function MarketplaceLandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 overflow-x-hidden pt-16">
      <PromoBar />
      <HeroSection />
      <CategoriesSection />
      <FeaturedProductsSection />
      <HowItWorksSection />
      <WhyMarketplaceSection />
      <StatsSection />
      <PromoBanner />
      <FinalCTA />
    </div>
  );
}

/* ───────────────────────── Promo Ticker ───────────────────────── */
function PromoBar() {
  const tickerText =
    '15% OFF FIRST PURCHASE  \u00B7  100% HALAL CERTIFIED  \u00B7  2000+ PRODUCTS  \u00B7  TRUSTED SELLERS  \u00B7  FREE SHIPPING OVER £40  \u00B7  ';

  return (
    <div className="overflow-hidden bg-indigo-600">
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
          src="https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1920&auto=format&fit=crop&q=80"
          alt="Halal marketplace shopping"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 z-[1] bg-gray-950/70" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 pt-20">
        <div className="max-w-3xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2.5 bg-indigo-500/15 border border-indigo-400/25 backdrop-blur-md rounded-full px-5 py-2.5 mb-5 sm:mb-8"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-indigo-300 text-sm font-semibold tracking-wide">
              The Halal Marketplace
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
              <span className="text-indigo-400">Marketplace</span>
              <motion.span
                className="absolute -bottom-1 left-0 right-0 h-1 bg-indigo-600 rounded-full origin-left"
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
            className="text-base sm:text-lg md:text-xl text-gray-300/90 max-w-xl leading-relaxed mb-6 sm:mb-10"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Discover 2,000+ halal-certified products from trusted sellers.
            From modest fashion to daily essentials — shop with confidence.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-12 sm:mb-14"
          >
            <Link href="/marketplace">
              <motion.button
                whileHover={{
                  scale: 1.04,
                  boxShadow: '0 20px 50px -12px rgba(99,102,241,0.5)',
                }}
                whileTap={{ scale: 0.97 }}
                className="group relative w-full sm:w-auto px-8 py-4 md:px-10 md:py-5 bg-indigo-600 text-white font-bold text-lg rounded-full shadow-xl shadow-indigo-600/25 overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2.5">
                  Start Shopping
                  <ArrowRight className="w-5 h-5" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </motion.button>
            </Link>

            <a href="#categories">
              <motion.button
                whileHover={{
                  scale: 1.04,
                  backgroundColor: 'rgba(255,255,255,0.12)',
                }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto px-8 py-4 md:px-10 md:py-5 bg-white/8 border border-white/20 backdrop-blur-sm text-white font-bold text-lg rounded-full hover:border-white/40 transition-all"
              >
                Browse Categories
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
              { icon: ShieldCheck, text: '100% Halal', color: 'text-indigo-400' },
              { icon: Store, text: '500+ Sellers', color: 'text-indigo-400' },
              { icon: Truck, text: 'Free Shipping £40+', color: 'text-indigo-400' },
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
          <div className="w-1.5 h-3 bg-indigo-400 rounded-full" />
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── Shop by Category ─────────────────── */
function CategoriesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section id="categories" ref={ref} className="relative py-20 bg-gray-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Search className="w-4 h-4" />
            Explore Categories
          </span>
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight"
            style={{ fontFamily: 'var(--font-headline)' }}
          >
            Shop by{' '}
            <span className="text-indigo-400">Category</span>
          </h2>
          <p
            className="text-lg text-gray-400 max-w-xl mx-auto"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Eight curated categories designed for the halal-conscious
            lifestyle. Every product verified, every seller trusted.
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 + i * 0.07, duration: 0.5 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group relative"
              >
                <div className="relative bg-gray-900 border border-gray-800 group-hover:border-indigo-500/30 rounded-2xl p-5 md:p-7 transition-all duration-500 cursor-pointer">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-indigo-600 flex items-center justify-center mb-4 md:mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <h3
                    className="text-base md:text-lg font-bold text-white mb-1.5 group-hover:text-indigo-300 transition-colors"
                    style={{ fontFamily: 'var(--font-headline)' }}
                  >
                    {cat.title}
                  </h3>
                  <p
                    className="text-gray-500 text-xs md:text-sm leading-relaxed"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {cat.desc}
                  </p>
                  <ArrowRight className="w-4 h-4 text-gray-700 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all mt-3" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── Featured Products ─────────────────── */
function FeaturedProductsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section ref={ref} className="relative py-20 bg-gray-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14"
        >
          <div>
            <span className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Flame className="w-4 h-4" />
              Trending Now
            </span>
            <h2
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              Featured{' '}
              <span className="text-indigo-400">Products</span>
            </h2>
          </div>
          <Link href="/marketplace">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="text-indigo-400 font-bold flex items-center gap-2 hover:text-indigo-300 transition-colors text-lg"
            >
              View All
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.12 + i * 0.08, duration: 0.5 }}
            >
              <Link href="/marketplace">
                <motion.div
                  whileHover={{ y: -8 }}
                  className="group bg-gray-950 rounded-2xl overflow-hidden border border-gray-800 hover:border-indigo-500/50 transition-all duration-300 cursor-pointer"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <div className="absolute inset-0 bg-gray-900/50 z-10" />
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                      style={{
                        backgroundImage: `url(${p.image})`,
                        backgroundColor: '#1f2937',
                      }}
                    />
                    {p.popular && (
                      <div className="absolute top-3 left-3 z-20">
                        <span className="text-white text-xs font-bold px-3 py-1.5 rounded-full bg-indigo-600">
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
                      <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                        {p.name}
                      </h3>
                      <div className="flex items-center gap-1 bg-indigo-500/15 px-2 py-0.5 rounded-full shrink-0">
                        <Star className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
                        <span className="text-indigo-300 text-sm font-bold">
                          {p.rating}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm mb-4">{p.seller} &middot; {p.category}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-indigo-400 font-bold text-lg">
                        £{p.price.toFixed(2)}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </motion.div>
              </Link>
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
          <Link href="/marketplace">
            <motion.button
              whileHover={{
                scale: 1.04,
                boxShadow: '0 20px 50px -12px rgba(99,102,241,0.35)',
              }}
              whileTap={{ scale: 0.97 }}
              className="px-10 py-4 bg-indigo-600 text-white font-bold text-lg rounded-full shadow-xl shadow-indigo-600/20"
            >
              Explore All Products
            </motion.button>
          </Link>
        </motion.div>
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
      icon: Search,
      title: 'Browse & Discover',
      desc: 'Explore thousands of halal-verified products across 8 curated categories. Filter, compare, and find exactly what you need.',
    },
    {
      num: '02',
      icon: ShieldCheck,
      title: 'Shop with Confidence',
      desc: 'Every seller and product is halal-certified. Read reviews, compare prices, and buy with complete peace of mind.',
    },
    {
      num: '03',
      icon: Truck,
      title: 'Fast & Secure Delivery',
      desc: 'Get your items delivered safely to your door with real-time tracking. Free shipping on orders over £40.',
    },
  ];

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="relative py-20 bg-gray-950 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Clock className="w-4 h-4" />
            Simple & Secure
          </span>
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight"
            style={{ fontFamily: 'var(--font-headline)' }}
          >
            How It{' '}
            <span className="text-indigo-400">Works</span>
          </h2>
          <p
            className="text-lg text-gray-400 max-w-xl mx-auto"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            From discovery to doorstep in three simple steps.
            Shop halal with zero compromise.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line — desktop */}
          <div className="hidden md:block absolute top-28 left-[16.67%] right-[16.67%] h-px bg-indigo-500/30" />

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
                    <div className="w-24 h-24 rounded-3xl bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-500/10 mx-auto group-hover:shadow-indigo-500/25 transition-shadow duration-500 group-hover:scale-105 transform-gpu">
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-3 -right-3 w-9 h-9 rounded-xl bg-gray-900 border border-gray-700 flex items-center justify-center shadow-lg">
                      <span className="text-xs font-bold text-indigo-400">
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

/* ──────────────────── Why HalalMe Marketplace ──────────────────── */
function WhyMarketplaceSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const benefits = [
    {
      icon: ShieldCheck,
      title: '100% Halal Verified',
      desc: 'Every product and seller undergoes strict halal certification. Shop with complete confidence and peace of mind.',
    },
    {
      icon: Store,
      title: 'Trusted Sellers',
      desc: 'Vetted marketplace sellers with verified reviews and quality guarantees. Only the best make it to our platform.',
    },
    {
      icon: Lock,
      title: 'Secure Payments',
      desc: 'End-to-end encrypted transactions with buyer protection on every purchase. Your money is always safe.',
    },
    {
      icon: Users,
      title: 'Community Driven',
      desc: 'Support Muslim-owned businesses and discover products recommended by the community. Together, we thrive.',
    },
  ];

  return (
    <section
      ref={ref}
      className="relative py-20 bg-gray-950 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Heart className="w-4 h-4" />
            Why Choose Us
          </span>
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight"
            style={{ fontFamily: 'var(--font-headline)' }}
          >
            Why{' '}
            <span className="text-indigo-400">HalalMe Marketplace</span>
          </h2>
          <p
            className="text-lg text-gray-400 max-w-xl mx-auto"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            The only marketplace built from the ground up for the halal
            community. Every product, every seller — verified.
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
                <div className="relative bg-gray-900 border border-gray-800 group-hover:border-indigo-500/30 rounded-2xl p-7 transition-all duration-500">
                  <div className="w-14 h-14 rounded-xl bg-indigo-600 flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3
                    className="text-xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors"
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
    { value: '2,000+', label: 'Products', icon: ShoppingBag },
    { value: '500+', label: 'Trusted Sellers', icon: Store },
    { value: '4.8', label: 'Star Rating', icon: Star },
    { value: '100%', label: 'Halal Certified', icon: ShieldCheck },
  ];

  return (
    <section ref={ref} className="relative py-20 bg-indigo-600/5 border-y border-indigo-500/10 overflow-hidden">
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
                <Icon className="w-6 h-6 text-indigo-400 mx-auto mb-3" />
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
        className="max-w-7xl mx-auto relative overflow-hidden rounded-3xl bg-indigo-600 shadow-xl shadow-indigo-600/20"
      >
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
                Get 15% Off Your First Purchase
              </h3>
              <p
                className="text-white/80 text-base"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Use code{' '}
                <span className="font-bold text-white">MARKET15</span> at
                checkout. Halal shopping, for less.
              </p>
            </div>
          </div>
          <Link href="/marketplace">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-4 bg-gray-900 text-indigo-400 font-bold text-lg rounded-full hover:bg-gray-800 transition-colors whitespace-nowrap shadow-xl"
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
    <section ref={ref} className="relative py-20 bg-gray-950 overflow-hidden">
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, type: 'spring' }}
          className="mb-8"
        >
          <div className="w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto">
            <Tag className="w-10 h-10 text-indigo-400" />
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight"
          style={{ fontFamily: 'var(--font-headline)' }}
        >
          Ready to Shop{' '}
          <span className="text-indigo-400">Halal?</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          2,000+ halal-certified products. 500+ trusted sellers. Zero compromise.
          Your halal lifestyle, all in one place.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
        >
          <Link href="/marketplace">
            <motion.button
              whileHover={{
                scale: 1.04,
                boxShadow: '0 20px 50px -12px rgba(99,102,241,0.45)',
              }}
              whileTap={{ scale: 0.97 }}
              className="px-10 py-5 bg-indigo-600 text-white font-bold text-lg rounded-full shadow-xl shadow-indigo-600/25 flex items-center gap-2"
            >
              Explore Marketplace
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
            href="/rewards"
            className="text-gray-500 hover:text-indigo-400 transition-colors text-sm font-semibold"
          >
            &larr; Rewards
          </Link>
          <Link
            href="/hub"
            className="text-gray-500 hover:text-indigo-400 transition-colors text-sm font-semibold"
          >
            Hub &rarr;
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
