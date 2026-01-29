'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Compass, Sparkles, BookOpen, MapPin, Lightbulb, Star } from 'lucide-react';
import Header from '@/components/layout/Header';
import { CityCard, TravelTipCard } from '@/components/travel/guide';
import { cityGuides, travelTips } from '@/data/cityGuides';

export default function GuideLandingPage() {
  const featuredCities = cityGuides.slice(0, 4);
  const featuredTips = travelTips.slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-sky-950 to-gray-900">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-12 md:pt-32 md:pb-16 px-4 md:px-6">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-600 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        </div>

        <div className="mx-auto max-w-5xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 bg-sky-500/20 border border-sky-500/30 rounded-full px-4 py-2 mb-6"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span className="text-sky-300 text-sm font-semibold">
                Muslim Travel Guide
              </span>
            </motion.div>

            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              Travel{' '}
              <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Guide
              </span>
            </h1>

            <p
              className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Comprehensive guides to Muslim-friendly destinations with information
              about mosques, halal restaurants, and travel tips.
            </p>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                onClick={() => {
                  document.getElementById('cities')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto bg-gradient-to-r from-sky-600 to-cyan-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MapPin className="w-5 h-5" />
                Explore Cities
              </motion.button>
              <Link href="/travel/guide/tips">
                <motion.button
                  className="w-full sm:w-auto bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-full font-bold text-lg border border-gray-700 hover:border-sky-500 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Lightbulb className="w-5 h-5" />
                  Travel Tips
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 md:px-6 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '🕌', value: '50+', label: 'City Guides' },
              { icon: '🍽️', value: '20K+', label: 'Halal Restaurants' },
              { icon: '📍', value: '5K+', label: 'Mosques Listed' },
              { icon: '💡', value: '100+', label: 'Travel Tips' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gray-800/50 rounded-xl p-4 text-center"
              >
                <div className="text-2xl mb-1">{stat.icon}</div>
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cities */}
      <section id="cities" className="px-4 md:px-6 py-12 bg-gradient-to-r from-sky-900/20 to-cyan-900/20">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h2
                className="text-2xl md:text-3xl font-bold text-white mb-2"
                style={{ fontFamily: 'var(--font-headline)' }}
              >
                Popular City Guides
              </h2>
              <p className="text-gray-400">In-depth guides to Muslim-friendly cities</p>
            </div>
            <Link
              href="/travel/guide/cities"
              className="text-sky-400 hover:text-sky-300 font-semibold text-sm flex items-center gap-1"
            >
              View All
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {featuredCities.map((city, index) => (
              <motion.div
                key={city.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <CityCard city={city} variant={index === 0 ? 'featured' : 'default'} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What's in Each Guide */}
      <section className="px-4 md:px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2
              className="text-2xl md:text-3xl font-bold text-white mb-2"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              What&apos;s in Each Guide
            </h2>
            <p className="text-gray-400">Everything you need to plan a halal-friendly trip</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: '🕌', title: 'Mosques', desc: 'Top mosques with addresses and details' },
              { icon: '🍽️', title: 'Halal Restaurants', desc: 'Verified halal dining options' },
              { icon: '🏛️', title: 'Attractions', desc: 'Muslim-friendly places to visit' },
              { icon: '⭐', title: 'Halal Score', desc: 'Overall halal-friendliness rating' },
              { icon: '💡', title: 'Local Tips', desc: 'Insider advice for Muslim travelers' },
              { icon: '✈️', title: 'Travel Info', desc: 'Best times to visit and transport' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gray-800 rounded-xl p-4 border border-gray-700"
              >
                <div className="text-2xl mb-2">{item.icon}</div>
                <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tips */}
      <section className="px-4 md:px-6 py-12 bg-gradient-to-r from-sky-900/20 to-cyan-900/20">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h2
                className="text-2xl md:text-3xl font-bold text-white mb-2"
                style={{ fontFamily: 'var(--font-headline)' }}
              >
                Travel Tips
              </h2>
              <p className="text-gray-400">Essential advice for Muslim travelers</p>
            </div>
            <Link
              href="/travel/guide/tips"
              className="text-sky-400 hover:text-sky-300 font-semibold text-sm flex items-center gap-1"
            >
              View All
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTips.map((tip, index) => (
              <TravelTipCard key={tip.id} tip={tip} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 md:px-6 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Compass className="w-16 h-16 text-sky-400 mx-auto mb-6" />
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              Start Planning Your Trip
            </h2>
            <p className="text-gray-400 mb-8">
              Find flights, hotels, and complete your travel plans with HalalMe Travel.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/travel/flights">
                <motion.button
                  className="bg-gradient-to-r from-sky-600 to-cyan-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Search Flights
                </motion.button>
              </Link>
              <Link href="/travel/deals">
                <motion.button
                  className="bg-gray-800 text-white px-8 py-4 rounded-full font-bold text-lg border border-gray-700 hover:border-sky-500"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View Deals
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Back Link */}
      <section className="px-4 md:px-6 pb-16">
        <div className="mx-auto max-w-4xl text-center">
          <Link
            href="/travel"
            className="text-gray-400 hover:text-sky-400 transition-colors text-sm font-semibold"
          >
            ← Back to Travel
          </Link>
        </div>
      </section>
    </div>
  );
}
