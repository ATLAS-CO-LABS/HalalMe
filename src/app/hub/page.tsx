"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Heart,
  MessageCircle,
  Share2,
  Sparkles,
  ChefHat,
  TrendingUp,
  Globe,
} from "lucide-react";
import Header from "@/components/layout/Header";

export default function HubLandingPage() {
  const router = useRouter();

  const features = [
    {
      icon: Users,
      title: "Join the Community",
      description: "Connect with food lovers from around the world",
      color: "from-amber-500 to-amber-600",
    },
    {
      icon: ChefHat,
      title: "Share Your Recipes",
      description: "Showcase your culinary creations to thousands",
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: Heart,
      title: "Like & Comment",
      description: "Engage with posts and build connections",
      color: "from-yellow-500 to-yellow-600",
    },
    {
      icon: TrendingUp,
      title: "Discover Trending",
      description: "Find the most popular halal recipes daily",
      color: "from-amber-600 to-amber-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-amber-950 to-gray-900">
      {/* Main Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24 px-4 md:px-6">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-600 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-600 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        </div>

        <div className="mx-auto max-w-5xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-full px-4 py-2 mb-6"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300 text-sm font-semibold">
                Welcome to HalalMe Hub
              </span>
            </motion.div>

            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Share. Connect.{" "}
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                Inspire.
              </span>
            </h1>

            <p
              className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed font-normal"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Join thousands of food lovers sharing recipes, posting food
              pictures, and building a vibrant halal food community.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                onClick={() => router.push("/select-role")}
                className="w-full sm:w-auto bg-gradient-to-r from-amber-600 via-orange-500 to-orange-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-2xl"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 20px 40px -10px rgba(245, 158, 11, 0.6)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Sign Up & Join Hub
              </motion.button>

              <motion.button
                onClick={() => router.push("/hub/feed")}
                className="w-full sm:w-auto bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-full font-bold text-lg border-2 border-gray-700 hover:border-amber-500 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Explore Feed
              </motion.button>
            </div>

            <p
              className="text-gray-500 text-sm mt-6 font-normal"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-amber-400 hover:text-amber-300 font-semibold underline"
              >
                Log in here
              </Link>
            </p>
          </motion.div>
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
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Why Join HalalMe Hub?
            </h2>
            <p
              className="text-lg md:text-xl text-gray-400 font-normal"
              style={{ fontFamily: "var(--font-body)" }}
            >
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
                  whileHover={{ y: -8 }}
                  className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-amber-500 transition-all"
                >
                  <div
                    className={`bg-gradient-to-br ${feature.color} rounded-xl p-4 mb-4 inline-block`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3
                    className="text-xl font-bold text-white mb-2"
                    style={{ fontFamily: "var(--font-headline)" }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className="text-gray-400 font-normal"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* What You Can Do Section */}
      <section className="px-4 md:px-6 py-16 md:py-20 bg-gradient-to-r from-amber-900/20 to-orange-900/20">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2
              className="text-3xl sm:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              What You Can Do
            </h2>
            <p
              className="text-lg text-gray-400 font-normal"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Everything you need to share your culinary journey
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Share2,
                title: "Share Posts",
                description:
                  "Upload food pictures, share recipes, and tell your cooking stories with the community",
              },
              {
                icon: Heart,
                title: "Engage & Connect",
                description:
                  "Like, comment, and interact with posts from fellow food lovers around the world",
              },
              {
                icon: MessageCircle,
                title: "Build Community",
                description:
                  "Follow your favorite creators, get followers, and build your own food community",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-amber-500 transition-all text-center"
              >
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3
                  className="text-xl font-bold text-white mb-3"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-gray-400 font-normal"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 md:px-6 py-16 md:py-20 bg-gradient-to-r from-amber-900/30 to-orange-900/30">
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
                <h3
                  className="text-3xl md:text-4xl font-bold text-white mb-2"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  {stat.value}
                </h3>
                <p
                  className="text-gray-400 font-normal"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
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
            <Globe className="w-16 h-16 text-amber-400 mx-auto mb-6" />
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Ready to Join?
            </h2>
            <p
              className="text-lg md:text-xl text-gray-400 mb-8 font-normal"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Create your account and start sharing your culinary journey today.
            </p>
            <motion.button
              onClick={() => router.push("/select-role")}
              className="bg-gradient-to-r from-amber-600 via-orange-500 to-orange-600 text-white px-10 py-5 rounded-full font-bold text-xl shadow-2xl"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 25px 50px -12px rgba(245, 158, 11, 0.6)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started Now
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Back Links */}
      <section className="px-4 md:px-6 pb-16">
        <div className="mx-auto max-w-4xl text-center flex justify-center gap-6">
          <Link
            href="/kitchen"
            className="text-gray-400 hover:text-amber-400 transition-colors text-sm font-semibold"
          >
            ← Kitchen
          </Link>
          <Link
            href="/rewards"
            className="text-gray-400 hover:text-amber-400 transition-colors text-sm font-semibold"
          >
            Rewards →
          </Link>
        </div>
      </section>
    </div>
  );
}
