'use client';

import { use } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  Globe,
  DollarSign,
  Plane,
  Building2,
  Sparkles,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import { HalalInfoCard } from '@/components/travel/guide';
import { getCityGuideBySlug, cityGuides } from '@/data/cityGuides';

interface CityPageProps {
  params: Promise<{ slug: string }>;
}

export default function CityGuidePage({ params }: CityPageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const city = getCityGuideBySlug(slug);

  if (!city) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-sky-950 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">City not found</h1>
          <Link href="/travel/guide/cities" className="text-sky-400 hover:text-sky-300">
            ← Back to Cities
          </Link>
        </div>
      </div>
    );
  }

  // Get related cities (excluding current)
  const relatedCities = cityGuides.filter((c) => c.id !== city.id).slice(0, 2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-sky-950 to-gray-900">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px]">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${city.heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-gray-900/30" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-end px-4 md:px-6 pb-8">
          <div className="mx-auto max-w-5xl w-full">
            <Link
              href="/travel/guide/cities"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Cities
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-sky-400" />
                <span className="text-sky-400 font-semibold">{city.country}</span>
              </div>

              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4"
                style={{ fontFamily: 'var(--font-headline)' }}
              >
                {city.name}
              </h1>

              <p className="text-xl text-gray-200 max-w-2xl mb-4">{city.description}</p>

              {/* Halal Score */}
              <div className="flex items-center gap-2 bg-gray-900/80 backdrop-blur-sm rounded-lg px-4 py-2 inline-flex">
                <span className="text-white font-medium">Halal Score:</span>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < city.halalScore ? 'text-sky-400 fill-sky-400' : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Info */}
      <section className="px-4 md:px-6 py-8 -mt-4 relative z-20">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Clock, label: 'Best Time', value: city.bestTimeToVisit.split(' ')[0] + '...' },
              { icon: Globe, label: 'Language', value: city.language },
              { icon: DollarSign, label: 'Currency', value: city.currency.split(' ')[0] },
              { icon: Clock, label: 'Timezone', value: city.timezone },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-gray-800 rounded-xl p-4 border border-gray-700"
                >
                  <Icon className="w-5 h-5 text-sky-400 mb-2" />
                  <p className="text-gray-400 text-sm">{item.label}</p>
                  <p className="text-white font-semibold truncate">{item.value}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 md:px-6 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Overview */}
            <div className="lg:col-span-2 space-y-8">
              {/* Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
              >
                <h2
                  className="text-2xl font-bold text-white mb-4"
                  style={{ fontFamily: 'var(--font-headline)' }}
                >
                  Overview
                </h2>
                <p className="text-gray-300 leading-relaxed">{city.overview}</p>
              </motion.div>

              {/* Best Time to Visit */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
              >
                <h2
                  className="text-xl font-bold text-white mb-4"
                  style={{ fontFamily: 'var(--font-headline)' }}
                >
                  Best Time to Visit
                </h2>
                <p className="text-gray-300">{city.bestTimeToVisit}</p>
              </motion.div>

              {/* Attractions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
              >
                <h2
                  className="text-xl font-bold text-white mb-4"
                  style={{ fontFamily: 'var(--font-headline)' }}
                >
                  Top Attractions
                </h2>
                <div className="space-y-3">
                  {city.attractions.map((attraction) => (
                    <div
                      key={attraction.id}
                      className="flex items-start gap-3 bg-gray-700/50 rounded-xl p-3"
                    >
                      <span className="text-xl">
                        {attraction.category === 'mosque'
                          ? '🕌'
                          : attraction.category === 'restaurant'
                          ? '🍽️'
                          : attraction.category === 'shopping'
                          ? '🛍️'
                          : attraction.category === 'nature'
                          ? '🌿'
                          : '🏛️'}
                      </span>
                      <div>
                        <h3 className="text-white font-medium">{attraction.name}</h3>
                        <p className="text-gray-400 text-sm">{attraction.description}</p>
                        {attraction.isHalalFriendly && (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-400 mt-1">
                            <Sparkles className="w-3 h-3" />
                            Halal-friendly
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Travel Tips */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
              >
                <h2
                  className="text-xl font-bold text-white mb-4"
                  style={{ fontFamily: 'var(--font-headline)' }}
                >
                  Local Travel Tips
                </h2>
                <ul className="space-y-2">
                  {city.travelTips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-300">
                      <span className="text-sky-400 mt-0.5">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Right Column - Halal Info */}
            <div className="lg:col-span-1">
              <HalalInfoCard
                halalInfo={city.halalInfo}
                mosques={city.mosques}
                restaurants={city.halalRestaurants}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Book Your Trip CTA */}
      <section className="px-4 md:px-6 py-12 bg-gradient-to-r from-sky-900/30 to-cyan-900/30">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gray-800 rounded-2xl p-6 md:p-8 border border-gray-700"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h2
                  className="text-2xl font-bold text-white mb-2"
                  style={{ fontFamily: 'var(--font-headline)' }}
                >
                  Ready to visit {city.name}?
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-gray-400">
                  <span className="flex items-center gap-2">
                    <Plane className="w-4 h-4 text-sky-400" />
                    Flights from £{city.flightPriceFrom}
                  </span>
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-sky-400" />
                    Hotels from £{city.hotelPriceFrom}/night
                  </span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  onClick={() => router.push(`/travel/flights?destination=${city.name}`)}
                  className="bg-gradient-to-r from-sky-600 to-cyan-600 text-white px-6 py-3 rounded-full font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Search Flights
                </motion.button>
                <motion.button
                  onClick={() => router.push(`/travel/hotels?location=${city.name}`)}
                  className="bg-gray-700 text-white px-6 py-3 rounded-full font-semibold border border-gray-600 hover:border-sky-500"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Find Hotels
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Related Cities */}
      {relatedCities.length > 0 && (
        <section className="px-4 md:px-6 py-12">
          <div className="mx-auto max-w-5xl">
            <h2
              className="text-2xl font-bold text-white mb-6"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              Explore More Cities
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {relatedCities.map((relatedCity, index) => (
                <motion.div
                  key={relatedCity.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Link href={`/travel/guide/cities/${relatedCity.slug}`}>
                    <div className="group relative h-48 rounded-2xl overflow-hidden cursor-pointer">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                        style={{ backgroundImage: `url(${relatedCity.heroImage})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-4 h-4 text-sky-400" />
                          <span className="text-sky-400 text-sm">{relatedCity.country}</span>
                        </div>
                        <h3 className="text-xl font-bold text-white">{relatedCity.name}</h3>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back Link */}
      <section className="px-4 md:px-6 pb-16">
        <div className="mx-auto max-w-4xl text-center">
          <Link
            href="/travel/guide/cities"
            className="text-gray-400 hover:text-sky-400 transition-colors text-sm font-semibold"
          >
            ← Back to All Cities
          </Link>
        </div>
      </section>
    </div>
  );
}
