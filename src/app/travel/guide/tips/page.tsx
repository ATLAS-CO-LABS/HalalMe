'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Lightbulb, ArrowLeft, Filter } from 'lucide-react';
import Header from '@/components/layout/Header';
import { TravelTipCard } from '@/components/travel/guide';
import { travelTips, type TravelTip } from '@/data/cityGuides';

const categories: { id: TravelTip['category'] | 'all'; label: string }[] = [
  { id: 'all', label: 'All Tips' },
  { id: 'halal', label: 'Halal' },
  { id: 'prayer', label: 'Prayer' },
  { id: 'culture', label: 'Culture' },
  { id: 'safety', label: 'Safety' },
  { id: 'budget', label: 'Budget' },
  { id: 'packing', label: 'Packing' },
];

export default function TravelTipsPage() {
  const [selectedCategory, setSelectedCategory] = useState<TravelTip['category'] | 'all'>('all');

  const filteredTips =
    selectedCategory === 'all'
      ? travelTips
      : travelTips.filter((tip) => tip.category === selectedCategory);

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
                <Lightbulb className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1
                  className="text-3xl md:text-4xl font-extrabold text-white"
                  style={{ fontFamily: 'var(--font-headline)' }}
                >
                  Travel Tips
                </h1>
                <p className="text-gray-400">Essential advice for Muslim travelers</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="px-4 md:px-6 pb-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? 'bg-sky-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tips Grid */}
      <section className="px-4 md:px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-gray-400 mb-6">{filteredTips.length} tips found</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTips.map((tip, index) => (
              <TravelTipCard key={tip.id} tip={tip} index={index} />
            ))}
          </div>

          {filteredTips.length === 0 && (
            <div className="text-center py-12">
              <Lightbulb className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-white font-semibold text-xl mb-2">No tips found</h3>
              <p className="text-gray-400">Try selecting a different category</p>
            </div>
          )}
        </div>
      </section>

      {/* Key Tips Highlight */}
      <section className="px-4 md:px-6 py-12 bg-gradient-to-r from-sky-900/20 to-cyan-900/20">
        <div className="mx-auto max-w-5xl">
          <h2
            className="text-2xl font-bold text-white mb-6 text-center"
            style={{ fontFamily: 'var(--font-headline)' }}
          >
            Essential Reminders
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                emoji: '🕌',
                title: 'Find Prayer Spaces',
                desc: 'Most airports and malls have prayer rooms. Download Muslim Pro for prayer times.',
              },
              {
                emoji: '🍖',
                title: 'Verify Halal',
                desc: 'Look for halal certification or ask restaurant staff about ingredients.',
              },
              {
                emoji: '📱',
                title: 'Offline Apps',
                desc: 'Download Qibla finder and translation apps that work without internet.',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gray-800 rounded-xl p-5 border border-gray-700 text-center"
              >
                <div className="text-4xl mb-3">{item.emoji}</div>
                <h3 className="text-white font-bold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Share Your Tips */}
      <section className="px-4 md:px-6 py-12">
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
              Have a Travel Tip?
            </h2>
            <p className="text-gray-400 mb-6">
              Share your experiences and help fellow Muslim travelers explore the world with confidence.
            </p>
            <Link href="/hub">
              <motion.button
                className="bg-gradient-to-r from-sky-600 to-cyan-600 text-white px-8 py-3 rounded-full font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Share on HalalMe Hub
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Back Link */}
      <section className="px-4 md:px-6 pb-16">
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
