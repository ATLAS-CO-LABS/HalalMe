"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Users,
  Heart,
  MessageCircle,
  Share2,
  ChefHat,
  TrendingUp,
  Globe,
  ArrowRight,
} from "lucide-react";

export default function HubLandingPage() {
  const router = useRouter();

  const features = [
    { icon: Users, title: "Join the Community", description: "Connect with food lovers from around the world" },
    { icon: ChefHat, title: "Share Your Recipes", description: "Showcase your culinary creations to thousands" },
    { icon: Heart, title: "Like & Comment", description: "Engage with posts and build connections" },
    { icon: TrendingUp, title: "Discover Trending", description: "Find the most popular halal recipes daily" },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] max-h-[900px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1543269865-cbf427effbad?w=1920&auto=format&fit=crop&q=80"
            alt="Halal food community"
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
              className="inline-flex items-center gap-2.5 bg-amber-500/15 border border-amber-400/25 backdrop-blur-md rounded-full px-5 py-2.5 mb-5 sm:mb-8"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-300 text-sm font-semibold tracking-wide">Welcome to HalalMe Hub</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] mb-6 tracking-tight"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Share. Connect.{" "}
              <span className="relative inline-block">
                <span className="text-amber-400">Inspire.</span>
                <motion.span
                  className="absolute -bottom-1 left-0 right-0 h-1 bg-amber-500 rounded-full origin-left"
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
              style={{ fontFamily: "var(--font-body)" }}
            >
              Join thousands of food lovers sharing recipes, posting food pictures, and building a vibrant halal food community.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.65 }}
              className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-12 sm:mb-14"
            >
              <motion.button
                onClick={() => router.push("/select-role")}
                whileHover={{ scale: 1.04, boxShadow: "0 20px 50px -12px rgba(245,158,11,0.5)" }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto px-8 py-4 md:px-10 md:py-5 bg-amber-500 text-gray-900 font-bold text-lg rounded-full shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2.5"
              >
                Sign Up & Join Hub
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                onClick={() => router.push("/hub/feed")}
                whileHover={{ scale: 1.04, backgroundColor: "rgba(255,255,255,0.12)" }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto px-8 py-4 md:px-10 md:py-5 bg-white/8 border border-white/20 backdrop-blur-sm text-white font-bold text-lg rounded-full hover:border-white/40 transition-all"
              >
                Explore Feed
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="flex flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm"
            >
              {[
                { icon: Users, text: "10K+ Members" },
                { icon: Globe, text: "Global Community" },
                { icon: TrendingUp, text: "Daily Content" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-400">
                  <item.icon className="w-4 h-4 text-amber-400" />
                  <span>{item.text}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-amber-400 rounded-full" />
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
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-headline)" }}>
              Why Join HalalMe <span className="text-amber-400">Hub?</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-400" style={{ fontFamily: "var(--font-body)" }}>
              More than just a platform — it&apos;s your food community
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
                  className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-amber-500/40 transition-all shadow-sm hover:shadow-md"
                >
                  <div className="bg-amber-500 rounded-xl p-4 mb-4 inline-block shadow-md">
                    <Icon className="w-8 h-8 text-gray-900" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-headline)" }}>
                    {feature.title}
                  </h3>
                  <p className="text-gray-400" style={{ fontFamily: "var(--font-body)" }}>
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* What You Can Do Section */}
      <section className="px-4 md:px-6 py-16 md:py-20 bg-gray-900">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-headline)" }}>
              What You <span className="text-amber-400">Can Do</span>
            </h2>
            <p className="text-lg text-gray-400" style={{ fontFamily: "var(--font-body)" }}>
              Everything you need to share your culinary journey
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Share2, title: "Share Posts", description: "Upload food pictures, share recipes, and tell your cooking stories with the community" },
              { icon: Heart, title: "Engage & Connect", description: "Like, comment, and interact with posts from fellow food lovers around the world" },
              { icon: MessageCircle, title: "Build Community", description: "Follow your favorite creators, get followers, and build your own food community" },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-amber-500/40 transition-all text-center shadow-sm hover:shadow-md"
              >
                <div className="bg-amber-500 w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center shadow-md">
                  <item.icon className="w-8 h-8 text-gray-900" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-headline)" }}>
                  {item.title}
                </h3>
                <p className="text-gray-400" style={{ fontFamily: "var(--font-body)" }}>
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 md:px-6 py-16 bg-amber-500/5 border-y border-amber-500/10">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Active Users", value: "10K+" },
              { label: "Recipes Shared", value: "5K+" },
              { label: "Daily Posts", value: "500+" },
              { label: "Countries", value: "50+" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-headline)" }}>
                  {stat.value}
                </h3>
                <p className="text-gray-400" style={{ fontFamily: "var(--font-body)" }}>{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 md:px-6 py-16 md:py-20 bg-gray-950">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Globe className="w-16 h-16 text-amber-400 mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-headline)" }}>
              Ready to <span className="text-amber-400">Join?</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-400 mb-8" style={{ fontFamily: "var(--font-body)" }}>
              Create your account and start sharing your culinary journey today.
            </p>
            <motion.button
              onClick={() => router.push("/select-role")}
              className="bg-amber-500 text-gray-900 px-10 py-5 rounded-full font-bold text-xl shadow-xl shadow-amber-500/20"
              whileHover={{ scale: 1.05, boxShadow: "0 25px 50px -12px rgba(245,158,11,0.5)" }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started Now
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Back Links */}
      <section className="px-4 md:px-6 pb-12 bg-gray-950">
        <div className="mx-auto max-w-4xl text-center flex justify-center gap-6">
          <Link href="/kitchen" className="text-gray-400 hover:text-amber-400 transition-colors text-sm font-semibold">← Kitchen</Link>
          <Link href="/rewards" className="text-gray-400 hover:text-amber-400 transition-colors text-sm font-semibold">Rewards →</Link>
        </div>
      </section>
    </div>
  );
}
