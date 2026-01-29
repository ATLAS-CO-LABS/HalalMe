'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Building2, Sparkles, Star, Shield, Utensils } from 'lucide-react';
import Header from '@/components/layout/Header';
import { SearchTabs, FlightSearchForm, HotelSearchForm, CarSearchForm } from '@/components/travel/search';
import { popularDestinations } from '@/data/travelMockData';

export default function HotelsPage() {
  const [activeTab, setActiveTab] = useState<'flights' | 'hotels' | 'cars'>('hotels');

  const features = [
    { icon: Star, text: "Halal-friendly filters" },
    { icon: Utensils, text: "Prayer facilities nearby" },
    { icon: Shield, text: "Free cancellation" },
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
                Find Halal-Friendly Hotels
              </span>
            </motion.div>

            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              Search{' '}
              <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Hotels
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
              Popular Hotel Destinations
            </h2>
            <p className="text-gray-400">Find halal-friendly accommodation worldwide</p>
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
                <Link href={`/travel/hotels/results?destination=${dest.city}`}>
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
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-sky-400" />
                          <span className="text-sky-400 font-semibold">From £{dest.hotelPriceFrom}/night</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(dest.halalScore)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-sky-400 fill-sky-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Halal Features */}
      <section className="px-4 md:px-6 py-16">
        <div className="mx-auto max-w-5xl">
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
              Halal-Friendly Hotel Features
            </h2>
            <p className="text-gray-400">We help you find hotels that cater to Muslim travelers</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: "🍽️", title: "Halal Food", desc: "On-site halal dining options" },
              { icon: "🕌", title: "Near Mosque", desc: "Prayer facilities nearby" },
              { icon: "🧎", title: "Prayer Room", desc: "In-hotel prayer space" },
              { icon: "🚫", title: "Alcohol-Free", desc: "Alcohol-free minibar option" },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700 text-center"
              >
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="px-4 md:px-6 py-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-gray-500 text-sm">
            Hotel information and halal amenities are provided by our partners. We recommend confirming
            specific requirements directly with the hotel before booking.
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
