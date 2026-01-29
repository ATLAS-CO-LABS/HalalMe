'use client';

import { motion } from 'framer-motion';
import { Plane, Building2, Car, Bell, BellOff, Trash2, Target } from 'lucide-react';
import type { PriceAlert } from '@/data/travelMockData';

interface PriceAlertCardProps {
  alert: PriceAlert;
  onToggle?: (id: string, isActive: boolean) => void;
  onDelete?: (id: string) => void;
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

export default function PriceAlertCard({ alert, onToggle, onDelete }: PriceAlertCardProps) {
  const Icon = typeIcons[alert.type];
  const color = typeColors[alert.type];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const priceDiff = alert.currentPrice - alert.targetPrice;
  const percentAway = Math.round((priceDiff / alert.targetPrice) * 100);

  return (
    <motion.div
      className={`bg-gray-800 rounded-xl p-4 border transition-all ${
        alert.isActive ? 'border-sky-500/50' : 'border-gray-700 opacity-60'
      }`}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`bg-gradient-to-br ${color} rounded-lg p-2 flex-shrink-0 ${!alert.isActive && 'grayscale'}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold truncate">{alert.title}</h3>
            <p className="text-gray-400 text-sm">{alert.details}</p>
            <p className="text-gray-500 text-xs mt-1">Created {formatDate(alert.createdAt)}</p>
          </div>
        </div>

        {/* Toggle */}
        <motion.button
          onClick={() => onToggle?.(alert.id, !alert.isActive)}
          className={`p-2 rounded-lg transition-colors ${
            alert.isActive
              ? 'bg-sky-500/20 text-sky-400'
              : 'bg-gray-700 text-gray-500'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {alert.isActive ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
        </motion.button>
      </div>

      {/* Price Progress */}
      <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-sky-400" />
            <span className="text-gray-400 text-sm">Target Price</span>
          </div>
          <span className="text-white font-bold">£{alert.targetPrice}</span>
        </div>

        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">Current Price</span>
          <span className={`font-bold ${alert.currentPrice <= alert.targetPrice ? 'text-emerald-400' : 'text-white'}`}>
            £{alert.currentPrice}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-2">
          <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                alert.currentPrice <= alert.targetPrice
                  ? 'bg-emerald-500'
                  : percentAway <= 10
                  ? 'bg-amber-500'
                  : 'bg-sky-500'
              }`}
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(100, (alert.targetPrice / alert.currentPrice) * 100)}%`,
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-center text-xs text-gray-500 mt-1">
            {alert.currentPrice <= alert.targetPrice
              ? '🎉 Target reached!'
              : `£${priceDiff} (${percentAway}%) above target`}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-700">
        <span className={`text-xs px-2 py-1 rounded-full ${
          alert.isActive
            ? 'bg-emerald-500/20 text-emerald-400'
            : 'bg-gray-700 text-gray-500'
        }`}>
          {alert.isActive ? 'Active' : 'Paused'}
        </span>
        <motion.button
          onClick={() => onDelete?.(alert.id)}
          className="flex items-center gap-1 text-gray-400 hover:text-red-400 text-sm transition-colors"
          whileHover={{ scale: 1.05 }}
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </motion.button>
      </div>
    </motion.div>
  );
}
