'use client';

import { motion } from 'framer-motion';
import { Plane, Building2, Car } from 'lucide-react';

interface SearchTabsProps {
  activeTab: 'flights' | 'hotels' | 'cars';
  onTabChange: (tab: 'flights' | 'hotels' | 'cars') => void;
}

export default function SearchTabs({ activeTab, onTabChange }: SearchTabsProps) {
  const tabs = [
    { id: 'flights' as const, label: 'Flights', icon: Plane },
    { id: 'hotels' as const, label: 'Hotels', icon: Building2 },
    { id: 'cars' as const, label: 'Cars', icon: Car },
  ];

  return (
    <div className="flex gap-2 p-1 bg-gray-800/50 rounded-xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <motion.button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-colors ${
              isActive
                ? 'text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-gradient-to-r from-sky-600 to-cyan-600 rounded-lg"
                initial={false}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Icon className="w-4 h-4" />
              {tab.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
