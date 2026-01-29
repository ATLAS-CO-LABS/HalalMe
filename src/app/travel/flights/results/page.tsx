'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Plane, ArrowLeft, SlidersHorizontal, X } from 'lucide-react';
import Header from '@/components/layout/Header';
import { FlightCard, FilterSidebar, SortDropdown, ResultsSkeleton } from '@/components/travel/results';
import { mockFlights, airports } from '@/data/travelMockData';

function FlightResultsContent() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('best');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const departure = searchParams.get('departure');
  const returnDate = searchParams.get('return');
  const passengers = searchParams.get('passengers') || '1';

  const originAirport = airports.find((a) => a.code === origin);
  const destAirport = airports.find((a) => a.code === destination);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-sky-950 to-gray-900">
      <Header />

      {/* Search Summary Header */}
      <section className="pt-20 pb-4 px-4 md:px-6 bg-gray-800/50 border-b border-gray-700">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Link
                href="/travel/flights"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-sky-400 text-sm mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Modify search
              </Link>
              <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                <Plane className="w-6 h-6 text-sky-400" />
                {originAirport?.city || origin || 'London'} → {destAirport?.city || destination || 'Dubai'}
              </h1>
              <p className="text-gray-400 text-sm">
                {formatDate(departure)} {returnDate && `- ${formatDate(returnDate)}`} · {passengers} traveler{parseInt(passengers) > 1 ? 's' : ''}
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

              <SortDropdown type="flights" value={sortBy} onChange={setSortBy} />
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
              <FilterSidebar type="flights" />
            </div>

            {/* Results */}
            <div className="flex-1">
              {/* Results Count */}
              <div className="mb-4">
                <p className="text-gray-400">
                  {isLoading ? 'Searching...' : `${mockFlights.length} flights found`}
                </p>
              </div>

              {/* Results List */}
              {isLoading ? (
                <ResultsSkeleton type="flights" count={3} />
              ) : (
                <div className="space-y-4">
                  {mockFlights.map((flight) => (
                    <FlightCard key={flight.id} flight={flight} />
                  ))}
                </div>
              )}

              {/* Disclaimer */}
              <div className="mt-8 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                <p className="text-gray-500 text-sm">
                  Prices are provided by our travel partners and are subject to change. Final prices
                  will be shown on the booking site. Additional fees may apply for baggage, seat
                  selection, and other services.
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
              <FilterSidebar type="flights" />
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

export default function FlightResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-sky-950 to-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <FlightResultsContent />
    </Suspense>
  );
}
