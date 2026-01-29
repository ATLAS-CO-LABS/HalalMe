'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bookmark,
  Bell,
  Clock,
  Plane,
  Building2,
  Car,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import { SavedSearchCard } from '@/components/travel/my-trips';
import { mockSavedSearches, mockPriceAlerts, mockRecentSearches } from '@/data/travelMockData';

export default function MyTripsPage() {
  const router = useRouter();

  const stats = [
    {
      icon: Bookmark,
      label: 'Saved Searches',
      value: mockSavedSearches.length,
      href: '/travel/my-trips/saved-searches',
      color: 'from-sky-600 to-cyan-600',
    },
    {
      icon: Bell,
      label: 'Price Alerts',
      value: mockPriceAlerts.filter((a) => a.isActive).length,
      href: '/travel/my-trips/price-alerts',
      color: 'from-cyan-600 to-teal-600',
    },
    {
      icon: Clock,
      label: 'Recent Searches',
      value: mockRecentSearches.length,
      href: '/travel/my-trips/recent-searches',
      color: 'from-teal-600 to-emerald-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-sky-950 to-gray-900">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-8 md:pt-32 md:pb-12 px-4 md:px-6">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-600 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        </div>

        <div className="mx-auto max-w-5xl relative z-10">
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
                Your Travel Dashboard
              </span>
            </motion.div>

            <h1
              className="text-4xl md:text-5xl font-extrabold text-white mb-4"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              My{' '}
              <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Trips
              </span>
            </h1>

            <p
              className="text-lg text-gray-300 max-w-2xl"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Manage your saved searches, price alerts, and recent activity all in one place.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="px-4 md:px-6 pb-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid md:grid-cols-3 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Link href={stat.href}>
                    <motion.div
                      className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-sky-500 transition-all cursor-pointer"
                      whileHover={{ y: -4 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`bg-gradient-to-br ${stat.color} rounded-lg p-2`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">{stat.label}</p>
                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Saved Searches Preview */}
      <section className="px-4 md:px-6 py-8 bg-gradient-to-r from-sky-900/20 to-cyan-900/20">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-xl font-bold text-white"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              Saved Searches
            </h2>
            <Link
              href="/travel/my-trips/saved-searches"
              className="text-sky-400 hover:text-sky-300 text-sm font-medium flex items-center gap-1"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {mockSavedSearches.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {mockSavedSearches.slice(0, 2).map((search, index) => (
                <motion.div
                  key={search.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <SavedSearchCard
                    search={search}
                    onSearch={() => {
                      const path = search.type === 'flight' ? '/travel/flights' : search.type === 'hotel' ? '/travel/hotels' : '/travel/cars';
                      router.push(path);
                    }}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-800/50 rounded-xl border border-gray-700">
              <Bookmark className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No saved searches yet</p>
              <Link href="/travel/flights" className="text-sky-400 hover:text-sky-300 text-sm">
                Start searching →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="px-4 md:px-6 py-8">
        <div className="mx-auto max-w-5xl">
          <h2
            className="text-xl font-bold text-white mb-6"
            style={{ fontFamily: 'var(--font-headline)' }}
          >
            Quick Actions
          </h2>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: Plane, label: 'Search Flights', href: '/travel/flights', color: 'from-sky-600 to-cyan-600' },
              { icon: Building2, label: 'Find Hotels', href: '/travel/hotels', color: 'from-cyan-600 to-teal-600' },
              { icon: Car, label: 'Rent a Car', href: '/travel/cars', color: 'from-teal-600 to-emerald-600' },
            ].map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Link href={action.href}>
                    <motion.div
                      className={`bg-gradient-to-r ${action.color} rounded-xl p-6 text-center cursor-pointer`}
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon className="w-8 h-8 text-white mx-auto mb-2" />
                      <p className="text-white font-semibold">{action.label}</p>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="px-4 md:px-6 py-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-gray-500 text-sm">
            Note: HalalMe Travel is a search and comparison service. We do not store bookings
            or process payments. All bookings are completed through our partner websites.
          </p>
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
