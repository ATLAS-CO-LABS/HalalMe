'use client';

import { motion } from 'framer-motion';
import { Users, DoorOpen, Briefcase, Snowflake, Fuel, Shield, ExternalLink, Check } from 'lucide-react';
import { CarRental } from '@/data/travelMockData';

interface CarCardProps {
  car: CarRental;
}

export default function CarCard({ car }: CarCardProps) {
  const categoryLabels: Record<string, string> = {
    economy: 'Economy',
    compact: 'Compact',
    midsize: 'Midsize',
    fullsize: 'Full-size',
    suv: 'SUV',
    luxury: 'Luxury',
    van: 'Van',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-gray-800 rounded-2xl border border-gray-700 hover:border-sky-500 transition-all overflow-hidden"
    >
      <div className="flex flex-col md:flex-row">
        {/* Image */}
        <div className="relative w-full md:w-64 h-48 md:h-auto bg-gray-700">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${car.image})` }}
          />
          <div className="absolute top-3 left-3 bg-sky-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
            {categoryLabels[car.category]}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">{car.name}</h3>
              <p className="text-gray-400 text-sm">{car.model}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-8 bg-white rounded flex items-center justify-center">
                <span className="text-gray-800 font-bold text-xs">{car.provider}</span>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center gap-2 text-gray-300">
              <Users className="w-5 h-5 text-sky-400" />
              <span className="text-sm">{car.seats} seats</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <DoorOpen className="w-5 h-5 text-sky-400" />
              <span className="text-sm">{car.doors} doors</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Briefcase className="w-5 h-5 text-sky-400" />
              <span className="text-sm">{car.bags.large}L + {car.bags.small}S bags</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              {car.airConditioning ? (
                <>
                  <Snowflake className="w-5 h-5 text-sky-400" />
                  <span className="text-sm">A/C</span>
                </>
              ) : (
                <span className="text-sm text-gray-500">No A/C</span>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="flex flex-wrap gap-3 mb-4">
            <span className="inline-flex items-center gap-1 bg-gray-700 text-gray-300 text-xs px-3 py-1.5 rounded-full">
              {car.transmission === 'automatic' ? 'Automatic' : 'Manual'}
            </span>
            <span className="inline-flex items-center gap-1 bg-gray-700 text-gray-300 text-xs px-3 py-1.5 rounded-full">
              <Fuel className="w-3 h-3" /> {car.fuelPolicy}
            </span>
            <span className="inline-flex items-center gap-1 bg-gray-700 text-gray-300 text-xs px-3 py-1.5 rounded-full">
              {car.mileage}
            </span>
            {car.insuranceIncluded && (
              <span className="inline-flex items-center gap-1 bg-green-900/30 text-green-400 text-xs px-3 py-1.5 rounded-full">
                <Shield className="w-3 h-3" /> Insurance included
              </span>
            )}
          </div>

          {/* Location */}
          <div className="text-gray-400 text-sm mb-4">
            <p>Pick-up: {car.pickupLocation}</p>
            {car.dropoffLocation !== car.pickupLocation && (
              <p>Drop-off: {car.dropoffLocation}</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-700">
            <div className="flex items-center gap-4">
              <span className="text-green-400 text-sm flex items-center gap-1">
                <Check className="w-4 h-4" /> Free cancellation
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-white">£{car.pricePerDay}</p>
                <p className="text-gray-500 text-xs">per day</p>
                <p className="text-gray-400 text-xs">Total: £{car.totalPrice}</p>
              </div>

              <motion.a
                href={car.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-sky-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Deal
                <ExternalLink className="w-4 h-4" />
              </motion.a>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
