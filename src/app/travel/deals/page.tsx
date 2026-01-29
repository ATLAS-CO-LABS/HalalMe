'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Tag, Sparkles, Plane, MapPin, Calendar } from 'lucide-react';
import Header from '@/components/layout/Header';
import { DealCard, DestinationCard, SeasonalBanner } from '@/components/travel/deals';
import { mockDeals, popularDestinations } from '@/data/travelMockData';

export default function DealsPage() {
  const featuredDeals = mockDeals.filter((deal) => deal.isFeatured);

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
                Exclusive Travel Deals
              </span>
            </motion.div>

            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              Travel{' '}
              <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Deals
              </span>
            </h1>

            <p
              className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Discover amazing deals on flights, hotels, and holiday packages to
              Muslim-friendly destinations worldwide.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="px-4 md:px-6 pb-12">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Plane, label: "Cheap Flights", href: "/travel/deals/cheap-flights", color: "from-sky-600 to-cyan-600" },
              { icon: MapPin, label: "Popular Destinations", href: "/travel/deals/popular-destinations", color: "from-cyan-600 to-teal-600" },
              { icon: Calendar, label: "Seasonal Deals", href: "/travel/deals/seasonal-deals", color: "from-teal-600 to-emerald-600" },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Link href={item.href}>
                    <motion.div
                      className={`bg-gradient-to-r ${item.color} rounded-xl p-4 text-center cursor-pointer`}
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className="w-6 h-6 text-white mx-auto mb-2" />
                      <span className="text-white font-semibold text-sm">{item.label}</span>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Seasonal Banners */}
      <section className="px-4 md:px-6 pb-12">
        <div className="mx-auto max-w-5xl space-y-4">
          <SeasonalBanner
            season="ramadan"
            title="Ramadan & Umrah Deals"
            subtitle="Special packages for the holy month"
            href="/travel/deals/seasonal-deals"
          />
          <SeasonalBanner
            season="summer"
            title="Summer Escapes"
            subtitle="Up to 40% off on beach destinations"
            href="/travel/deals/seasonal-deals"
          />
        </div>
      </section>

      {/* Featured Deals */}
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
                Featured Deals
              </h2>
              <p className="text-gray-400">Hand-picked offers with the best value</p>
            </div>
            <Link
              href="/travel/deals/cheap-flights"
              className="text-sky-400 hover:text-sky-300 font-semibold text-sm flex items-center gap-1"
            >
              View All
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredDeals.map((deal, index) => (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <DealCard deal={deal} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="px-4 md:px-6 py-12">
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
                Popular Destinations
              </h2>
              <p className="text-gray-400">Explore Muslim-friendly cities</p>
            </div>
            <Link
              href="/travel/deals/popular-destinations"
              className="text-sky-400 hover:text-sky-300 font-semibold text-sm flex items-center gap-1"
            >
              View All
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularDestinations.slice(0, 6).map((destination, index) => (
              <motion.div
                key={destination.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <DestinationCard destination={destination} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="px-4 md:px-6 py-12 bg-gradient-to-r from-sky-900/30 to-cyan-900/30">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Tag className="w-12 h-12 text-sky-400 mx-auto mb-4" />
            <h2
              className="text-2xl md:text-3xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              Never Miss a Deal
            </h2>
            <p className="text-gray-400 mb-6">
              Set up price alerts and get notified when prices drop on your favorite routes.
            </p>
            <Link href="/travel/my-trips/price-alerts">
              <motion.button
                className="bg-gradient-to-r from-sky-600 to-cyan-600 text-white px-8 py-3 rounded-full font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Set Up Price Alerts
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Back to Travel */}
      <section className="px-4 md:px-6 py-12">
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
