'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Calendar,
  Users,
  Search,
  ChevronDown,
  Star,
} from 'lucide-react';
import { popularDestinations } from '@/data/travelMockData';

interface HotelSearchFormProps {
  compact?: boolean;
}

export default function HotelSearchForm({ compact = false }: HotelSearchFormProps) {
  const router = useRouter();
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState({ adults: 2, children: 0 });
  const [halalOnly, setHalalOnly] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const [destSearch, setDestSearch] = useState('');

  const filteredDestinations = popularDestinations.filter(
    (dest) =>
      dest.city.toLowerCase().includes(destSearch.toLowerCase()) ||
      dest.country.toLowerCase().includes(destSearch.toLowerCase())
  );

  const totalGuests = guests.adults + guests.children;

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (destination) params.set('destination', destination);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    params.set('rooms', rooms.toString());
    params.set('guests', totalGuests.toString());
    if (halalOnly) params.set('halal', 'true');

    router.push(`/travel/hotels/results?${params.toString()}`);
  };

  return (
    <div className="w-full">
      {/* Halal Toggle */}
      <div className="flex items-center gap-4 mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={halalOnly}
            onChange={(e) => setHalalOnly(e.target.checked)}
            className="w-4 h-4 text-sky-500 bg-gray-700 border-gray-600 rounded focus:ring-sky-500"
          />
          <span className="text-gray-300 text-sm flex items-center gap-1">
            <Star className="w-4 h-4 text-sky-400" />
            Halal-friendly hotels only
          </span>
        </label>
      </div>

      {/* Search Fields */}
      <div className={`grid gap-4 ${compact ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
        {/* Destination */}
        <div className="relative lg:col-span-1">
          <label className="block text-gray-400 text-xs mb-1.5 font-medium">Destination</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={destSearch || destination}
              onChange={(e) => {
                setDestSearch(e.target.value);
                setDestination('');
                setShowDestDropdown(true);
              }}
              onFocus={() => setShowDestDropdown(true)}
              onBlur={() => setTimeout(() => setShowDestDropdown(false), 200)}
              placeholder="City, region or hotel"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
            />
            {showDestDropdown && filteredDestinations.length > 0 && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                {filteredDestinations.map((dest) => (
                  <button
                    key={dest.id}
                    onClick={() => {
                      setDestination(dest.city);
                      setDestSearch('');
                      setShowDestDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg bg-cover bg-center"
                        style={{ backgroundImage: `url(${dest.image})` }}
                      />
                      <div>
                        <p className="text-white font-medium">{dest.city}</p>
                        <p className="text-gray-400 text-sm">{dest.country}</p>
                      </div>
                      <div className="ml-auto flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < dest.halalScore ? 'text-sky-400 fill-sky-400' : 'text-gray-600'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Check-in Date */}
        <div>
          <label className="block text-gray-400 text-xs mb-1.5 font-medium">Check-in</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
            />
          </div>
        </div>

        {/* Check-out Date */}
        <div>
          <label className="block text-gray-400 text-xs mb-1.5 font-medium">Check-out</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
            />
          </div>
        </div>

        {/* Guests & Rooms */}
        <div className="relative">
          <label className="block text-gray-400 text-xs mb-1.5 font-medium">Guests & Rooms</label>
          <button
            onClick={() => setShowGuestDropdown(!showGuestDropdown)}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-left flex items-center justify-between focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
          >
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-500" />
              <span>{totalGuests} guest{totalGuests > 1 ? 's' : ''}, {rooms} room{rooms > 1 ? 's' : ''}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showGuestDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showGuestDropdown && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-xl p-4">
              {/* Rooms */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-white font-medium">Rooms</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setRooms(Math.max(1, rooms - 1))}
                    className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="text-white w-6 text-center">{rooms}</span>
                  <button
                    onClick={() => setRooms(rooms + 1)}
                    className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Adults */}
              <div className="flex items-center justify-between py-3 border-t border-gray-700">
                <div>
                  <p className="text-white font-medium">Adults</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setGuests({ ...guests, adults: Math.max(1, guests.adults - 1) })}
                    className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="text-white w-6 text-center">{guests.adults}</span>
                  <button
                    onClick={() => setGuests({ ...guests, adults: guests.adults + 1 })}
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
                  <p className="text-gray-400 text-sm">0-17 years</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setGuests({ ...guests, children: Math.max(0, guests.children - 1) })}
                    className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="text-white w-6 text-center">{guests.children}</span>
                  <button
                    onClick={() => setGuests({ ...guests, children: guests.children + 1 })}
                    className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowGuestDropdown(false)}
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
          Search Hotels
        </motion.button>
      </div>
    </div>
  );
}
