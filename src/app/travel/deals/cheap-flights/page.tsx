'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plane, ArrowLeft, MapPin, TrendingDown, Filter } from 'lucide-react';
import Header from '@/components/layout/Header';
import { DealCard } from '@/components/travel/deals';
import { mockDeals, popularDestinations } from '@/data/travelMockData';

export default function CheapFlightsPage() {
  const [selectedRegion, setSelectedRegion] = useState('all');

  const regions = [
    { id: 'all', label: 'All Destinations' },
    { id: 'middle-east', label: 'Middle East' },
    { id: 'asia', label: 'Asia' },
    { id: 'europe', label: 'Europe' },
    { id: 'africa', label: 'Africa' },
  ];

  const flightDeals = mockDeals.filter((deal) => deal.type === 'flight' || deal.type === 'package');

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
              <div className="bg-gradient-to-r from-sky-600 to-cyan-600 p-3 rounded-xl">
                <Plane className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1
                  className="text-3xl md:text-4xl font-extrabold text-white"
                  style={{ fontFamily: 'var(--font-headline)' }}
                >
                  Cheap Flights
                </h1>
                <p className="text-gray-400">Find the best flight deals from your location</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Routes */}
      <section className="px-4 md:px-6 pb-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-sky-400" />
            Popular Routes from London
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {popularDestinations.slice(0, 4).map((dest, index) => (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link href={`/travel/flights?destination=${dest.city}`}>
                  <motion.div
                    className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-sky-500 transition-all cursor-pointer"
                    whileHover={{ y: -4 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-sky-400" />
                      <span className="text-white font-medium">{dest.city}</span>
                    </div>
                    <p className="text-sky-400 font-bold">From £{dest.flightPriceFrom}</p>
                    <p className="text-gray-500 text-xs">Return flight</p>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Region Filter */}
      <section className="px-4 md:px-6 pb-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            {regions.map((region) => (
              <button
                key={region.id}
                onClick={() => setSelectedRegion(region.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedRegion === region.id
                    ? 'bg-sky-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {region.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Flight Deals */}
      <section className="px-4 md:px-6 py-8 bg-gradient-to-r from-sky-900/20 to-cyan-900/20">
        <div className="mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flightDeals.map((deal, index) => (
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

          {flightDeals.length === 0 && (
            <div className="text-center py-12">
              <Plane className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-white font-semibold text-xl mb-2">No deals found</h3>
              <p className="text-gray-400">Check back soon for new flight deals!</p>
            </div>
          )}
        </div>
      </section>

      {/* Tips Section */}
      <section className="px-4 md:px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <h2
            className="text-xl md:text-2xl font-bold text-white mb-6"
            style={{ fontFamily: 'var(--font-headline)' }}
          >
            Tips to Find Cheap Flights
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: "Be flexible with dates", desc: "Flying mid-week is often cheaper than weekends" },
              { title: "Book in advance", desc: "Best prices are typically found 6-8 weeks before departure" },
              { title: "Set price alerts", desc: "Get notified when prices drop on your preferred routes" },
              { title: "Consider nearby airports", desc: "Alternative airports may offer better deals" },
            ].map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gray-800 rounded-xl p-4 border border-gray-700"
              >
                <h3 className="text-white font-semibold mb-1">{tip.title}</h3>
                <p className="text-gray-400 text-sm">{tip.desc}</p>
              </motion.div>
            ))}
          </div>
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
