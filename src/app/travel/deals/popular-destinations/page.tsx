'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { MapPin, ArrowLeft, Star, Filter } from 'lucide-react';
import Header from '@/components/layout/Header';
import { DestinationCard } from '@/components/travel/deals';
import { popularDestinations } from '@/data/travelMockData';

export default function PopularDestinationsPage() {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'halal-5', label: 'Halal Score 5' },
    { id: 'budget', label: 'Budget Friendly' },
    { id: 'beach', label: 'Beach' },
    { id: 'cultural', label: 'Cultural' },
  ];

  const filteredDestinations = popularDestinations.filter((dest) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'halal-5') return dest.halalScore === 5;
    if (selectedFilter === 'budget') return dest.flightPriceFrom < 150;
    if (selectedFilter === 'beach') return dest.tags.some((t) => t.toLowerCase().includes('beach'));
    if (selectedFilter === 'cultural') return dest.tags.some((t) => t.toLowerCase().includes('cultur') || t.toLowerCase().includes('historic'));
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-sky-950 to-gray-900">
      <Header />

      {/* Hero Section */}
      <section className="pt-24 pb-8 md:pt-32 md:pb-12 px-4 md:px-6">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/travel/deals"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-sky-400 text-sm mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Deals
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-r from-cyan-600 to-teal-600 p-3 rounded-xl">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1
                  className="text-3xl md:text-4xl font-extrabold text-white"
                  style={{ fontFamily: 'var(--font-headline)' }}
                >
                  Popular Destinations
                </h1>
                <p className="text-gray-400">Explore Muslim-friendly cities around the world</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Halal Score Legend */}
      <section className="px-4 md:px-6 pb-6">
        <div className="mx-auto max-w-5xl">
          <div className="bg-gray-800/50 rounded-xl p-4 flex flex-wrap items-center gap-4">
            <span className="text-gray-400 text-sm">Halal Score:</span>
            <div className="flex items-center gap-4">
              {[5, 4, 3].map((score) => (
                <div key={score} className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${i < score ? 'text-sky-400 fill-sky-400' : 'text-gray-600'}`}
                    />
                  ))}
                  <span className="text-gray-400 text-xs ml-1">
                    {score === 5 ? 'Excellent' : score === 4 ? 'Very Good' : 'Good'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Filter */}
      <section className="px-4 md:px-6 pb-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedFilter === filter.id
                    ? 'bg-sky-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="px-4 md:px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDestinations.map((destination, index) => (
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

          {filteredDestinations.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-white font-semibold text-xl mb-2">No destinations found</h3>
              <p className="text-gray-400">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </section>

      {/* Explore Guide CTA */}
      <section className="px-4 md:px-6 py-12 bg-gradient-to-r from-sky-900/30 to-cyan-900/30">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2
              className="text-2xl md:text-3xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              Plan Your Trip
            </h2>
            <p className="text-gray-400 mb-6">
              Explore our detailed city guides with information about mosques, halal restaurants, and travel tips.
            </p>
            <Link href="/travel/guide">
              <motion.button
                className="bg-gradient-to-r from-sky-600 to-cyan-600 text-white px-8 py-3 rounded-full font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Travel Guides
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Back Link */}
      <section className="px-4 md:px-6 py-12">
        <div className="mx-auto max-w-4xl text-center">
          <Link
            href="/travel/deals"
            className="text-gray-400 hover:text-sky-400 transition-colors text-sm font-semibold"
          >
            ← Back to All Deals
          </Link>
        </div>
      </section>
    </div>
  );
}
