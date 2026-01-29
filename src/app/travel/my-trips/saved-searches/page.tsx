'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bookmark, ArrowLeft, Plane, Building2, Car, Filter } from 'lucide-react';
import Header from '@/components/layout/Header';
import { SavedSearchCard } from '@/components/travel/my-trips';
import { mockSavedSearches, type SavedSearch } from '@/data/travelMockData';

export default function SavedSearchesPage() {
  const router = useRouter();
  const [searches, setSearches] = useState<SavedSearch[]>(mockSavedSearches);
  const [filterType, setFilterType] = useState<'all' | 'flight' | 'hotel' | 'car'>('all');

  const filteredSearches = filterType === 'all'
    ? searches
    : searches.filter((s) => s.type === filterType);

  const handleDelete = (id: string) => {
    setSearches((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSearch = (search: SavedSearch) => {
    const path = search.type === 'flight'
      ? '/travel/flights'
      : search.type === 'hotel'
      ? '/travel/hotels'
      : '/travel/cars';
    router.push(path);
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
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-r from-sky-600 to-cyan-600 p-3 rounded-xl">
                <Bookmark className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1
                  className="text-3xl md:text-4xl font-extrabold text-white"
                  style={{ fontFamily: 'var(--font-headline)' }}
                >
                  Saved Searches
                </h1>
                <p className="text-gray-400">Quickly access your saved searches and track price changes</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filter */}
      <section className="px-4 md:px-6 pb-6">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            {[
              { id: 'all', label: 'All', icon: null },
              { id: 'flight', label: 'Flights', icon: Plane },
              { id: 'hotel', label: 'Hotels', icon: Building2 },
              { id: 'car', label: 'Cars', icon: Car },
            ].map((filter) => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.id}
                  onClick={() => setFilterType(filter.id as typeof filterType)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    filterType === filter.id
                      ? 'bg-sky-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Searches List */}
      <section className="px-4 md:px-6 py-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-gray-400 mb-6">
            {filteredSearches.length} saved search{filteredSearches.length !== 1 ? 'es' : ''}
          </p>

          {filteredSearches.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredSearches.map((search, index) => (
                <motion.div
                  key={search.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <SavedSearchCard
                    search={search}
                    onDelete={handleDelete}
                    onSearch={handleSearch}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700">
              <Bookmark className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-white font-semibold text-xl mb-2">No saved searches</h3>
              <p className="text-gray-400 mb-4">
                Save your searches to quickly access them later and track price changes.
              </p>
              <Link href="/travel/flights">
                <motion.button
                  className="bg-gradient-to-r from-sky-600 to-cyan-600 text-white px-6 py-3 rounded-full font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Search Flights
                </motion.button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Tips */}
      <section className="px-4 md:px-6 py-8 bg-gradient-to-r from-sky-900/20 to-cyan-900/20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-white font-bold mb-4">How Saved Searches Work</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { step: '1', title: 'Save', desc: 'Save any search from the results page' },
              { step: '2', title: 'Track', desc: 'We track price changes automatically' },
              { step: '3', title: 'Book', desc: 'Search again when prices drop' },
            ].map((item) => (
              <div key={item.step} className="bg-gray-800/50 rounded-xl p-4">
                <div className="w-8 h-8 bg-sky-600 rounded-full flex items-center justify-center text-white font-bold text-sm mb-2">
                  {item.step}
                </div>
                <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
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
