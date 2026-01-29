'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Building2, ArrowLeft, SlidersHorizontal, X, MapPin } from 'lucide-react';
import Header from '@/components/layout/Header';
import { HotelCard, FilterSidebar, SortDropdown, ResultsSkeleton } from '@/components/travel/results';
import { mockHotels } from '@/data/travelMockData';

function HotelResultsContent() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recommended');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const destination = searchParams.get('destination');
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const rooms = searchParams.get('rooms') || '1';
  const guests = searchParams.get('guests') || '2';
  const halalOnly = searchParams.get('halal') === 'true';

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  // Calculate nights
  const getNights = () => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  const nights = getNights();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-sky-950 to-gray-900">
      <Header />

      {/* Search Summary Header */}
      <section className="pt-20 pb-4 px-4 md:px-6 bg-gray-800/50 border-b border-gray-700">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Link
                href="/travel/hotels"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-sky-400 text-sm mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Modify search
              </Link>
              <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                <Building2 className="w-6 h-6 text-sky-400" />
                Hotels in {destination || 'Dubai'}
              </h1>
              <p className="text-gray-400 text-sm">
                {formatDate(checkIn)} - {formatDate(checkOut)} · {nights} night{nights > 1 ? 's' : ''} · {rooms} room{parseInt(rooms) > 1 ? 's' : ''} · {guests} guest{parseInt(guests) > 1 ? 's' : ''}
                {halalOnly && <span className="text-sky-400 ml-2">· Halal-friendly only</span>}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>

              <SortDropdown type="hotels" value={sortBy} onChange={setSortBy} />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 md:px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex gap-6">
            {/* Sidebar - Desktop */}
            <div className="hidden lg:block w-72 flex-shrink-0">
              <FilterSidebar type="hotels" />
            </div>

            {/* Results */}
            <div className="flex-1">
              {/* Results Count */}
              <div className="mb-4 flex items-center justify-between">
                <p className="text-gray-400">
                  {isLoading ? 'Searching...' : `${mockHotels.length} hotels found`}
                </p>
                <button className="text-sky-400 text-sm hover:text-sky-300 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  View on map
                </button>
              </div>

              {/* Results List */}
              {isLoading ? (
                <ResultsSkeleton type="hotels" count={3} />
              ) : (
                <div className="space-y-4">
                  {mockHotels.map((hotel) => (
                    <HotelCard key={hotel.id} hotel={hotel} />
                  ))}
                </div>
              )}

              {/* Disclaimer */}
              <div className="mt-8 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                <p className="text-gray-500 text-sm">
                  Prices are provided by our hotel partners and are subject to change. Halal amenities
                  information is provided by hotels - we recommend confirming specific requirements
                  directly before booking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-gray-900/90 lg:hidden"
        >
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-white font-bold text-lg">Filters</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <FilterSidebar type="hotels" />
            </div>
            <div className="p-4 border-t border-gray-700">
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full bg-sky-600 text-white py-3 rounded-xl font-semibold"
              >
                Show Results
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function HotelResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-sky-950 to-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <HotelResultsContent />
    </Suspense>
  );
}
