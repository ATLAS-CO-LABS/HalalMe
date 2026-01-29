'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Plane,
  ArrowRightLeft,
  Calendar,
  Users,
  Search,
  ChevronDown,
} from 'lucide-react';
import { airports, Airport } from '@/data/travelMockData';

interface FlightSearchFormProps {
  compact?: boolean;
}

export default function FlightSearchForm({ compact = false }: FlightSearchFormProps) {
  const router = useRouter();
  const [tripType, setTripType] = useState<'roundtrip' | 'oneway'>('roundtrip');
  const [origin, setOrigin] = useState<Airport | null>(null);
  const [destination, setDestination] = useState<Airport | null>(null);
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState({ adults: 1, children: 0, infants: 0 });
  const [cabinClass, setCabinClass] = useState('economy');
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  const [originSearch, setOriginSearch] = useState('');
  const [destSearch, setDestSearch] = useState('');

  const filteredOriginAirports = airports.filter(
    (airport) =>
      airport.city.toLowerCase().includes(originSearch.toLowerCase()) ||
      airport.code.toLowerCase().includes(originSearch.toLowerCase()) ||
      airport.name.toLowerCase().includes(originSearch.toLowerCase())
  );

  const filteredDestAirports = airports.filter(
    (airport) =>
      airport.city.toLowerCase().includes(destSearch.toLowerCase()) ||
      airport.code.toLowerCase().includes(destSearch.toLowerCase()) ||
      airport.name.toLowerCase().includes(destSearch.toLowerCase())
  );

  const totalPassengers = passengers.adults + passengers.children + passengers.infants;

  const swapLocations = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
    const tempSearch = originSearch;
    setOriginSearch(destSearch);
    setDestSearch(tempSearch);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (origin) params.set('origin', origin.code);
    if (destination) params.set('destination', destination.code);
    if (departureDate) params.set('departure', departureDate);
    if (returnDate && tripType === 'roundtrip') params.set('return', returnDate);
    params.set('passengers', totalPassengers.toString());
    params.set('class', cabinClass);
    params.set('tripType', tripType);

    router.push(`/travel/flights/results?${params.toString()}`);
  };

  return (
    <div className="w-full">
      {/* Trip Type Toggle */}
      <div className="flex gap-4 mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="tripType"
            checked={tripType === 'roundtrip'}
            onChange={() => setTripType('roundtrip')}
            className="w-4 h-4 text-sky-500 bg-gray-700 border-gray-600 focus:ring-sky-500"
          />
          <span className="text-gray-300 text-sm">Round trip</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="tripType"
            checked={tripType === 'oneway'}
            onChange={() => setTripType('oneway')}
            className="w-4 h-4 text-sky-500 bg-gray-700 border-gray-600 focus:ring-sky-500"
          />
          <span className="text-gray-300 text-sm">One way</span>
        </label>
      </div>

      {/* Search Fields */}
      <div className={`grid gap-4 ${compact ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-5'}`}>
        {/* Origin */}
        <div className="relative">
          <label className="block text-gray-400 text-xs mb-1.5 font-medium">From</label>
          <div className="relative">
            <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={originSearch || (origin ? `${origin.city} (${origin.code})` : '')}
              onChange={(e) => {
                setOriginSearch(e.target.value);
                setOrigin(null);
                setShowOriginDropdown(true);
              }}
              onFocus={() => setShowOriginDropdown(true)}
              onBlur={() => setTimeout(() => setShowOriginDropdown(false), 200)}
              placeholder="City or airport"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
            />
            {showOriginDropdown && filteredOriginAirports.length > 0 && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                {filteredOriginAirports.map((airport) => (
                  <button
                    key={airport.code}
                    onClick={() => {
                      setOrigin(airport);
                      setOriginSearch('');
                      setShowOriginDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{airport.city}</p>
                        <p className="text-gray-400 text-sm">{airport.name}</p>
                      </div>
                      <span className="text-sky-400 font-bold">{airport.code}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Swap Button - Desktop */}
        <button
          onClick={swapLocations}
          className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 z-10 w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-full items-center justify-center transition-colors"
          style={{ marginTop: '20px' }}
        >
          <ArrowRightLeft className="w-4 h-4 text-gray-300" />
        </button>

        {/* Destination */}
        <div className="relative">
          <label className="block text-gray-400 text-xs mb-1.5 font-medium">To</label>
          <div className="relative">
            <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 rotate-90" />
            <input
              type="text"
              value={destSearch || (destination ? `${destination.city} (${destination.code})` : '')}
              onChange={(e) => {
                setDestSearch(e.target.value);
                setDestination(null);
                setShowDestDropdown(true);
              }}
              onFocus={() => setShowDestDropdown(true)}
              onBlur={() => setTimeout(() => setShowDestDropdown(false), 200)}
              placeholder="City or airport"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
            />
            {showDestDropdown && filteredDestAirports.length > 0 && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                {filteredDestAirports.map((airport) => (
                  <button
                    key={airport.code}
                    onClick={() => {
                      setDestination(airport);
                      setDestSearch('');
                      setShowDestDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{airport.city}</p>
                        <p className="text-gray-400 text-sm">{airport.name}</p>
                      </div>
                      <span className="text-sky-400 font-bold">{airport.code}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Departure Date */}
        <div>
          <label className="block text-gray-400 text-xs mb-1.5 font-medium">Departure</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
            />
          </div>
        </div>

        {/* Return Date */}
        {tripType === 'roundtrip' && (
          <div>
            <label className="block text-gray-400 text-xs mb-1.5 font-medium">Return</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
              />
            </div>
          </div>
        )}

        {/* Passengers & Class */}
        <div className="relative">
          <label className="block text-gray-400 text-xs mb-1.5 font-medium">Travelers & Class</label>
          <button
            onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-left flex items-center justify-between focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
          >
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-500" />
              <span>{totalPassengers} traveler{totalPassengers > 1 ? 's' : ''}, {cabinClass}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showPassengerDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showPassengerDropdown && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-xl p-4">
              {/* Adults */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-white font-medium">Adults</p>
                  <p className="text-gray-400 text-sm">12+ years</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPassengers({ ...passengers, adults: Math.max(1, passengers.adults - 1) })}
                    className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="text-white w-6 text-center">{passengers.adults}</span>
                  <button
                    onClick={() => setPassengers({ ...passengers, adults: passengers.adults + 1 })}
                    className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Children */}
              <div className="flex items-center justify-between py-3 border-t border-gray-700">
                <div>
                  <p className="text-white font-medium">Children</p>
                  <p className="text-gray-400 text-sm">2-11 years</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPassengers({ ...passengers, children: Math.max(0, passengers.children - 1) })}
                    className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="text-white w-6 text-center">{passengers.children}</span>
                  <button
                    onClick={() => setPassengers({ ...passengers, children: passengers.children + 1 })}
                    className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Infants */}
              <div className="flex items-center justify-between py-3 border-t border-gray-700">
                <div>
                  <p className="text-white font-medium">Infants</p>
                  <p className="text-gray-400 text-sm">Under 2 years</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPassengers({ ...passengers, infants: Math.max(0, passengers.infants - 1) })}
                    className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="text-white w-6 text-center">{passengers.infants}</span>
                  <button
                    onClick={() => setPassengers({ ...passengers, infants: passengers.infants + 1 })}
                    className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Cabin Class */}
              <div className="pt-3 border-t border-gray-700">
                <p className="text-white font-medium mb-2">Cabin class</p>
                <select
                  value={cabinClass}
                  onChange={(e) => setCabinClass(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value="economy">Economy</option>
                  <option value="premium_economy">Premium Economy</option>
                  <option value="business">Business</option>
                  <option value="first">First Class</option>
                </select>
              </div>

              <button
                onClick={() => setShowPassengerDropdown(false)}
                className="w-full mt-4 bg-sky-600 hover:bg-sky-500 text-white py-2 rounded-lg font-semibold transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search Button */}
      <div className="mt-6 flex justify-center">
        <motion.button
          onClick={handleSearch}
          className="bg-gradient-to-r from-sky-600 via-cyan-500 to-cyan-600 text-white px-10 py-4 rounded-full font-bold text-lg shadow-lg flex items-center gap-2"
          whileHover={{
            scale: 1.05,
            boxShadow: "0 20px 40px -10px rgba(14, 165, 233, 0.5)",
          }}
          whileTap={{ scale: 0.95 }}
        >
          <Search className="w-5 h-5" />
          Search Flights
        </motion.button>
      </div>
    </div>
  );
}
