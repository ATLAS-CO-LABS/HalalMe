'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Calendar,
  Clock,
  Search,
  User,
} from 'lucide-react';

interface CarSearchFormProps {
  compact?: boolean;
}

const popularLocations = [
  "Dubai International Airport",
  "Istanbul Airport",
  "London Heathrow Airport",
  "Kuala Lumpur International Airport",
  "Dubai Downtown",
  "Istanbul City Center",
  "London City Center",
];

export default function CarSearchForm({ compact = false }: CarSearchFormProps) {
  const router = useRouter();
  const [sameDropoff, setSameDropoff] = useState(true);
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('10:00');
  const [dropoffDate, setDropoffDate] = useState('');
  const [dropoffTime, setDropoffTime] = useState('10:00');
  const [driverAge, setDriverAge] = useState(30);
  const [showPickupDropdown, setShowPickupDropdown] = useState(false);
  const [showDropoffDropdown, setShowDropoffDropdown] = useState(false);
  const [pickupSearch, setPickupSearch] = useState('');
  const [dropoffSearch, setDropoffSearch] = useState('');

  const filteredPickupLocations = popularLocations.filter((loc) =>
    loc.toLowerCase().includes(pickupSearch.toLowerCase())
  );

  const filteredDropoffLocations = popularLocations.filter((loc) =>
    loc.toLowerCase().includes(dropoffSearch.toLowerCase())
  );

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (pickupLocation) params.set('pickup', pickupLocation);
    if (!sameDropoff && dropoffLocation) params.set('dropoff', dropoffLocation);
    if (pickupDate) params.set('pickupDate', pickupDate);
    if (pickupTime) params.set('pickupTime', pickupTime);
    if (dropoffDate) params.set('dropoffDate', dropoffDate);
    if (dropoffTime) params.set('dropoffTime', dropoffTime);
    params.set('driverAge', driverAge.toString());

    router.push(`/travel/cars/results?${params.toString()}`);
  };

  return (
    <div className="w-full">
      {/* Dropoff Toggle */}
      <div className="flex items-center gap-4 mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={sameDropoff}
            onChange={(e) => setSameDropoff(e.target.checked)}
            className="w-4 h-4 text-sky-500 bg-gray-700 border-gray-600 rounded focus:ring-sky-500"
          />
          <span className="text-gray-300 text-sm">Return to same location</span>
        </label>
      </div>

      {/* Search Fields */}
      <div className={`grid gap-4 ${compact ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
        {/* Pickup Location */}
        <div className="relative">
          <label className="block text-gray-400 text-xs mb-1.5 font-medium">Pick-up location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={pickupSearch || pickupLocation}
              onChange={(e) => {
                setPickupSearch(e.target.value);
                setPickupLocation('');
                setShowPickupDropdown(true);
              }}
              onFocus={() => setShowPickupDropdown(true)}
              onBlur={() => setTimeout(() => setShowPickupDropdown(false), 200)}
              placeholder="City or airport"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
            />
            {showPickupDropdown && filteredPickupLocations.length > 0 && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                {filteredPickupLocations.map((location) => (
                  <button
                    key={location}
                    onClick={() => {
                      setPickupLocation(location);
                      setPickupSearch('');
                      setShowPickupDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-sky-400" />
                      <span className="text-white">{location}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dropoff Location (if different) */}
        {!sameDropoff && (
          <div className="relative">
            <label className="block text-gray-400 text-xs mb-1.5 font-medium">Drop-off location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={dropoffSearch || dropoffLocation}
                onChange={(e) => {
                  setDropoffSearch(e.target.value);
                  setDropoffLocation('');
                  setShowDropoffDropdown(true);
                }}
                onFocus={() => setShowDropoffDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropoffDropdown(false), 200)}
                placeholder="City or airport"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
              />
              {showDropoffDropdown && filteredDropoffLocations.length > 0 && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                  {filteredDropoffLocations.map((location) => (
                    <button
                      key={location}
                      onClick={() => {
                        setDropoffLocation(location);
                        setDropoffSearch('');
                        setShowDropoffDropdown(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-sky-400" />
                        <span className="text-white">{location}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pickup Date & Time */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-gray-400 text-xs mb-1.5 font-medium">Pick-up date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-2 py-3 text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1.5 font-medium">Time</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="time"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-2 py-3 text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all text-sm"
              />
            </div>
          </div>
        </div>

        {/* Dropoff Date & Time */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-gray-400 text-xs mb-1.5 font-medium">Drop-off date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="date"
                value={dropoffDate}
                onChange={(e) => setDropoffDate(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-2 py-3 text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1.5 font-medium">Time</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="time"
                value={dropoffTime}
                onChange={(e) => setDropoffTime(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-2 py-3 text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all text-sm"
              />
            </div>
          </div>
        </div>

        {/* Driver Age */}
        <div>
          <label className="block text-gray-400 text-xs mb-1.5 font-medium">Driver&apos;s age</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="number"
              value={driverAge}
              onChange={(e) => setDriverAge(parseInt(e.target.value) || 25)}
              min={21}
              max={99}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
            />
          </div>
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
          Search Cars
        </motion.button>
      </div>
    </div>
  );
}
