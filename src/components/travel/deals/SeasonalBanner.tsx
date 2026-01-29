'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

interface SeasonalBannerProps {
  season: 'ramadan' | 'summer' | 'winter' | 'eid';
  title: string;
  subtitle: string;
  bgColor?: string;
  href: string;
}

const seasonStyles = {
  ramadan: {
    gradient: 'from-emerald-600 via-emerald-500 to-teal-600',
    icon: '🌙',
    accentColor: 'emerald',
  },
  summer: {
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    icon: '☀️',
    accentColor: 'amber',
  },
  winter: {
    gradient: 'from-sky-500 via-blue-500 to-indigo-600',
    icon: '❄️',
    accentColor: 'sky',
  },
  eid: {
    gradient: 'from-purple-600 via-pink-500 to-rose-500',
    icon: '🎉',
    accentColor: 'purple',
  },
};

export default function SeasonalBanner({
  season,
  title,
  subtitle,
  href,
}: SeasonalBannerProps) {
  const style = seasonStyles[season];

  return (
    <Link href={href}>
      <motion.div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${style.gradient} p-6 md:p-8 cursor-pointer`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white rounded-full"></div>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-4xl md:text-5xl">{style.icon}</div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-white/80" />
                <span className="text-white/80 text-sm font-medium">Limited Time</span>
              </div>
              <h3
                className="text-xl md:text-2xl font-bold text-white"
                style={{ fontFamily: 'var(--font-headline)' }}
              >
                {title}
              </h3>
              <p className="text-white/90 text-sm md:text-base">{subtitle}</p>
            </div>
          </div>

          <motion.div
            className="hidden sm:flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full font-semibold"
            whileHover={{ x: 5 }}
          >
            View Deals
            <ArrowRight className="w-4 h-4" />
          </motion.div>
        </div>
      </motion.div>
    </Link>
  );
}
