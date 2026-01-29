'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

interface SortOption {
  id: string;
  label: string;
}

interface SortDropdownProps {
  type: 'flights' | 'hotels' | 'cars';
  value: string;
  onChange: (value: string) => void;
}

export default function SortDropdown({ type, value, onChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const flightOptions: SortOption[] = [
    { id: 'best', label: 'Best' },
    { id: 'cheapest', label: 'Cheapest first' },
    { id: 'fastest', label: 'Fastest first' },
    { id: 'departure', label: 'Departure time' },
    { id: 'arrival', label: 'Arrival time' },
  ];

  const hotelOptions: SortOption[] = [
    { id: 'recommended', label: 'Recommended' },
    { id: 'price-low', label: 'Price: Low to High' },
    { id: 'price-high', label: 'Price: High to Low' },
    { id: 'rating', label: 'Guest Rating' },
    { id: 'stars', label: 'Star Rating' },
  ];

  const carOptions: SortOption[] = [
    { id: 'recommended', label: 'Recommended' },
    { id: 'price-low', label: 'Price: Low to High' },
    { id: 'price-high', label: 'Price: High to Low' },
    { id: 'size', label: 'Car Size' },
  ];

  const options = type === 'flights' ? flightOptions : type === 'hotels' ? hotelOptions : carOptions;
  const selectedOption = options.find((opt) => opt.id === value) || options[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white hover:border-sky-500 transition-colors"
      >
        <span className="text-gray-400 text-sm">Sort by:</span>
        <span className="font-medium">{selectedOption.label}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden"
            >
              {options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    onChange(option.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${
                    value === option.id
                      ? 'bg-sky-600/20 text-sky-400'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {option.label}
                  {value === option.id && <Check className="w-4 h-4" />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
