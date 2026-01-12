'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Brain, BookOpen } from 'lucide-react';

export default function KitchenHome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 md:py-20 px-4 md:px-6">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-600 rounded-full filter blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500 rounded-full filter blur-3xl opacity-20"></div>
        </div>

        <div className="mx-auto max-w-5xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 md:mb-6"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              HalalMe <span className="text-[#FF8A1E]">Kitchen</span>
            </h1>
            <p
              className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-normal leading-relaxed px-4"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Your smart halal cooking companion. Get AI-powered recipe suggestions,
              discover community recipes, and master the art of halal cooking.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Two Main Cards Section */}
      <section className="px-4 md:px-6 pb-16 md:pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* AI Recipe Assistant Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link href="/kitchen/ai-assistant">
                <motion.div
                  className="group relative h-full bg-gradient-to-br from-[#FF8A1E] via-[#E67A15] to-[#CC6A0F] rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden cursor-pointer"
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
                      🧠 AI Recipe Assistant
                    </h2>

                    <p
                      className="text-white/90 text-base md:text-lg leading-relaxed mb-4 md:mb-6 font-normal"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      Have ingredients but don't know what to cook? Let our AI assistant help you create delicious halal recipes, provide cooking tips, and answer all your culinary questions.
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 w-6 h-6 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm">✓</span>
                        </div>
                        <p className="text-white/90 font-normal" style={{ fontFamily: 'var(--font-body)' }}>
                          Paste your ingredients and get recipe suggestions
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="mt-1 w-6 h-6 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm">✓</span>
                        </div>
                        <p className="text-white/90 font-normal" style={{ fontFamily: 'var(--font-body)' }}>
                          Ask for cooking help and substitutions
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="mt-1 w-6 h-6 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm">✓</span>
                        </div>
                        <p className="text-white/90 font-normal" style={{ fontFamily: 'var(--font-body)' }}>
                          Get step-by-step cooking instructions
                        </p>
                      </div>
                    </div>

                    <motion.div
                      className="mt-8 inline-flex items-center gap-2 bg-white text-[#FF8A1E] px-6 py-3 rounded-full font-semibold"
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
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link href="/kitchen/recipes">
                <motion.div
                  className="group relative h-full bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden cursor-pointer border border-gray-600/50"
                  whileHover={{ scale: 1.02, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full filter blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full filter blur-3xl"></div>
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="bg-white/10 backdrop-blur-sm rounded-full p-4">
                        <BookOpen className="w-12 h-12 text-white" />
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
                      📖 Explore Recipes
                    </h2>

                    <p
                      className="text-gray-300 text-base md:text-lg leading-relaxed mb-4 md:mb-6 font-normal"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      Browse through thousands of halal recipes shared by our community. Find inspiration, save your favorites, and share your own culinary creations with food lovers worldwide.
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm">✓</span>
                        </div>
                        <p className="text-gray-300 font-normal" style={{ fontFamily: 'var(--font-body)' }}>
                          Discover recipes from around the world
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="mt-1 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm">✓</span>
                        </div>
                        <p className="text-gray-300 font-normal" style={{ fontFamily: 'var(--font-body)' }}>
                          Filter by cuisine, difficulty, and cooking time
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="mt-1 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm">✓</span>
                        </div>
                        <p className="text-gray-300 font-normal" style={{ fontFamily: 'var(--font-body)' }}>
                          Upload and share your own recipes
                        </p>
                      </div>
                    </div>

                    <motion.div
                      className="mt-8 inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-full font-semibold"
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

      {/* Why HalalMe Kitchen Section */}
      <section className="px-4 md:px-6 py-12 md:py-16 bg-gradient-to-br from-gray-800 via-gray-900 to-black">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 md:mb-4"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              Why Choose HalalMe Kitchen?
            </h2>
            <p
              className="text-base sm:text-lg md:text-xl text-gray-400 font-normal"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              More than just recipes — it's your complete halal cooking companion
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center"
            >
              <div className="bg-gradient-to-br from-[#FF8A1E] to-[#CC6A0F] rounded-2xl p-6 mb-4">
                <span className="text-5xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
                AI-Powered
              </h3>
              <p className="text-gray-400 font-normal" style={{ fontFamily: 'var(--font-body)' }}>
                Smart cooking assistant that understands your needs and provides personalized help
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <div className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl p-6 mb-4">
                <span className="text-5xl">👥</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
                Community-Driven
              </h3>
              <p className="text-gray-400 font-normal" style={{ fontFamily: 'var(--font-body)' }}>
                Recipes shared by real people from the global Muslim community
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center"
            >
              <div className="bg-gradient-to-br from-[#FF8A1E] to-[#CC6A0F] rounded-2xl p-6 mb-4">
                <span className="text-5xl">✅</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
                100% Halal
              </h3>
              <p className="text-gray-400 font-normal" style={{ fontFamily: 'var(--font-body)' }}>
                Every recipe is verified halal — cook with confidence and trust
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
