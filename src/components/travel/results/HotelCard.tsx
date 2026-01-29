'use client';

import { motion } from 'framer-motion';
import { Star, MapPin, Wifi, Utensils, Dumbbell, Waves, ExternalLink, Check, X } from 'lucide-react';
import { Hotel } from '@/data/travelMockData';

interface HotelCardProps {
  hotel: Hotel;
}

const amenityIcons: Record<string, React.ElementType> = {
  Wifi: Wifi,
  Utensils: Utensils,
  Dumbbell: Dumbbell,
  Waves: Waves,
};

export default function HotelCard({ hotel }: HotelCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-gray-800 rounded-2xl border border-gray-700 hover:border-sky-500 transition-all overflow-hidden"
    >
      <div className="flex flex-col md:flex-row">
        {/* Image */}
        <div className="relative w-full md:w-72 h-48 md:h-auto">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${hotel.images[0]})` }}
          />
          {hotel.isFeatured && (
            <div className="absolute top-3 left-3 bg-sky-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Featured
            </div>
          )}
          {hotel.freeCancellation && (
            <div className="absolute bottom-3 left-3 bg-green-600/90 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Free Cancellation
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-white">{hotel.name}</h3>
                <div className="flex items-center">
                  {[...Array(hotel.starRating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1 text-gray-400 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{hotel.address}</span>
              </div>
            </div>

            {/* Rating Badge */}
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-white font-semibold">
                  {hotel.guestRating >= 9 ? 'Excellent' : hotel.guestRating >= 8 ? 'Very Good' : 'Good'}
                </p>
                <p className="text-gray-400 text-xs">{hotel.reviewCount.toLocaleString()} reviews</p>
              </div>
              <div className="bg-sky-600 text-white font-bold px-3 py-2 rounded-lg">
                {hotel.guestRating.toFixed(1)}
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">{hotel.description}</p>

          {/* Halal Amenities */}
          <div className="flex flex-wrap gap-2 mb-4">
            {hotel.halalAmenities.halalFood && (
              <span className="inline-flex items-center gap-1 bg-green-900/30 text-green-400 text-xs px-2 py-1 rounded-full">
                <Check className="w-3 h-3" /> Halal Food
              </span>
            )}
            {hotel.halalAmenities.prayerFacilities && (
              <span className="inline-flex items-center gap-1 bg-green-900/30 text-green-400 text-xs px-2 py-1 rounded-full">
                <Check className="w-3 h-3" /> Prayer Room
              </span>
            )}
            {hotel.halalAmenities.nearbyMosque && (
              <span className="inline-flex items-center gap-1 bg-green-900/30 text-green-400 text-xs px-2 py-1 rounded-full">
                <Check className="w-3 h-3" /> Near Mosque {hotel.halalAmenities.mosqueDistance && `(${hotel.halalAmenities.mosqueDistance})`}
              </span>
            )}
            {hotel.halalAmenities.alcoholFreeOption && (
              <span className="inline-flex items-center gap-1 bg-green-900/30 text-green-400 text-xs px-2 py-1 rounded-full">
                <Check className="w-3 h-3" /> Alcohol-Free Option
              </span>
            )}
          </div>

          {/* Regular Amenities */}
          <div className="flex flex-wrap gap-3 mb-4">
            {hotel.amenities.slice(0, 4).map((amenity) => {
              const Icon = amenityIcons[amenity.icon] || Wifi;
              return (
                <div key={amenity.id} className="flex items-center gap-1 text-gray-400 text-sm">
                  <Icon className="w-4 h-4" />
                  <span>{amenity.name}</span>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-700">
            <div>
              <p className="text-gray-400 text-sm">{hotel.roomType}</p>
              {hotel.breakfastIncluded && (
                <p className="text-green-400 text-sm">Breakfast included</p>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-white">£{hotel.pricePerNight}</p>
                <p className="text-gray-500 text-xs">per night</p>
              </div>

              <motion.a
                href={hotel.bookingUrl}
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
