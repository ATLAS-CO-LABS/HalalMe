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
    {
      icon: Shield,
      title: "Halal-Friendly",
      description: "Find Muslim-friendly hotels and destinations",
      color: "from-sky-500 to-sky-600",
    },
    {
      icon: Tag,
      title: "Best Prices",
      description: "Compare prices from top travel providers",
      color: "from-cyan-500 to-cyan-600",
    },
    {
      icon: Globe,
      title: "Global Coverage",
      description: "Search flights, hotels & cars worldwide",
      color: "from-teal-500 to-teal-600",
    },
    {
      icon: Bell,
      title: "Price Alerts",
      description: "Get notified when prices drop",
      color: "from-sky-500 to-cyan-600",
    },
  ];

  const searchOptions = [
    {
      icon: Plane,
      title: "Flights",
      description: "Compare flights from 100+ airlines worldwide",
      href: "/travel/flights",
      color: "from-sky-600 via-sky-500 to-cyan-600",
      features: ["Direct & connecting flights", "Flexible date search", "Price calendar"],
    },
    {
      icon: Building2,
      title: "Hotels",
      description: "Find halal-friendly hotels with prayer facilities",
      href: "/travel/hotels",
      color: "from-cyan-600 via-cyan-500 to-teal-600",
      features: ["Halal food options", "Prayer room filters", "Near mosque search"],
    },
    {
      icon: Car,
      title: "Car Rentals",
      description: "Rent cars from trusted providers worldwide",
      href: "/travel/cars",
      color: "from-teal-600 via-teal-500 to-sky-600",
      features: ["All car types", "Free cancellation", "Full insurance options"],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-sky-950 to-gray-900">
      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] max-h-[900px] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=1920&auto=format&fit=crop&q=80"
            alt="Halal-friendly travel"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-r from-gray-950 via-gray-950/75 to-transparent" />
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-gray-950 via-transparent to-gray-950/40" />

        {/* Ambient glow */}
        <div className="absolute bottom-0 left-1/4 w-[420px] h-[420px] bg-sky-600/12 rounded-full blur-3xl z-[1]" />
        <div className="absolute top-1/3 right-0 w-[280px] h-[280px] bg-cyan-500/8 rounded-full blur-3xl z-[1]" />

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="max-w-3xl">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2.5 bg-sky-500/15 border border-sky-400/25 backdrop-blur-md rounded-full px-5 py-2.5 mb-8"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
              <span className="text-sky-300 text-sm font-semibold tracking-wide">
                Powered by Skyscanner
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] mb-6 tracking-tight"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              HalalMe{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                  Travel
                </span>
                <motion.span
                  className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-cyan-500 rounded-full origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 1 }}
                />
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-base sm:text-lg md:text-xl text-gray-300/90 max-w-xl leading-relaxed mb-10"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Compare flights, hotels & car rentals from top providers worldwide.
              Built for halal-friendly travel.
            </motion.p>

            {/* CTAs */}
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
                className="group relative w-full sm:w-auto px-8 py-4 md:px-10 md:py-5 bg-gradient-to-r from-sky-500 to-cyan-600 text-white font-bold text-lg rounded-full shadow-xl shadow-sky-600/25 overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2.5">
                  Search Flights
                  <ArrowRight className="w-5 h-5" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
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

              {/* Trust row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="flex flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm"
              >
                {[
                  { icon: ShieldCheck, text: 'Halal-Friendly', color: 'text-sky-400' },
                  { icon: Globe, text: '1000+ Destinations', color: 'text-cyan-400' },
                  { icon: Tag, text: 'Best Prices', color: 'text-sky-400' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-gray-400">
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    <span>{item.text}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.75 }}
              className="relative hidden lg:block"
            >
              <div className="relative h-[510px]">
                <div className="absolute right-0 top-0 h-[360px] w-[300px] overflow-hidden rounded-[2rem] border border-white/20 shadow-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=900&q=80"
                    alt="Traveler at destination"
                    fill
                    className="object-cover"
                    sizes="300px"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gray-950/65 p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-sky-300">Featured City</p>
                    <p className="text-lg font-bold text-white">Istanbul</p>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 h-[250px] w-[260px] overflow-hidden rounded-[1.7rem] border border-white/20 shadow-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=900&q=80"
                    alt="Muslim-friendly travel experience"
                    fill
                    className="object-cover"
                    sizes="260px"
                  />
                  <div className="absolute inset-0 bg-gray-950/35" />
                </div>
                <div className="absolute bottom-6 right-8 rounded-2xl border border-sky-400/35 bg-sky-500/15 px-4 py-3 backdrop-blur-md">
                  <p className="text-xs text-sky-300">Live deal found</p>
                  <p className="text-xl font-bold text-white">-28% Fare</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-sky-400 rounded-full" />
          </div>
        </div>
      </section>

      {/* Main Search Cards Section */}
      <section className="px-4 md:px-6 py-16 md:py-20 bg-gradient-to-r from-sky-900/20 to-cyan-900/20">
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
                      className="group relative h-full bg-gray-800 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden cursor-pointer border border-gray-700 hover:border-sky-500 transition-all"
                      whileHover={{ scale: 1.02, y: -8 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-5">
                        <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${option.color} rounded-full filter blur-3xl`}></div>
                      </div>

                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                          <div className={`bg-gradient-to-br ${option.color} rounded-full p-4`}>
                            <Icon className="w-10 h-10 text-white" />
                          </div>
                          <motion.svg
                            className="w-8 h-8 text-gray-400 opacity-70 group-hover:opacity-100 group-hover:text-sky-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            animate={{ x: [0, 4, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </motion.svg>
                        </div>

                        <h2
                          className="text-2xl font-bold text-white mb-3"
                          style={{ fontFamily: 'var(--font-headline)' }}
                        >
                          {option.title}
                        </h2>

                        <p
                          className="text-gray-300 text-base leading-relaxed mb-4 font-normal"
                          style={{ fontFamily: 'var(--font-body)' }}
                        >
                          {option.description}
                        </p>

                        <div className="space-y-2">
                          {option.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-sky-500/30 flex items-center justify-center flex-shrink-0">
                                <span className="text-sky-400 text-xs">✓</span>
                              </div>
                              <p className="text-gray-400 text-sm font-normal" style={{ fontFamily: 'var(--font-body)' }}>
                                {feature}
                              </p>
                            </div>
                          ))}
                        </div>

                        <motion.div
                          className={`mt-6 inline-flex items-center gap-2 bg-gradient-to-r ${option.color} text-white px-5 py-2.5 rounded-full font-semibold text-sm`}
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
      <section className="px-4 md:px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              Why Choose HalalMe Travel?
            </h2>
            <p
              className="text-lg md:text-xl text-gray-400 font-normal"
              style={{ fontFamily: 'var(--font-body)' }}
            >
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
                  whileHover={{ y: -8 }}
                  className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-sky-500 transition-all"
                >
                  <div
                    className={`bg-gradient-to-br ${feature.color} rounded-xl p-4 mb-4 inline-block`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3
                    className="text-xl font-bold text-white mb-2"
                    style={{ fontFamily: 'var(--font-headline)' }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className="text-gray-400 font-normal"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="px-4 md:px-6 py-16 md:py-20 bg-gradient-to-r from-sky-900/20 to-cyan-900/20">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              Popular Destinations
            </h2>
            <p
              className="text-lg md:text-xl text-gray-400 font-normal"
              style={{ fontFamily: 'var(--font-body)' }}
            >
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
                    className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                  >
                    {/* Background Image */}
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                      style={{ backgroundImage: `url(${destination.image})` }}
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-sky-400" />
                        <span className="text-sky-400 text-sm font-semibold">{destination.country}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
                        {destination.city}
                      </h3>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-300">
                          <Plane className="w-4 h-4 inline mr-1" />
                          From £{destination.flightPriceFrom}
                        </span>
                        <span className="text-gray-300">
                          <Building2 className="w-4 h-4 inline mr-1" />
                          From £{destination.hotelPriceFrom}/night
                        </span>
                      </div>
                      {/* Halal Score */}
                      <div className="flex items-center gap-1 mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < destination.halalScore ? 'text-sky-400 fill-sky-400' : 'text-gray-600'}`}
                          />
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
      <section className="px-4 md:px-6 py-16 md:py-20">
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
                <h3
                  className="text-3xl md:text-4xl font-bold text-white mb-2"
                  style={{ fontFamily: 'var(--font-headline)' }}
                >
                  {stat.value}
                </h3>
                <p
                  className="text-gray-400 font-normal"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Muslim Travel Guide CTA */}
      <section className="px-4 md:px-6 py-16 md:py-20 bg-gradient-to-r from-sky-900/30 to-cyan-900/30">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gray-800 rounded-3xl p-8 md:p-12 border border-gray-700"
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-sky-500/20 border border-sky-500/30 rounded-full px-4 py-2 mb-4">
                  <Compass className="w-4 h-4 text-sky-400" />
                  <span className="text-sky-300 text-sm font-semibold">Muslim Travel Guide</span>
                </div>
                <h2
                  className="text-3xl md:text-4xl font-bold text-white mb-4"
                  style={{ fontFamily: 'var(--font-headline)' }}
                >
                  Plan Your Halal-Friendly Trip
                </h2>
                <p
                  className="text-gray-300 text-lg mb-6 font-normal"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  Discover mosques, halal restaurants, and Muslim-friendly attractions in cities around the world. Our comprehensive guides help you travel with confidence.
                </p>
                <div className="flex flex-wrap gap-3">
                  <motion.button
                    onClick={() => router.push('/travel/guide')}
                    className="bg-gradient-to-r from-sky-600 via-cyan-500 to-cyan-600 text-white px-6 py-3 rounded-full font-semibold"
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
      <section className="px-4 md:px-6 py-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Globe className="w-16 h-16 text-sky-400 mx-auto mb-6" />
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              Ready to Explore the World?
            </h2>
            <p
              className="text-lg md:text-xl text-gray-400 mb-8 font-normal"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Compare prices from hundreds of travel sites and find your perfect halal-friendly trip.
            </p>
            <motion.button
              onClick={() => router.push('/travel/flights')}
              className="bg-gradient-to-r from-sky-600 via-cyan-500 to-cyan-600 text-white px-10 py-5 rounded-full font-bold text-xl shadow-2xl"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 25px 50px -12px rgba(14, 165, 233, 0.6)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              Start Searching
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="px-4 md:px-6 pb-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-gray-500 text-sm" style={{ fontFamily: 'var(--font-body)' }}>
            Prices displayed are provided by our travel partners. HalalMe Travel is a comparison service —
            all bookings are completed on partner websites. We do not process payments or store booking information.
          </p>
        </div>
      </section>

      {/* Back Links */}
      <section className="px-4 md:px-6 pb-16">
        <div className="mx-auto max-w-4xl text-center flex justify-center gap-6">
          <Link
            href="/rewards"
            className="text-gray-400 hover:text-sky-400 transition-colors text-sm font-semibold"
          >
            ← Rewards
          </Link>
          <Link
            href="/kitchen"
            className="text-gray-400 hover:text-sky-400 transition-colors text-sm font-semibold"
          >
            Kitchen →
          </Link>
        </div>
      </section>
    </div>
  );
}

