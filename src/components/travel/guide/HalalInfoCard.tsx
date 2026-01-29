'use client';

import { motion } from 'framer-motion';
import { Check, X, MapPin, Utensils, Star } from 'lucide-react';
import type { CityGuide } from '@/data/cityGuides';

interface HalalInfoCardProps {
  halalInfo: CityGuide['halalInfo'];
  mosques: CityGuide['mosques'];
  restaurants: CityGuide['halalRestaurants'];
}

export default function HalalInfoCard({ halalInfo, mosques, restaurants }: HalalInfoCardProps) {
  return (
    <div className="space-y-6">
      {/* Halal Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
      >
        <h3
          className="text-xl font-bold text-white mb-4 flex items-center gap-2"
          style={{ fontFamily: 'var(--font-headline)' }}
        >
          🕌 Halal-Friendly Info
        </h3>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-700/50 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-sky-400">{halalInfo.mosquesCount}+</p>
            <p className="text-gray-400 text-sm">Mosques</p>
          </div>
          <div className="bg-gray-700/50 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-sky-400">{halalInfo.muslimPopulationPercent}%</p>
            <p className="text-gray-400 text-sm">Muslim Population</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {halalInfo.prayerFacilitiesAvailable ? (
              <Check className="w-5 h-5 text-emerald-400" />
            ) : (
              <X className="w-5 h-5 text-red-400" />
            )}
            <span className="text-gray-300">Prayer facilities widely available</span>
          </div>
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-emerald-400" />
            <span className="text-gray-300">Halal restaurants: {halalInfo.halalRestaurantsCount}</span>
          </div>
        </div>
      </motion.div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-gradient-to-r from-sky-900/30 to-cyan-900/30 rounded-2xl p-6 border border-sky-500/20"
      >
        <h3
          className="text-lg font-bold text-white mb-4"
          style={{ fontFamily: 'var(--font-headline)' }}
        >
          Tips for Muslim Travelers
        </h3>
        <ul className="space-y-2">
          {halalInfo.tips.map((tip, index) => (
            <li key={index} className="flex items-start gap-2 text-gray-300 text-sm">
              <span className="text-sky-400 mt-0.5">•</span>
              {tip}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Top Mosques */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
      >
        <h3
          className="text-lg font-bold text-white mb-4 flex items-center gap-2"
          style={{ fontFamily: 'var(--font-headline)' }}
        >
          <MapPin className="w-5 h-5 text-sky-400" />
          Top Mosques
        </h3>
        <div className="space-y-4">
          {mosques.slice(0, 4).map((mosque, index) => (
            <div key={index} className="border-b border-gray-700 last:border-0 pb-3 last:pb-0">
              <h4 className="text-white font-medium">{mosque.name}</h4>
              <p className="text-gray-400 text-sm">{mosque.description}</p>
              <p className="text-gray-500 text-xs mt-1">{mosque.address}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Halal Restaurants */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
      >
        <h3
          className="text-lg font-bold text-white mb-4 flex items-center gap-2"
          style={{ fontFamily: 'var(--font-headline)' }}
        >
          <Utensils className="w-5 h-5 text-sky-400" />
          Halal Restaurants
        </h3>
        <div className="space-y-3">
          {restaurants.slice(0, 4).map((restaurant, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-700/50 rounded-xl p-3"
            >
              <div>
                <h4 className="text-white font-medium">{restaurant.name}</h4>
                <p className="text-gray-400 text-sm">{restaurant.cuisine}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-white font-medium">{restaurant.rating}</span>
                </div>
                <p className="text-gray-400 text-sm">{restaurant.priceRange}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
