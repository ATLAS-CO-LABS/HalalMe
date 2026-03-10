'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  ChefHat,
  Utensils,
  Globe,
  Sparkles,
  ShieldCheck,
  Star,
  ArrowRight,
} from 'lucide-react';

/* Kitchen color: dark magenta */
const MAGENTA = '#A21CAF';

export default function KitchenLandingPage() {
  const router = useRouter();

  const features = [
    {
      icon: ChefHat,
      title: "Personalised Recipes",
      description: "Get personalized recipe suggestions based on your ingredients",
    },
    {
      icon: BookOpen,
      title: "Recipe Library",
      description: "Browse thousands of verified halal recipes",
    },
    {
      icon: Utensils,
      title: "Cooking Tips",
      description: "Expert advice and substitution suggestions",
    },
    {
      icon: ChefHat,
      title: "Share Recipes",
      description: "Upload and share your own culinary creations",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] max-h-[900px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1920&auto=format&fit=crop&q=80"
            alt="Halal cooking"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>
        {/* Solid dark overlay for readability */}
        <div className="absolute inset-0 z-[1] bg-gray-950/70" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 pt-20">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2.5 bg-fuchsia-700/15 border border-fuchsia-400/25 backdrop-blur-md rounded-full px-5 py-2.5 mb-5 sm:mb-8"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-400 animate-pulse" />
              <span className="text-fuchsia-300 text-sm font-semibold tracking-wide">
                Your Halal Cooking Companion
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] mb-6 tracking-tight"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              HalalMe{' '}
              <span className="relative inline-block">
                <span className="text-fuchsia-400">Kitchen</span>
                <motion.span
                  className="absolute -bottom-1 left-0 right-0 h-1 bg-fuchsia-500 rounded-full origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 1 }}
                />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-base sm:text-lg md:text-xl text-gray-300/90 max-w-xl leading-relaxed mb-6 sm:mb-10"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Get AI-powered recipe suggestions, discover community recipes,
              and master the art of halal cooking with your personal culinary assistant.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.65 }}
              className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-12 sm:mb-14"
            >
              <motion.button
                onClick={() => router.push('/kitchen/ai-assistant')}
                whileHover={{ scale: 1.04, boxShadow: '0 20px 50px -12px rgba(162,28,175,0.5)' }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto px-8 py-4 md:px-10 md:py-5 bg-fuchsia-700 text-white font-bold text-lg rounded-full shadow-xl shadow-fuchsia-700/25 flex items-center justify-center gap-2.5"
              >
                Start Cooking with AI
                <ArrowRight className="w-5 h-5" />
              </motion.button>

              <motion.button
                onClick={() => router.push('/kitchen/recipes')}
                whileHover={{ scale: 1.04, backgroundColor: 'rgba(255,255,255,0.12)' }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto px-8 py-4 md:px-10 md:py-5 bg-white/8 border border-white/20 backdrop-blur-sm text-white font-bold text-lg rounded-full hover:border-white/40 transition-all"
              >
                Browse Recipes
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="flex flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm"
            >
              {[
                { icon: Sparkles, text: 'AI-Powered' },
                { icon: BookOpen, text: '5K+ Recipes' },
                { icon: Globe, text: '50+ Cuisines' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-400">
                  <item.icon className="w-4 h-4 text-fuchsia-400" />
                  <span>{item.text}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-fuchsia-400 rounded-full" />
          </div>
        </div>
      </section>

      {/* Main Cards Section */}
      <section className="px-4 md:px-6 py-16 md:py-20 bg-gray-900">
        <div className="mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* AI Recipe Assistant Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link href="/kitchen/ai-assistant">
                <motion.div
                  className="group relative h-full bg-fuchsia-700 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xl shadow-fuchsia-700/20 overflow-hidden cursor-pointer"
                  whileHover={{ scale: 1.02, y: -6 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="bg-white/20 rounded-full p-4">
                        <ChefHat className="w-12 h-12 text-white" />
                      </div>
                      <motion.svg
                        className="w-8 h-8 text-white opacity-70 group-hover:opacity-100"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </motion.svg>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4" style={{ fontFamily: 'var(--font-headline)' }}>
                      AI Recipe Assistant
                    </h2>

                    <p className="text-white/90 text-base md:text-lg leading-relaxed mb-4 md:mb-6" style={{ fontFamily: 'var(--font-body)' }}>
                      Have ingredients but don&apos;t know what to cook? Let our AI assistant help you create delicious halal recipes.
                    </p>

                    <div className="space-y-3">
                      {[
                        "Paste your ingredients and get recipe suggestions",
                        "Ask for cooking help and substitutions",
                        "Get step-by-step cooking instructions",
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="mt-1 w-6 h-6 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm">✓</span>
                          </div>
                          <p className="text-white/90" style={{ fontFamily: 'var(--font-body)' }}>{item}</p>
                        </div>
                      ))}
                    </div>

                    <motion.div
                      className="mt-8 inline-flex items-center gap-2 bg-white text-fuchsia-700 px-6 py-3 rounded-full font-semibold"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Start Cooking with AI
                    </motion.div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>

            {/* Explore Recipes Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link href="/kitchen/recipes">
                <motion.div
                  className="group relative h-full bg-gray-800 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xl overflow-hidden cursor-pointer border border-gray-700 hover:border-fuchsia-500/50 transition-all"
                  whileHover={{ scale: 1.02, y: -6 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="bg-fuchsia-500/20 rounded-full p-4">
                        <BookOpen className="w-12 h-12 text-fuchsia-400" />
                      </div>
                      <motion.svg
                        className="w-8 h-8 text-gray-400 opacity-70 group-hover:opacity-100 group-hover:text-fuchsia-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </motion.svg>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4" style={{ fontFamily: 'var(--font-headline)' }}>
                      Explore Recipes
                    </h2>

                    <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-4 md:mb-6" style={{ fontFamily: 'var(--font-body)' }}>
                      Browse through thousands of halal recipes shared by our community. Find inspiration and share your own.
                    </p>

                    <div className="space-y-3">
                      {[
                        "Discover recipes from around the world",
                        "Filter by cuisine, difficulty, and cooking time",
                        "Upload and share your own recipes",
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="mt-1 w-6 h-6 rounded-full bg-fuchsia-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-fuchsia-400 text-sm">✓</span>
                          </div>
                          <p className="text-gray-300" style={{ fontFamily: 'var(--font-body)' }}>{item}</p>
                        </div>
                      ))}
                    </div>

                    <motion.div
                      className="mt-8 inline-flex items-center gap-2 bg-fuchsia-700 text-white px-6 py-3 rounded-full font-semibold"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Browse Recipes
                    </motion.div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 md:px-6 py-16 md:py-20 bg-gray-950">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-headline)' }}>
              Why Choose HalalMe <span className="text-fuchsia-400">Kitchen?</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-400" style={{ fontFamily: 'var(--font-body)' }}>
              More than just recipes — it&apos;s your complete halal cooking companion
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -6 }}
                  className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-fuchsia-500/40 transition-all shadow-sm hover:shadow-md"
                >
                  <div className="bg-fuchsia-700 rounded-xl p-4 mb-4 inline-block shadow-md">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
                    {feature.title}
                  </h3>
                  <p className="text-gray-400" style={{ fontFamily: 'var(--font-body)' }}>
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 md:px-6 py-16 bg-fuchsia-700/5 border-y border-fuchsia-500/10">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Recipes", value: "5K+" },
              { label: "AI Chats Daily", value: "1K+" },
              { label: "Community Members", value: "10K+" },
              { label: "Cuisines", value: "50+" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
                  {stat.value}
                </h3>
                <p className="text-gray-400" style={{ fontFamily: 'var(--font-body)' }}>
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 md:px-6 py-16 md:py-20 bg-gray-950">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Globe className="w-16 h-16 text-fuchsia-400 mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-headline)' }}>
              Ready to Start <span className="text-fuchsia-400">Cooking?</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-400 mb-8" style={{ fontFamily: 'var(--font-body)' }}>
              Let our AI assistant help you create delicious halal meals today.
            </p>
            <motion.button
              onClick={() => router.push('/kitchen/ai-assistant')}
              className="bg-fuchsia-700 text-white px-10 py-5 rounded-full font-bold text-xl shadow-xl shadow-fuchsia-700/20"
              whileHover={{ scale: 1.05, boxShadow: "0 25px 50px -12px rgba(162,28,175,0.5)" }}
              whileTap={{ scale: 0.95 }}
            >
              Start Cooking with AI
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Back Links */}
      <section className="px-4 md:px-6 pb-12">
        <div className="mx-auto max-w-4xl text-center flex justify-center gap-6">
          <Link href="/hub" className="text-gray-400 hover:text-fuchsia-400 transition-colors text-sm font-semibold">
            ← Hub
          </Link>
          <Link href="/rewards" className="text-gray-400 hover:text-fuchsia-400 transition-colors text-sm font-semibold">
            Rewards →
          </Link>
        </div>
      </section>
    </div>
  );
}
