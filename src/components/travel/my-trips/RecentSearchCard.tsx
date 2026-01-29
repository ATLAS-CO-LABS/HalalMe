'use client';

import { motion } from 'framer-motion';
import { Plane, Building2, Car, Search, Bookmark, Clock } from 'lucide-react';
import type { RecentSearch } from '@/data/travelMockData';

interface RecentSearchCardProps {
  search: RecentSearch;
  onSearch?: (search: RecentSearch) => void;
  onSave?: (search: RecentSearch) => void;
}

const typeIcons = {
  flight: Plane,
  hotel: Building2,
  car: Car,
};

const typeLabels = {
  flight: 'Flight',
  hotel: 'Hotel',
  car: 'Car Rental',
};

export default function RecentSearchCard({ search, onSearch, onSave }: RecentSearchCardProps) {
  const Icon = typeIcons[search.type];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  return (
    <motion.div
      className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-all"
      whileHover={{ y: -2, backgroundColor: 'rgba(31, 41, 55, 0.8)' }}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Main Content */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="bg-gray-700 rounded-lg p-2 flex-shrink-0">
            <Icon className="w-5 h-5 text-sky-400" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-medium truncate">{search.title}</h3>
              <span className="text-gray-500 text-xs bg-gray-700 px-2 py-0.5 rounded">
                {typeLabels[search.type]}
              </span>
            </div>
            <p className="text-gray-400 text-sm truncate">{search.details}</p>
          </div>
        </div>

        {/* Price & Time */}
        <div className="text-right flex-shrink-0">
          <p className="text-white font-bold">From £{search.lowestPrice}</p>
          <div className="flex items-center gap-1 text-gray-500 text-xs justify-end">
            <Clock className="w-3 h-3" />
            {formatDate(search.searchedAt)}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-700">
        <span className="text-gray-400 text-sm">
          {search.resultsCount} results found
        </span>

        <div className="flex-1" />

        {/* Actions */}
        <motion.button
          onClick={() => onSave?.(search)}
          className="flex items-center gap-1 text-gray-400 hover:text-sky-400 text-sm transition-colors"
          whileHover={{ scale: 1.05 }}
        >
          <Bookmark className="w-4 h-4" />
          Save
        </motion.button>

        <motion.button
          onClick={() => onSearch?.(search)}
          className="flex items-center gap-1 bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Search className="w-4 h-4" />
          Search
        </motion.button>
      </div>
    </motion.div>
  );
}
