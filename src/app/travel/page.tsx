'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Plane,
  Building2,
  Car,
  Globe,
  Shield,
  Tag,
  MapPin,
  Compass,
  BookOpen,
  Search,
  Bell,
  Star,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { popularDestinations } from '@/data/travelMockData';

export default function TravelLandingPage() {
  const router = useRouter();

  const features = [
    { icon: Shield, title: "Halal-Friendly", description: "Find Muslim-friendly hotels and destinations" },
    { icon: Tag, title: "Best Prices", description: "Compare prices from top travel providers" },
    { icon: Globe, title: "Global Coverage", description: "Search flights, hotels & cars worldwide" },
    { icon: Bell, title: "Price Alerts", description: "Get notified when prices drop" },
  ];

  const searchOptions = [
    {
      icon: Plane,
      title: "Flights",
      description: "Compare flights from 100+ airlines worldwide",
      href: "/travel/flights",
      features: ["Direct & connecting flights", "Flexible date search", "Price calendar"],
    },
    {
      icon: Building2,
      title: "Hotels",
      description: "Find halal-friendly hotels with prayer facilities",
      href: "/travel/hotels",
      features: ["Halal food options", "Prayer room filters", "Near mosque search"],
    },
    {
      icon: Car,
      title: "Car Rentals",
      description: "Rent cars from trusted providers worldwide",
      href: "/travel/cars",
      features: ["All car types", "Free cancellation", "Full insurance options"],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] max-h-[900px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&auto=format&fit=crop&q=80"
            alt="Halal-friendly travel"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 z-[1] bg-gray-950/70" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 pt-20">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2.5 bg-sky-500/15 border border-sky-400/25 backdrop-blur-md rounded-full px-5 py-2.5 mb-5 sm:mb-8"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
              <span className="text-sky-300 text-sm font-semibold tracking-wide">Powered by Skyscanner</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] mb-6 tracking-tight"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              HalalMe{' '}
              <span className="relative inline-block">
                <span className="text-sky-400">Travel</span>
                <motion.span
                  className="absolute -bottom-1 left-0 right-0 h-1 bg-sky-500 rounded-full origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 1 }}
                />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-base sm:text-lg md:text-xl text-gray-300/90 max-w-xl leading-relaxed mb-6 sm:mb-10"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Compare flights, hotels & car rentals from top providers worldwide. Built for halal-friendly travel.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.65 }}
              className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-12 sm:mb-14"
            >
              <motion.button
                onClick={() => router.push('/travel/flights')}
                whileHover={{ scale: 1.04, boxShadow: '0 20px 50px -12px rgba(14,165,233,0.5)' }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto px-8 py-4 md:px-10 md:py-5 bg-sky-500 text-white font-bold text-lg rounded-full shadow-xl shadow-sky-500/25 flex items-center justify-center gap-2.5"
              >
                Search Flights
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                onClick={() => router.push('/travel/hotels')}
                whileHover={{ scale: 1.04, backgroundColor: 'rgba(255,255,255,0.12)' }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto px-8 py-4 md:px-10 md:py-5 bg-white/8 border border-white/20 backdrop-blur-sm text-white font-bold text-lg rounded-full hover:border-white/40 transition-all"
              >
                Find Hotels
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="flex flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm"
            >
              {[
                { icon: ShieldCheck, text: 'Halal-Friendly' },
                { icon: Globe, text: '1000+ Destinations' },
                { icon: Tag, text: 'Best Prices' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-400">
                  <item.icon className="w-4 h-4 text-sky-400" />
                  <span>{item.text}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-sky-400 rounded-full" />
          </div>
        </div>
      </section>

      {/* Main Search Cards Section */}
      <section className="px-4 md:px-6 py-16 md:py-20 bg-gray-900">
        <div className="mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {searchOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <motion.div
                  key={option.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Link href={option.href}>
                    <motion.div
                      className="group relative h-full bg-gray-800 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xl overflow-hidden cursor-pointer border border-gray-700 hover:border-sky-500/50 transition-all"
                      whileHover={{ scale: 1.02, y: -6 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                          <div className="bg-sky-500 rounded-full p-4 shadow-md">
                            <Icon className="w-10 h-10 text-white" />
                          </div>
                          <motion.svg
                            className="w-8 h-8 text-gray-400 opacity-70 group-hover:opacity-100 group-hover:text-sky-400"
                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                            animate={{ x: [0, 4, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </motion.svg>
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-headline)' }}>
                          {option.title}
                        </h2>
                        <p className="text-gray-300 text-base leading-relaxed mb-4" style={{ fontFamily: 'var(--font-body)' }}>
                          {option.description}
                        </p>

                        <div className="space-y-2">
                          {option.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-sky-500/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-sky-400 text-xs">✓</span>
                              </div>
                              <p className="text-gray-400 text-sm" style={{ fontFamily: 'var(--font-body)' }}>{feature}</p>
                            </div>
                          ))}
                        </div>

                        <motion.div
                          className="mt-6 inline-flex items-center gap-2 bg-sky-500 text-white px-5 py-2.5 rounded-full font-semibold text-sm shadow-md"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Search {option.title}
                        </motion.div>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 md:px-6 py-16 md:py-20 bg-gray-950">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-headline)' }}>
              Why Choose HalalMe <span className="text-sky-400">Travel?</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-400" style={{ fontFamily: 'var(--font-body)' }}>
              Your trusted partner for halal-friendly travel worldwide
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -6 }}
                  className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-sky-500/40 transition-all shadow-sm hover:shadow-md"
                >
                  <div className="bg-sky-500 rounded-xl p-4 mb-4 inline-block shadow-md">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
                    {feature.title}
                  </h3>
                  <p className="text-gray-400" style={{ fontFamily: 'var(--font-body)' }}>
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="px-4 md:px-6 py-16 md:py-20 bg-gray-900">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-headline)' }}>
              Popular <span className="text-sky-400">Destinations</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-400" style={{ fontFamily: 'var(--font-body)' }}>
              Explore Muslim-friendly destinations around the world
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularDestinations.slice(0, 6).map((destination, index) => (
              <motion.div
                key={destination.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link href={`/travel/guide/cities/${destination.slug}`}>
                  <motion.div
                    className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                      style={{ backgroundImage: `url(${destination.image})` }}
                    />
                    <div className="absolute inset-0 bg-gray-900/60" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-sky-400" />
                        <span className="text-sky-400 text-sm font-semibold">{destination.country}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
                        {destination.city}
                      </h3>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-300"><Plane className="w-4 h-4 inline mr-1" />From £{destination.flightPriceFrom}</span>
                        <span className="text-gray-300"><Building2 className="w-4 h-4 inline mr-1" />From £{destination.hotelPriceFrom}/night</span>
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < destination.halalScore ? 'text-sky-400 fill-sky-400' : 'text-gray-600'}`} />
                        ))}
                        <span className="text-gray-400 text-xs ml-1">Halal Score</span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <motion.button
              onClick={() => router.push('/travel/deals/popular-destinations')}
              className="text-sky-400 hover:text-sky-300 font-semibold inline-flex items-center gap-2"
              whileHover={{ x: 5 }}
            >
              View All Destinations
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </motion.button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 md:px-6 py-16 bg-sky-500/5 border-y border-sky-500/10">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Travel Partners", value: "500+" },
              { label: "Destinations", value: "1000+" },
              { label: "Happy Travelers", value: "50K+" },
              { label: "Halal Hotels", value: "10K+" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
                  {stat.value}
                </h3>
                <p className="text-gray-400" style={{ fontFamily: 'var(--font-body)' }}>{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Muslim Travel Guide CTA */}
      <section className="px-4 md:px-6 py-16 md:py-20 bg-gray-950">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gray-800 rounded-3xl p-8 md:p-12 border border-gray-700 shadow-lg"
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 rounded-full px-4 py-2 mb-4">
                  <Compass className="w-4 h-4 text-sky-400" />
                  <span className="text-sky-300 text-sm font-semibold">Muslim Travel Guide</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-headline)' }}>
                  Plan Your <span className="text-sky-400">Halal-Friendly</span> Trip
                </h2>
                <p className="text-gray-300 text-lg mb-6" style={{ fontFamily: 'var(--font-body)' }}>
                  Discover mosques, halal restaurants, and Muslim-friendly attractions in cities around the world.
                </p>
                <div className="flex flex-wrap gap-3">
                  <motion.button
                    onClick={() => router.push('/travel/guide')}
                    className="bg-sky-500 text-white px-6 py-3 rounded-full font-semibold shadow-md"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Explore Guides
                  </motion.button>
                  <motion.button
                    onClick={() => router.push('/travel/guide/tips')}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-full font-semibold border border-gray-600"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Travel Tips
                  </motion.button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: BookOpen, label: "City Guides", value: "50+" },
                  { icon: MapPin, label: "Mosques Listed", value: "5K+" },
                  { icon: Search, label: "Halal Restaurants", value: "20K+" },
                  { icon: Star, label: "Travel Tips", value: "100+" },
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="bg-gray-700/50 rounded-xl p-4 text-center"
                    >
                      <Icon className="w-8 h-8 text-sky-400 mx-auto mb-2" />
                      <p className="text-white font-bold text-xl">{item.value}</p>
                      <p className="text-gray-400 text-sm">{item.label}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 md:px-6 py-16 md:py-20 bg-gray-900">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Globe className="w-16 h-16 text-sky-400 mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-headline)' }}>
              Ready to <span className="text-sky-400">Explore the World?</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-400 mb-8" style={{ fontFamily: 'var(--font-body)' }}>
              Compare prices from hundreds of travel sites and find your perfect halal-friendly trip.
            </p>
            <motion.button
              onClick={() => router.push('/travel/flights')}
              className="bg-sky-500 text-white px-10 py-5 rounded-full font-bold text-xl shadow-xl shadow-sky-500/20"
              whileHover={{ scale: 1.05, boxShadow: "0 25px 50px -12px rgba(14,165,233,0.5)" }}
              whileTap={{ scale: 0.95 }}
            >
              Start Searching
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="px-4 md:px-6 pb-8 bg-gray-900">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-gray-500 text-sm" style={{ fontFamily: 'var(--font-body)' }}>
            Prices displayed are provided by our travel partners. HalalMe Travel is a comparison service -
            all bookings are completed on partner websites.
          </p>
        </div>
      </section>

      {/* Back Links */}
      <section className="px-4 md:px-6 py-8 bg-gray-900">
        <div className="mx-auto max-w-4xl text-center flex justify-center gap-6">
          <Link href="/rewards" className="text-gray-400 hover:text-sky-400 transition-colors text-sm font-semibold">← Rewards</Link>
          <Link href="/kitchen" className="text-gray-400 hover:text-sky-400 transition-colors text-sm font-semibold">Kitchen →</Link>
        </div>
      </section>
    </div>
  );
}
