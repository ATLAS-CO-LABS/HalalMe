'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plane, Sparkles, Tag, Clock, Shield } from 'lucide-react';
import Header from '@/components/layout/Header';
import { SearchTabs, FlightSearchForm, HotelSearchForm, CarSearchForm } from '@/components/travel/search';
import { popularDestinations } from '@/data/travelMockData';

export default function FlightsPage() {
  const [activeTab, setActiveTab] = useState<'flights' | 'hotels' | 'cars'>('flights');

  const features = [
    { icon: Tag, text: "Compare 100s of travel sites" },
    { icon: Clock, text: "No hidden fees" },
    { icon: Shield, text: "Free cancellation options" },
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
                Compare prices from 100+ airlines
              </span>
            </motion.div>

            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              Search{' '}
              <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Cheap Flights
              </span>
            </h1>

            <div className="flex flex-wrap justify-center gap-6 text-gray-400 text-sm mb-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-sky-400" />
                    <span>{feature.text}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search Section */}
      <section className="px-4 md:px-6 pb-16">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gray-800/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-gray-700"
          >
            {/* Search Tabs */}
            <div className="flex justify-center mb-8">
              <SearchTabs activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            {/* Search Form */}
            {activeTab === 'flights' && <FlightSearchForm />}
            {activeTab === 'hotels' && <HotelSearchForm />}
            {activeTab === 'cars' && <CarSearchForm />}
          </motion.div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="px-4 md:px-6 py-16 bg-gradient-to-r from-sky-900/20 to-cyan-900/20">
        <div className="mx-auto max-w-6xl">
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
              Popular Flight Destinations
            </h2>
            <p className="text-gray-400">Discover great deals to top destinations</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularDestinations.slice(0, 4).map((dest, index) => (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link href={`/travel/flights/results?destination=${dest.city}`}>
                  <motion.div
                    className="group relative h-48 rounded-2xl overflow-hidden cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                      style={{ backgroundImage: `url(${dest.image})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-xl font-bold text-white mb-1">{dest.city}</h3>
                      <div className="flex items-center gap-2">
                        <Plane className="w-4 h-4 text-sky-400" />
                        <span className="text-sky-400 font-semibold">From £{dest.flightPriceFrom}</span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="px-4 md:px-6 py-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-gray-500 text-sm">
            Prices shown are the lowest available fares found by our search partners in the last 48 hours.
            Prices and availability are subject to change. Additional baggage fees may apply.
          </p>
        </div>
      </section>

      {/* Back to Travel */}
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
