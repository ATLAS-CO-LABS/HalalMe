'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { MapPin, Star, Plane, Building2 } from 'lucide-react';
import type { CityGuide } from '@/data/cityGuides';

interface CityCardProps {
  city: CityGuide;
  variant?: 'default' | 'featured';
}

export default function CityCard({ city, variant = 'default' }: CityCardProps) {
  const isFeatured = variant === 'featured';

  return (
    <Link href={`/travel/guide/cities/${city.slug}`}>
      <motion.div
        className={`group relative overflow-hidden rounded-2xl cursor-pointer ${
          isFeatured ? 'h-80' : 'h-64'
        }`}
        whileHover={{ scale: 1.02 }}
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
          style={{ backgroundImage: `url(${city.heroImage})` }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />

        {/* Halal Score Badge */}
        <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-1.5">
          <span className="text-white text-xs font-medium">Halal Score</span>
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${
                i < city.halalScore ? 'text-sky-400 fill-sky-400' : 'text-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-sky-400" />
            <span className="text-sky-400 text-sm font-semibold">{city.country}</span>
          </div>

          <h3
            className={`font-bold text-white mb-2 ${isFeatured ? 'text-3xl' : 'text-2xl'}`}
            style={{ fontFamily: 'var(--font-headline)' }}
          >
            {city.name}
          </h3>

          <p className="text-gray-300 text-sm mb-3 line-clamp-2">{city.description}</p>

          {/* Quick Info */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-gray-400 flex items-center gap-1">
              <Plane className="w-4 h-4 text-sky-400" />
              From £{city.flightPriceFrom}
            </span>
            <span className="text-gray-400 flex items-center gap-1">
              <Building2 className="w-4 h-4 text-sky-400" />
              From £{city.hotelPriceFrom}/night
            </span>
            <span className="text-gray-400">
              🕌 {city.halalInfo.mosquesCount}+ mosques
            </span>
          </div>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-sky-600/0 group-hover:bg-sky-600/10 transition-colors duration-300" />
      </motion.div>
    </Link>
  );
}
