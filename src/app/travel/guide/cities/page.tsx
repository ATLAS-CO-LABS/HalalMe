'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { MapPin, ArrowLeft, Star, Filter, Search } from 'lucide-react';
import Header from '@/components/layout/Header';
import { CityCard } from '@/components/travel/guide';
import { cityGuides } from '@/data/cityGuides';

export default function CitiesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScore, setSelectedScore] = useState<number | null>(null);

  const filteredCities = cityGuides.filter((city) => {
    const matchesSearch =
      city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesScore = selectedScore === null || city.halalScore >= selectedScore;
    return matchesSearch && matchesScore;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-sky-950 to-gray-900">
      <Header />

      {/* Hero Section */}
      <section className="pt-24 pb-8 md:pt-32 md:pb-12 px-4 md:px-6">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/travel/guide"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-sky-400 text-sm mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Guide
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-r from-sky-600 to-cyan-600 p-3 rounded-xl">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1
                  className="text-3xl md:text-4xl font-extrabold text-white"
                  style={{ fontFamily: 'var(--font-headline)' }}
                >
                  City Guides
                </h1>
                <p className="text-gray-400">Explore Muslim-friendly destinations worldwide</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="px-4 md:px-6 pb-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search cities or countries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
              />
            </div>

            {/* Halal Score Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <div className="flex gap-2">
                {[null, 5, 4, 3].map((score) => (
                  <button
                    key={score ?? 'all'}
                    onClick={() => setSelectedScore(score)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                      selectedScore === score
                        ? 'bg-sky-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {score === null ? (
                      'All'
                    ) : (
                      <>
                        <Star className="w-3 h-3 fill-current" />
                        {score}+
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cities Grid */}
      <section className="px-4 md:px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-gray-400 mb-6">{filteredCities.length} cities found</p>

          <div className="grid md:grid-cols-2 gap-6">
            {filteredCities.map((city, index) => (
              <motion.div
                key={city.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <CityCard city={city} />
              </motion.div>
            ))}
          </div>

          {filteredCities.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-white font-semibold text-xl mb-2">No cities found</h3>
              <p className="text-gray-400">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </section>

      {/* Suggest a City */}
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
              Can&apos;t find your destination?
            </h2>
            <p className="text-gray-400 mb-6">
              We&apos;re constantly adding new city guides. Let us know which cities you&apos;d like to see!
            </p>
            <motion.button
              className="bg-gray-800 text-white px-6 py-3 rounded-full font-semibold border border-gray-700 hover:border-sky-500"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Suggest a City
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Back Link */}
      <section className="px-4 md:px-6 py-12">
        <div className="mx-auto max-w-4xl text-center">
          <Link
            href="/travel/guide"
            className="text-gray-400 hover:text-sky-400 transition-colors text-sm font-semibold"
          >
            ← Back to Travel Guide
          </Link>
        </div>
      </section>
    </div>
  );
}
