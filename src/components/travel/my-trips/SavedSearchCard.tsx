'use client';

import { motion } from 'framer-motion';
import { Plane, Building2, Car, TrendingDown, TrendingUp, Minus, Trash2, Search } from 'lucide-react';
import type { SavedSearch } from '@/data/travelMockData';

interface SavedSearchCardProps {
  search: SavedSearch;
  onDelete?: (id: string) => void;
  onSearch?: (search: SavedSearch) => void;
}

const typeIcons = {
  flight: Plane,
  hotel: Building2,
  car: Car,
};

const typeColors = {
  flight: 'from-sky-600 to-cyan-600',
  hotel: 'from-cyan-600 to-teal-600',
  car: 'from-teal-600 to-emerald-600',
};

export default function SavedSearchCard({ search, onDelete, onSearch }: SavedSearchCardProps) {
  const Icon = typeIcons[search.type];
  const color = typeColors[search.type];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <motion.div
      className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-sky-500 transition-all"
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`bg-gradient-to-br ${color} rounded-lg p-2 flex-shrink-0`}>
            <Icon className="w-5 h-5 text-white" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold truncate">{search.title}</h3>
            <p className="text-gray-400 text-sm">{search.details}</p>
            <p className="text-gray-500 text-xs mt-1">Saved {formatDate(search.savedAt)}</p>
          </div>
        </div>

        {/* Price Info */}
        <div className="text-right flex-shrink-0">
          <div className="flex items-center gap-1 justify-end">
            {search.priceChange === 'down' && (
              <TrendingDown className="w-4 h-4 text-emerald-400" />
            )}
            {search.priceChange === 'up' && (
              <TrendingUp className="w-4 h-4 text-red-400" />
            )}
            {search.priceChange === 'same' && (
              <Minus className="w-4 h-4 text-gray-400" />
            )}
            <span
              className={`font-bold ${
                search.priceChange === 'down'
                  ? 'text-emerald-400'
                  : search.priceChange === 'up'
                  ? 'text-red-400'
                  : 'text-white'
              }`}
            >
              £{search.currentPrice}
            </span>
          </div>
          {search.priceChange !== 'same' && (
            <p
              className={`text-xs ${
                search.priceChange === 'down' ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {search.priceChange === 'down' ? '-' : '+'}£{search.priceChangeAmount}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-700">
        <motion.button
          onClick={() => onSearch?.(search)}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-cyan-600 text-white py-2 rounded-lg text-sm font-medium"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Search className="w-4 h-4" />
          Search Again
        </motion.button>
        <motion.button
          onClick={() => onDelete?.(search.id)}
          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Trash2 className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}
