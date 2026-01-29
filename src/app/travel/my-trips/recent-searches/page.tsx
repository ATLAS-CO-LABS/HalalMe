'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock, ArrowLeft, Trash2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import { RecentSearchCard } from '@/components/travel/my-trips';
import { mockRecentSearches, type RecentSearch } from '@/data/travelMockData';

export default function RecentSearchesPage() {
  const router = useRouter();
  const [searches, setSearches] = useState<RecentSearch[]>(mockRecentSearches);

  const handleSearch = (search: RecentSearch) => {
    const path = search.type === 'flight'
      ? '/travel/flights'
      : search.type === 'hotel'
      ? '/travel/hotels'
      : '/travel/cars';
    router.push(path);
  };

  const handleSave = (search: RecentSearch) => {
    // In a real app, this would save to local storage or backend
    alert(`Saved: ${search.title}`);
  };

  const handleClearAll = () => {
    setSearches([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-sky-950 to-gray-900">
      <Header />

      {/* Hero Section */}
      <section className="pt-24 pb-8 md:pt-32 md:pb-12 px-4 md:px-6">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/travel/my-trips"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-sky-400 text-sm mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Trips
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-3 rounded-xl">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1
                    className="text-3xl md:text-4xl font-extrabold text-white"
                    style={{ fontFamily: 'var(--font-headline)' }}
                  >
                    Recent Searches
                  </h1>
                  <p className="text-gray-400">Your search history from the past 30 days</p>
                </div>
              </div>

              {searches.length > 0 && (
                <motion.button
                  onClick={handleClearAll}
                  className="hidden sm:flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Searches List */}
      <section className="px-4 md:px-6 py-8">
        <div className="mx-auto max-w-5xl">
          {searches.length > 0 ? (
            <>
              <p className="text-gray-400 mb-6">{searches.length} recent searches</p>
              <div className="space-y-3">
                {searches.map((search, index) => (
                  <motion.div
                    key={search.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <RecentSearchCard
                      search={search}
                      onSearch={handleSearch}
                      onSave={handleSave}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Mobile Clear All */}
              <div className="mt-6 sm:hidden">
                <motion.button
                  onClick={handleClearAll}
                  className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-red-400 py-3 border border-gray-700 rounded-xl"
                  whileHover={{ scale: 1.02 }}
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All History
                </motion.button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700">
              <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-white font-semibold text-xl mb-2">No recent searches</h3>
              <p className="text-gray-400 mb-4">
                Your search history will appear here for quick access.
              </p>
              <Link href="/travel/flights">
                <motion.button
                  className="bg-gradient-to-r from-sky-600 to-cyan-600 text-white px-6 py-3 rounded-full font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Searching
                </motion.button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Info */}
      <section className="px-4 md:px-6 py-8 bg-gradient-to-r from-sky-900/20 to-cyan-900/20">
        <div className="mx-auto max-w-4xl">
          <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
            <h3 className="text-white font-semibold mb-2">About Recent Searches</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-sky-400 mt-0.5">•</span>
                Recent searches are stored locally on your device
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-400 mt-0.5">•</span>
                History is automatically cleared after 30 days
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-400 mt-0.5">•</span>
                Save searches you want to keep track of for longer
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Back Link */}
      <section className="px-4 md:px-6 py-12">
        <div className="mx-auto max-w-4xl text-center">
          <Link
            href="/travel/my-trips"
            className="text-gray-400 hover:text-sky-400 transition-colors text-sm font-semibold"
          >
            ← Back to My Trips
          </Link>
        </div>
      </section>
    </div>
  );
}
