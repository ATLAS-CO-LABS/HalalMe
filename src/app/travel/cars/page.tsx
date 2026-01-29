'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Car, Sparkles, Shield, Tag, Clock } from 'lucide-react';
import Header from '@/components/layout/Header';
import { SearchTabs, FlightSearchForm, HotelSearchForm, CarSearchForm } from '@/components/travel/search';

export default function CarsPage() {
  const [activeTab, setActiveTab] = useState<'flights' | 'hotels' | 'cars'>('cars');

  const features = [
    { icon: Tag, text: "Best price guarantee" },
    { icon: Shield, text: "Full insurance options" },
    { icon: Clock, text: "Free cancellation" },
  ];

  const carCategories = [
    { name: "Economy", desc: "Fuel efficient & budget-friendly", price: "From £15/day", image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400" },
    { name: "SUV", desc: "Perfect for families", price: "From £35/day", image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400" },
    { name: "Luxury", desc: "Travel in style", price: "From £80/day", image: "https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=400" },
    { name: "Van", desc: "Extra space for groups", price: "From £45/day", image: "https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=400" },
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
                Compare car rentals worldwide
              </span>
            </motion.div>

            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              Rent a{' '}
              <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Car
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

      {/* Car Categories */}
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
              Browse by Car Type
            </h2>
            <p className="text-gray-400">Find the perfect vehicle for your trip</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {carCategories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <motion.div
                  className="group bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-sky-500 transition-all cursor-pointer"
                  whileHover={{ y: -8 }}
                >
                  <div
                    className="h-36 bg-cover bg-center"
                    style={{ backgroundImage: `url(${category.image})` }}
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-white mb-1">{category.name}</h3>
                    <p className="text-gray-400 text-sm mb-2">{category.desc}</p>
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-sky-400" />
                      <span className="text-sky-400 font-semibold">{category.price}</span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
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
              Why Rent With Us?
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: "🔍", title: "Compare Providers", desc: "Search Hertz, Enterprise, Avis, and more in one place" },
              { icon: "💰", title: "No Hidden Fees", desc: "See the total price upfront with all fees included" },
              { icon: "✅", title: "Free Cancellation", desc: "Plans change - cancel for free up to 48 hours before" },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700 text-center"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="px-4 md:px-6 py-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-gray-500 text-sm">
            Prices shown are estimates and may vary based on location, dates, and availability.
            All bookings are completed through our rental partners.
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
