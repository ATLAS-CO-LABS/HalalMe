'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Tag, Clock } from 'lucide-react';
import type { TravelDeal } from '@/data/travelMockData';

interface DealCardProps {
  deal: TravelDeal;
}

export default function DealCard({ deal }: DealCardProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <motion.div
      className="group bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-sky-500 transition-all"
      whileHover={{ y: -8 }}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
          style={{ backgroundImage: `url(${deal.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/30 to-transparent" />

        {/* Discount Badge */}
        <div className="absolute top-4 left-4 bg-gradient-to-r from-sky-600 to-cyan-600 text-white px-3 py-1 rounded-full text-sm font-bold">
          {deal.discountPercentage}% OFF
        </div>

        {/* Tags */}
        {deal.tags.length > 0 && (
          <div className="absolute top-4 right-4 flex flex-wrap gap-2 justify-end">
            {deal.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="bg-gray-900/80 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Featured Badge */}
        {deal.isFeatured && (
          <div className="absolute bottom-4 left-4 bg-amber-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <Tag className="w-3 h-3" />
            Featured Deal
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-headline)' }}>
            {deal.title}
          </h3>
          <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded capitalize">
            {deal.type}
          </span>
        </div>

        <p className="text-sky-400 text-sm mb-2">{deal.destination}</p>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{deal.description}</p>

        {/* Price */}
        <div className="flex items-end gap-3 mb-4">
          <span className="text-gray-500 line-through text-lg">
            £{deal.originalPrice}
          </span>
          <span className="text-3xl font-bold text-white">
            £{deal.discountedPrice}
          </span>
          <span className="text-gray-400 text-sm">per person</span>
        </div>

        {/* Valid Until */}
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
          <Clock className="w-4 h-4" />
          <span>Valid until {formatDate(deal.validUntil)}</span>
        </div>

        {/* CTA */}
        <motion.a
          href={deal.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-cyan-600 text-white py-3 rounded-xl font-semibold"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          View Deal
          <ExternalLink className="w-4 h-4" />
        </motion.a>

        <p className="text-gray-600 text-xs text-center mt-2">
          via {deal.provider}
        </p>
      </div>
    </motion.div>
  );
}
