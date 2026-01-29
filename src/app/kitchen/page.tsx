'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Brain, BookOpen, Sparkles, ChefHat, Utensils, Globe } from 'lucide-react';

export default function KitchenLandingPage() {
  const router = useRouter();

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Recipes",
      description: "Get personalized recipe suggestions based on your ingredients",
      color: "from-fuchsia-500 to-fuchsia-600",
    },
    {
      icon: BookOpen,
      title: "Recipe Library",
      description: "Browse thousands of verified halal recipes",
      color: "from-pink-500 to-pink-600",
    },
    {
      icon: Utensils,
      title: "Cooking Tips",
      description: "Expert advice and substitution suggestions",
      color: "from-rose-500 to-rose-600",
    },
    {
      icon: ChefHat,
      title: "Share Recipes",
      description: "Upload and share your own culinary creations",
      color: "from-purple-500 to-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-fuchsia-950 to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24 px-4 md:px-6">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-fuchsia-600 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        </div>

        <div className="mx-auto max-w-5xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 bg-fuchsia-500/20 border border-fuchsia-500/30 rounded-full px-4 py-2 mb-6"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-4 h-4 text-fuchsia-400" />
              <span className="text-fuchsia-300 text-sm font-semibold">
                Your Smart Halal Cooking Companion
              </span>
            </motion.div>

            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              HalalMe{' '}
              <span className="bg-gradient-to-r from-fuchsia-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
                Kitchen
              </span>
            </h1>

            <p
              className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed font-normal"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Get AI-powered recipe suggestions, discover community recipes,
              and master the art of halal cooking with your personal culinary assistant.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                onClick={() => router.push('/kitchen/ai-assistant')}
                className="w-full sm:w-auto bg-gradient-to-r from-fuchsia-600 via-pink-500 to-pink-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-2xl"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 20px 40px -10px rgba(217, 70, 239, 0.6)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Start Cooking with AI
              </motion.button>

              <motion.button
                onClick={() => router.push('/kitchen/recipes')}
                className="w-full sm:w-auto bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-full font-bold text-lg border-2 border-gray-700 hover:border-fuchsia-500 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Browse Recipes
              </motion.button>
            </div>

            <p
              className="text-gray-500 text-sm mt-6 font-normal"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              New to HalalMe?{' '}
              <Link
                href="/select-role"
                className="text-fuchsia-400 hover:text-fuchsia-300 font-semibold underline"
              >
                Create an account
              </Link>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Cards Section */}
      <section className="px-4 md:px-6 py-16 md:py-20 bg-gradient-to-r from-fuchsia-900/20 to-pink-900/20">
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
                  className="group relative h-full bg-gradient-to-br from-fuchsia-600 via-fuchsia-700 to-pink-700 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden cursor-pointer"
                  whileHover={{ scale: 1.02, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full filter blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full filter blur-3xl"></div>
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                        <Brain className="w-12 h-12 text-white" />
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

                    <h2
                      className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4"
                      style={{ fontFamily: 'var(--font-headline)' }}
                    >
                      AI Recipe Assistant
                    </h2>

                    <p
                      className="text-white/90 text-base md:text-lg leading-relaxed mb-4 md:mb-6 font-normal"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
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
                          <p className="text-white/90 font-normal" style={{ fontFamily: 'var(--font-body)' }}>
                            {item}
                          </p>
                        </div>
                      ))}
                    </div>

                    <motion.div
                      className="mt-8 inline-flex items-center gap-2 bg-white text-fuchsia-600 px-6 py-3 rounded-full font-semibold"
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
                  className="group relative h-full bg-gray-800 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden cursor-pointer border border-gray-700 hover:border-fuchsia-500 transition-all"
                  whileHover={{ scale: 1.02, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500 rounded-full filter blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500 rounded-full filter blur-3xl"></div>
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="bg-fuchsia-500/20 backdrop-blur-sm rounded-full p-4">
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

                    <h2
                      className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4"
                      style={{ fontFamily: 'var(--font-headline)' }}
                    >
                      Explore Recipes
                    </h2>

                    <p
                      className="text-gray-300 text-base md:text-lg leading-relaxed mb-4 md:mb-6 font-normal"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      Browse through thousands of halal recipes shared by our community. Find inspiration and share your own.
                    </p>

                    <div className="space-y-3">
                      {[
                        "Discover recipes from around the world",
                        "Filter by cuisine, difficulty, and cooking time",
                        "Upload and share your own recipes",
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="mt-1 w-6 h-6 rounded-full bg-fuchsia-500/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-fuchsia-400 text-sm">✓</span>
                          </div>
                          <p className="text-gray-300 font-normal" style={{ fontFamily: 'var(--font-body)' }}>
                            {item}
                          </p>
                        </div>
                      ))}
                    </div>

                    <motion.div
                      className="mt-8 inline-flex items-center gap-2 bg-fuchsia-600 text-white px-6 py-3 rounded-full font-semibold"
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
      <section className="px-4 md:px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              Why Choose HalalMe Kitchen?
            </h2>
            <p
              className="text-lg md:text-xl text-gray-400 font-normal"
              style={{ fontFamily: 'var(--font-body)' }}
            >
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
                  whileHover={{ y: -8 }}
                  className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-fuchsia-500 transition-all"
                >
                  <div
                    className={`bg-gradient-to-br ${feature.color} rounded-xl p-4 mb-4 inline-block`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3
                    className="text-xl font-bold text-white mb-2"
                    style={{ fontFamily: 'var(--font-headline)' }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className="text-gray-400 font-normal"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 md:px-6 py-16 md:py-20 bg-gradient-to-r from-fuchsia-900/30 to-pink-900/30">
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
                <h3
                  className="text-3xl md:text-4xl font-bold text-white mb-2"
                  style={{ fontFamily: 'var(--font-headline)' }}
                >
                  {stat.value}
                </h3>
                <p
                  className="text-gray-400 font-normal"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 md:px-6 py-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Globe className="w-16 h-16 text-fuchsia-400 mx-auto mb-6" />
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              Ready to Start Cooking?
            </h2>
            <p
              className="text-lg md:text-xl text-gray-400 mb-8 font-normal"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Let our AI assistant help you create delicious halal meals today.
            </p>
            <motion.button
              onClick={() => router.push('/kitchen/ai-assistant')}
              className="bg-gradient-to-r from-fuchsia-600 via-pink-500 to-pink-600 text-white px-10 py-5 rounded-full font-bold text-xl shadow-2xl"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 25px 50px -12px rgba(217, 70, 239, 0.6)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              Start Cooking with AI
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Back Links */}
      <section className="px-4 md:px-6 pb-16">
        <div className="mx-auto max-w-4xl text-center flex justify-center gap-6">
          <Link
            href="/hub"
            className="text-gray-400 hover:text-fuchsia-400 transition-colors text-sm font-semibold"
          >
            ← Hub
          </Link>
          <Link
            href="/rewards"
            className="text-gray-400 hover:text-fuchsia-400 transition-colors text-sm font-semibold"
          >
            Rewards →
          </Link>
        </div>
      </section>
    </div>
  );
}
