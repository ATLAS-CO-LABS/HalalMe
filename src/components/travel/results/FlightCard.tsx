'use client';

import { motion } from 'framer-motion';
import { Plane, Clock, Briefcase, ExternalLink, Check } from 'lucide-react';
import { Flight } from '@/data/travelMockData';

interface FlightCardProps {
  flight: Flight;
}

export default function FlightCard({ flight }: FlightCardProps) {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-gray-800 rounded-2xl border border-gray-700 hover:border-sky-500 transition-all overflow-hidden"
    >
      {/* Badges */}
      {(flight.isBestValue || flight.isCheapest || flight.isFastest) && (
        <div className="bg-gradient-to-r from-sky-600 to-cyan-600 px-4 py-2 flex gap-2">
          {flight.isBestValue && (
            <span className="text-white text-xs font-semibold">Best Value</span>
          )}
          {flight.isCheapest && (
            <span className="text-white text-xs font-semibold">Cheapest</span>
          )}
          {flight.isFastest && (
            <span className="text-white text-xs font-semibold">Fastest</span>
          )}
        </div>
      )}

      <div className="p-6">
        {/* Outbound Flight */}
        <div className="flex items-center gap-4 mb-6">
          {/* Airline */}
          <div className="flex flex-col items-center w-20">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-1">
              <Plane className="w-6 h-6 text-sky-600" />
            </div>
            <span className="text-gray-400 text-xs text-center">{flight.airline}</span>
          </div>

          {/* Flight Details */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{formatTime(flight.outbound.departureTime)}</p>
                <p className="text-gray-400 text-sm">{flight.outbound.departureAirport.code}</p>
              </div>

              {/* Flight Path */}
              <div className="flex-1 mx-4">
                <div className="relative flex items-center">
                  <div className="flex-1 border-t border-dashed border-gray-600"></div>
                  <div className="absolute left-1/2 -translate-x-1/2 bg-gray-800 px-2">
                    <div className="flex flex-col items-center">
                      <Clock className="w-4 h-4 text-gray-500 mb-1" />
                      <span className="text-gray-400 text-xs">{flight.outbound.duration}</span>
                      <span className="text-sky-400 text-xs font-medium">
                        {flight.isDirectFlight ? 'Direct' : `${flight.outbound.stops} stop`}
                      </span>
                    </div>
                  </div>
                  <Plane className="w-4 h-4 text-sky-400 rotate-90" />
                </div>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-white">{formatTime(flight.outbound.arrivalTime)}</p>
                <p className="text-gray-400 text-sm">{flight.outbound.arrivalAirport.code}</p>
              </div>
            </div>
            <p className="text-gray-500 text-xs">{formatDate(flight.outbound.departureTime)}</p>
          </div>
        </div>

        {/* Return Flight (if exists) */}
        {flight.inbound && (
          <div className="flex items-center gap-4 pb-6 border-b border-gray-700">
            {/* Airline */}
            <div className="flex flex-col items-center w-20">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-1">
                <Plane className="w-6 h-6 text-sky-600" />
              </div>
              <span className="text-gray-400 text-xs text-center">{flight.airline}</span>
            </div>

            {/* Flight Details */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{formatTime(flight.inbound.departureTime)}</p>
                  <p className="text-gray-400 text-sm">{flight.inbound.departureAirport.code}</p>
                </div>

                {/* Flight Path */}
                <div className="flex-1 mx-4">
                  <div className="relative flex items-center">
                    <div className="flex-1 border-t border-dashed border-gray-600"></div>
                    <div className="absolute left-1/2 -translate-x-1/2 bg-gray-800 px-2">
                      <div className="flex flex-col items-center">
                        <Clock className="w-4 h-4 text-gray-500 mb-1" />
                        <span className="text-gray-400 text-xs">{flight.inbound.duration}</span>
                        <span className="text-sky-400 text-xs font-medium">
                          {flight.isDirectFlight ? 'Direct' : `${flight.inbound.stops} stop`}
                        </span>
                      </div>
                    </div>
                    <Plane className="w-4 h-4 text-sky-400 rotate-90" />
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{formatTime(flight.inbound.arrivalTime)}</p>
                  <p className="text-gray-400 text-sm">{flight.inbound.arrivalAirport.code}</p>
                </div>
              </div>
              <p className="text-gray-500 text-xs">{formatDate(flight.inbound.departureTime)}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-4">
            {flight.baggageIncluded && (
              <div className="flex items-center gap-1 text-gray-400 text-sm">
                <Briefcase className="w-4 h-4" />
                <span>Baggage included</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-gray-400 text-sm">from</p>
              <p className="text-2xl font-bold text-white">£{flight.price}</p>
              <p className="text-gray-500 text-xs">per person</p>
            </div>

            <motion.a
              href={flight.bookingUrl}
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
    </motion.div>
  );
}
