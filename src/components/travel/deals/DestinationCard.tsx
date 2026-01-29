'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { MapPin, Plane, Building2, Star } from 'lucide-react';
import type { PopularDestination } from '@/data/travelMockData';

interface DestinationCardProps {
  destination: PopularDestination;
  variant?: 'default' | 'large';
}

export default function DestinationCard({ destination, variant = 'default' }: DestinationCardProps) {
  const isLarge = variant === 'large';

  return (
    <Link href={`/travel/guide/cities/${destination.slug}`}>
      <motion.div
        className={`group relative overflow-hidden rounded-2xl cursor-pointer ${
          isLarge ? 'h-80' : 'h-64'
        }`}
        whileHover={{ scale: 1.02 }}
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
          style={{ backgroundImage: `url(${destination.image})` }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />

        {/* Tags */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {destination.tags.slice(0, 2).map((tag, index) => (
            <span
              key={index}
              className="bg-sky-500/80 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Halal Score */}
        <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${
                i < destination.halalScore ? 'text-sky-400 fill-sky-400' : 'text-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-sky-400" />
            <span className="text-sky-400 text-sm font-semibold">{destination.country}</span>
          </div>

          <h3
            className={`font-bold text-white mb-2 ${isLarge ? 'text-3xl' : 'text-2xl'}`}
            style={{ fontFamily: 'var(--font-headline)' }}
          >
            {destination.city}
          </h3>

          <p className="text-gray-300 text-sm mb-3 line-clamp-2">{destination.description}</p>

          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-300 flex items-center gap-1">
              <Plane className="w-4 h-4 text-sky-400" />
              From £{destination.flightPriceFrom}
            </span>
            <span className="text-gray-300 flex items-center gap-1">
              <Building2 className="w-4 h-4 text-sky-400" />
              From £{destination.hotelPriceFrom}/night
            </span>
          </div>
        </div>

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-sky-600/0 group-hover:bg-sky-600/10 transition-colors duration-300" />
      </motion.div>
    </Link>
  );
}
