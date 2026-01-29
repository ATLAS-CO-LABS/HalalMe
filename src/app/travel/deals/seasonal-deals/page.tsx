'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calendar, ArrowLeft, Moon, Sun, Snowflake, Sparkles } from 'lucide-react';
import Header from '@/components/layout/Header';
import { DealCard, SeasonalBanner } from '@/components/travel/deals';
import { mockDeals } from '@/data/travelMockData';

export default function SeasonalDealsPage() {
  const [selectedSeason, setSelectedSeason] = useState('all');

  const seasons = [
    { id: 'all', label: 'All Seasons', icon: Calendar },
    { id: 'ramadan', label: 'Ramadan & Umrah', icon: Moon },
    { id: 'summer', label: 'Summer', icon: Sun },
    { id: 'winter', label: 'Winter', icon: Snowflake },
  ];

  const seasonalContent = {
    ramadan: {
      title: 'Ramadan & Umrah Packages',
      description: 'Special deals for the holy month and pilgrimage',
      color: 'from-emerald-600 to-teal-600',
      deals: mockDeals.filter((d) => d.tags.some((t) => t.toLowerCase().includes('halal'))),
    },
    summer: {
      title: 'Summer Escapes',
      description: 'Beach destinations and family-friendly holidays',
      color: 'from-amber-500 to-orange-500',
      deals: mockDeals.filter((d) => d.destination.includes('Dubai') || d.destination.includes('Malaysia')),
    },
    winter: {
      title: 'Winter Getaways',
      description: 'Warm destinations to escape the cold',
      color: 'from-sky-500 to-indigo-600',
      deals: mockDeals.filter((d) => d.destination.includes('Istanbul') || d.destination.includes('Morocco')),
    },
  };

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
              <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-3 rounded-xl">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1
                  className="text-3xl md:text-4xl font-extrabold text-white"
                  style={{ fontFamily: 'var(--font-headline)' }}
                >
                  Seasonal Deals
                </h1>
                <p className="text-gray-400">Special offers for every time of year</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Season Tabs */}
      <section className="px-4 md:px-6 pb-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {seasons.map((season) => {
              const Icon = season.icon;
              return (
                <button
                  key={season.id}
                  onClick={() => setSelectedSeason(season.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedSeason === season.id
                      ? 'bg-sky-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {season.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* All Seasons View */}
      {selectedSeason === 'all' && (
        <>
          {/* Ramadan Section */}
          <section className="px-4 md:px-6 py-8">
            <div className="mx-auto max-w-6xl">
              <SeasonalBanner
                season="ramadan"
                title="Ramadan & Umrah Packages"
                subtitle="Special deals for spiritual journeys during the holy month"
                href="/travel/deals/seasonal-deals"
              />
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {seasonalContent.ramadan.deals.slice(0, 3).map((deal, index) => (
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

          {/* Summer Section */}
          <section className="px-4 md:px-6 py-8 bg-gradient-to-r from-sky-900/20 to-cyan-900/20">
            <div className="mx-auto max-w-6xl">
              <SeasonalBanner
                season="summer"
                title="Summer Escapes"
                subtitle="Beach destinations and family holidays with up to 40% off"
                href="/travel/deals/seasonal-deals"
              />
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {seasonalContent.summer.deals.slice(0, 3).map((deal, index) => (
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

          {/* Winter Section */}
          <section className="px-4 md:px-6 py-8">
            <div className="mx-auto max-w-6xl">
              <SeasonalBanner
                season="winter"
                title="Winter Getaways"
                subtitle="Escape the cold with warm destination deals"
                href="/travel/deals/seasonal-deals"
              />
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {seasonalContent.winter.deals.slice(0, 3).map((deal, index) => (
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
        </>
      )}

      {/* Individual Season View */}
      {selectedSeason !== 'all' && seasonalContent[selectedSeason as keyof typeof seasonalContent] && (
        <section className="px-4 md:px-6 py-8">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h2
                className={`text-2xl md:text-3xl font-bold bg-gradient-to-r ${seasonalContent[selectedSeason as keyof typeof seasonalContent].color} bg-clip-text text-transparent mb-2`}
                style={{ fontFamily: 'var(--font-headline)' }}
              >
                {seasonalContent[selectedSeason as keyof typeof seasonalContent].title}
              </h2>
              <p className="text-gray-400">
                {seasonalContent[selectedSeason as keyof typeof seasonalContent].description}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {seasonalContent[selectedSeason as keyof typeof seasonalContent].deals.map((deal, index) => (
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

            {seasonalContent[selectedSeason as keyof typeof seasonalContent].deals.length === 0 && (
              <div className="text-center py-12">
                <Sparkles className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-white font-semibold text-xl mb-2">Coming Soon</h3>
                <p className="text-gray-400">New deals for this season will be available soon!</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Eid Reminder */}
      <section className="px-4 md:px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <SeasonalBanner
            season="eid"
            title="Plan Ahead for Eid"
            subtitle="Book early for the best Eid holiday deals"
            href="/travel/deals"
          />
        </div>
      </section>

      {/* Back Link */}
      <section className="px-4 md:px-6 pb-16">
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
