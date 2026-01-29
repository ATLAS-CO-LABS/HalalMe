'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X, Star } from 'lucide-react';

interface FilterSection {
  id: string;
  title: string;
  options: { id: string; label: string; count?: number }[];
  type: 'checkbox' | 'radio' | 'range';
}

interface FilterSidebarProps {
  type: 'flights' | 'hotels' | 'cars';
  onFilterChange?: (filters: Record<string, string[]>) => void;
  className?: string;
}

export default function FilterSidebar({ type, onFilterChange, className = '' }: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['stops', 'price', 'halal', 'rating']);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [priceRange, setPriceRange] = useState([0, 1000]);

  const flightFilters: FilterSection[] = [
    {
      id: 'stops',
      title: 'Stops',
      type: 'checkbox',
      options: [
        { id: 'direct', label: 'Direct', count: 12 },
        { id: '1stop', label: '1 Stop', count: 24 },
        { id: '2stops', label: '2+ Stops', count: 8 },
      ],
    },
    {
      id: 'airlines',
      title: 'Airlines',
      type: 'checkbox',
      options: [
        { id: 'emirates', label: 'Emirates', count: 8 },
        { id: 'turkish', label: 'Turkish Airlines', count: 12 },
        { id: 'ba', label: 'British Airways', count: 6 },
        { id: 'saudia', label: 'Saudia', count: 4 },
        { id: 'malaysia', label: 'Malaysia Airlines', count: 5 },
      ],
    },
    {
      id: 'departure',
      title: 'Departure Time',
      type: 'checkbox',
      options: [
        { id: 'morning', label: 'Morning (6am-12pm)', count: 15 },
        { id: 'afternoon', label: 'Afternoon (12pm-6pm)', count: 18 },
        { id: 'evening', label: 'Evening (6pm-12am)', count: 10 },
        { id: 'night', label: 'Night (12am-6am)', count: 5 },
      ],
    },
  ];

  const hotelFilters: FilterSection[] = [
    {
      id: 'halal',
      title: 'Halal Amenities',
      type: 'checkbox',
      options: [
        { id: 'halalFood', label: 'Halal Food', count: 45 },
        { id: 'prayerRoom', label: 'Prayer Room', count: 32 },
        { id: 'nearMosque', label: 'Near Mosque', count: 38 },
        { id: 'alcoholFree', label: 'Alcohol-Free Option', count: 28 },
        { id: 'separatePool', label: 'Separate Swimming', count: 15 },
      ],
    },
    {
      id: 'rating',
      title: 'Star Rating',
      type: 'checkbox',
      options: [
        { id: '5star', label: '5 Stars', count: 12 },
        { id: '4star', label: '4 Stars', count: 24 },
        { id: '3star', label: '3 Stars', count: 18 },
        { id: '2star', label: '2 Stars', count: 8 },
      ],
    },
    {
      id: 'amenities',
      title: 'Amenities',
      type: 'checkbox',
      options: [
        { id: 'wifi', label: 'Free WiFi', count: 58 },
        { id: 'pool', label: 'Swimming Pool', count: 34 },
        { id: 'gym', label: 'Fitness Center', count: 42 },
        { id: 'spa', label: 'Spa', count: 22 },
        { id: 'breakfast', label: 'Breakfast Included', count: 36 },
      ],
    },
    {
      id: 'cancellation',
      title: 'Cancellation Policy',
      type: 'checkbox',
      options: [
        { id: 'free', label: 'Free Cancellation', count: 48 },
        { id: 'partial', label: 'Partial Refund', count: 15 },
      ],
    },
  ];

  const carFilters: FilterSection[] = [
    {
      id: 'category',
      title: 'Car Type',
      type: 'checkbox',
      options: [
        { id: 'economy', label: 'Economy', count: 24 },
        { id: 'compact', label: 'Compact', count: 18 },
        { id: 'midsize', label: 'Midsize', count: 15 },
        { id: 'suv', label: 'SUV', count: 22 },
        { id: 'luxury', label: 'Luxury', count: 8 },
        { id: 'van', label: 'Van', count: 6 },
      ],
    },
    {
      id: 'transmission',
      title: 'Transmission',
      type: 'checkbox',
      options: [
        { id: 'automatic', label: 'Automatic', count: 45 },
        { id: 'manual', label: 'Manual', count: 28 },
      ],
    },
    {
      id: 'provider',
      title: 'Rental Company',
      type: 'checkbox',
      options: [
        { id: 'hertz', label: 'Hertz', count: 18 },
        { id: 'enterprise', label: 'Enterprise', count: 22 },
        { id: 'avis', label: 'Avis', count: 15 },
        { id: 'sixt', label: 'Sixt', count: 12 },
      ],
    },
    {
      id: 'features',
      title: 'Features',
      type: 'checkbox',
      options: [
        { id: 'ac', label: 'Air Conditioning', count: 65 },
        { id: 'unlimited', label: 'Unlimited Mileage', count: 48 },
        { id: 'insurance', label: 'Insurance Included', count: 42 },
      ],
    },
  ];

  const filters = type === 'flights' ? flightFilters : type === 'hotels' ? hotelFilters : carFilters;

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const toggleFilter = (sectionId: string, optionId: string) => {
    setSelectedFilters((prev) => {
      const current = prev[sectionId] || [];
      const updated = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];

      const newFilters = { ...prev, [sectionId]: updated };
      onFilterChange?.(newFilters);
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setSelectedFilters({});
    onFilterChange?.({});
  };

  const totalActiveFilters = Object.values(selectedFilters).flat().length;

  return (
    <div className={`bg-gray-800 rounded-2xl border border-gray-700 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-lg">Filters</h3>
        {totalActiveFilters > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sky-400 text-sm hover:text-sky-300 flex items-center gap-1"
          >
            Clear all
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Price Range */}
      <div className="mb-6 pb-4 border-b border-gray-700">
        <h4 className="text-white font-semibold mb-3">Price Range</h4>
        <div className="px-2">
          <input
            type="range"
            min="0"
            max="1000"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />
          <div className="flex justify-between text-gray-400 text-sm mt-2">
            <span>£{priceRange[0]}</span>
            <span>£{priceRange[1]}+</span>
          </div>
        </div>
      </div>

      {/* Filter Sections */}
      {filters.map((section) => (
        <div key={section.id} className="border-b border-gray-700 last:border-b-0">
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full flex items-center justify-between py-3 text-white font-semibold"
          >
            {section.title}
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform ${
                expandedSections.includes(section.id) ? 'rotate-180' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {expandedSections.includes(section.id) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pb-4 space-y-2">
                  {section.options.map((option) => (
                    <label
                      key={option.id}
                      className="flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedFilters[section.id]?.includes(option.id) || false}
                          onChange={() => toggleFilter(section.id, option.id)}
                          className="w-4 h-4 text-sky-500 bg-gray-700 border-gray-600 rounded focus:ring-sky-500"
                        />
                        <span className="text-gray-300 text-sm group-hover:text-white transition-colors">
                          {option.label}
                        </span>
                      </div>
                      {option.count !== undefined && (
                        <span className="text-gray-500 text-xs">{option.count}</span>
                      )}
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
