'use client';

import { motion } from 'framer-motion';
import {
  Lightbulb,
  Search,
  LayoutGrid,
  Compass,
  Cookie,
  Languages,
  Clock,
  Building2,
  Shirt,
  Moon,
  Plane,
  Shield,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { TravelTip } from '@/data/cityGuides';

interface TravelTipCardProps {
  tip: TravelTip;
  index?: number;
}

const categoryColors = {
  packing: 'from-purple-600 to-pink-600',
  safety: 'from-red-600 to-orange-600',
  halal: 'from-emerald-600 to-teal-600',
  budget: 'from-amber-600 to-yellow-600',
  culture: 'from-indigo-600 to-purple-600',
  prayer: 'from-sky-600 to-cyan-600',
};

const categoryLabels = {
  packing: 'Packing',
  safety: 'Safety',
  halal: 'Halal',
  budget: 'Budget',
  culture: 'Culture',
  prayer: 'Prayer',
};

const iconMap: Record<string, LucideIcon> = {
  Search,
  LayoutGrid,
  Compass,
  Cookie,
  Languages,
  Clock,
  Building2,
  Shirt,
  Moon,
  Plane,
  Shield,
  Users,
  Lightbulb,
};

export default function TravelTipCard({ tip, index = 0 }: TravelTipCardProps) {
  // Dynamically get the icon component
  const IconComponent = iconMap[tip.icon] || Lightbulb;
  const color = categoryColors[tip.category] || 'from-sky-600 to-cyan-600';
  const label = categoryLabels[tip.category] || tip.category;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-sky-500 transition-all h-full"
    >
      {/* Icon */}
      <div className={`bg-gradient-to-br ${color} rounded-xl p-3 inline-block mb-4`}>
        <IconComponent className="w-6 h-6 text-white" />
      </div>

      {/* Category Badge */}
      <div className="mb-3">
        <span className={`text-xs font-medium px-2 py-1 rounded-full bg-gradient-to-r ${color} text-white`}>
          {label}
        </span>
      </div>

      {/* Content */}
      <h3
        className="text-lg font-bold text-white mb-2"
        style={{ fontFamily: 'var(--font-headline)' }}
      >
        {tip.title}
      </h3>
      <p className="text-gray-400 text-sm leading-relaxed">{tip.description}</p>
    </motion.div>
  );
}
