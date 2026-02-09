"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Heart,
  HandHeart,
  Gift,
  Star,
  Globe,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function RewardsLandingPage() {
  const router = useRouter();

  const features = [
    {
      icon: HandHeart,
      title: "Give Sadaqah",
      description: "Support meaningful causes and earn rewards",
      color: "from-emerald-500 to-emerald-600",
    },
    {
      icon: Gift,
      title: "Earn Rewards",
      description: "Get points, badges, and exclusive benefits",
      color: "from-teal-500 to-teal-600",
    },
    {
      icon: Star,
      title: "Level Up",
      description: "Unlock Bronze, Silver, Gold, and Platinum status",
      color: "from-amber-500 to-amber-600",
    },
    {
      icon: TrendingUp,
      title: "Track Impact",
      description: "See how your donations make a difference",
      color: "from-cyan-500 to-cyan-600",
    },
  ];

  const impactStats = [
    { label: "Total Donated", value: "£50K+" },
    { label: "Causes Supported", value: "25+" },
    { label: "Active Donors", value: "2K+" },
    { label: "Countries Reached", value: "30+" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-emerald-950 to-gray-900">
      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] max-h-[900px] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1920&auto=format&fit=crop&q=80"
            alt="Charity and giving"
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
        <div className="absolute bottom-0 left-1/4 w-[420px] h-[420px] bg-emerald-600/12 rounded-full blur-3xl z-[1]" />
        <div className="absolute top-1/3 right-0 w-[280px] h-[280px] bg-teal-500/8 rounded-full blur-3xl z-[1]" />

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 pt-20">
          <div className="max-w-3xl">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2.5 bg-emerald-500/15 border border-emerald-400/25 backdrop-blur-md rounded-full px-5 py-2.5 mb-5 sm:mb-8"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-300 text-sm font-semibold tracking-wide">
                Donate Good. Feel Good. Get Rewarded.
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] mb-6 tracking-tight"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              HalalMe{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  Rewards
                </span>
                <motion.span
                  className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full origin-left"
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
              className="text-base sm:text-lg md:text-xl text-gray-300/90 max-w-xl leading-relaxed mb-6 sm:mb-10"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Give charity, earn rewards, and make a real impact. Support causes
              you care about while unlocking exclusive benefits within HalalMe.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.65 }}
              className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-12 sm:mb-14"
            >
              <motion.button
                onClick={() => router.push("/rewards/causes")}
                whileHover={{ scale: 1.04, boxShadow: "0 20px 50px -12px rgba(16,185,129,0.5)" }}
                whileTap={{ scale: 0.97 }}
                className="group relative w-full sm:w-auto px-8 py-4 md:px-10 md:py-5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-lg rounded-full shadow-xl shadow-emerald-600/25 overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2.5">
                  Start Donating
                  <ArrowRight className="w-5 h-5" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </motion.button>

              <motion.button
                onClick={() => router.push("/rewards/my-rewards")}
                whileHover={{ scale: 1.04, backgroundColor: "rgba(255,255,255,0.12)" }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto px-8 py-4 md:px-10 md:py-5 bg-white/8 border border-white/20 backdrop-blur-sm text-white font-bold text-lg rounded-full hover:border-white/40 transition-all"
              >
                View My Rewards
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
                { icon: ShieldCheck, text: "Verified Causes", color: "text-emerald-400" },
                { icon: HandHeart, text: "\u00A350K+ Donated", color: "text-teal-400" },
                { icon: Gift, text: "Instant Rewards", color: "text-emerald-400" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-400">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span>{item.text}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-emerald-400 rounded-full" />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-4 md:px-6 py-16 md:py-20 bg-gradient-to-r from-emerald-900/20 to-teal-900/20">
        <div className="mx-auto max-w-5xl">
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
              How It Works
            </h2>
            <p
              className="text-lg md:text-xl text-gray-400 font-normal"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Simple steps to give and get rewarded
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Choose a Cause",
                description:
                  "Browse through verified charity causes and select one that resonates with you",
                icon: Heart,
              },
              {
                step: "2",
                title: "Make a Donation",
                description:
                  "Donate any amount — £5, £10, £20, or a custom amount of your choice",
                icon: HandHeart,
              },
              {
                step: "3",
                title: "Earn Rewards",
                description:
                  "Receive points, unlock badges, and level up your contribution status",
                icon: Gift,
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative"
              >
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-emerald-500 transition-all h-full">
                  <div className="absolute -top-4 left-8 bg-gradient-to-r from-emerald-500 to-teal-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                    {item.step}
                  </div>
                  <div className="mt-4">
                    <item.icon className="w-12 h-12 text-emerald-400 mb-4" />
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
                  </div>
                </div>
              </motion.div>
            ))}
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
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Why Give Through HalalMe?
            </h2>
            <p
              className="text-lg md:text-xl text-gray-400 font-normal"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Charity that rewards you for doing good
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
                  className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-emerald-500 transition-all"
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

      {/* Impact Stats Section */}
      <section className="px-4 md:px-6 py-16 md:py-20 bg-gradient-to-r from-emerald-900/30 to-teal-900/30">
        <div className="mx-auto max-w-5xl">
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
              Our Collective Impact
            </h2>
            <p
              className="text-lg text-gray-400 font-normal"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Together, the HalalMe community is making a difference
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {impactStats.map((stat, index) => (
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

      {/* Rewards Tiers Preview */}
      <section className="px-4 md:px-6 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
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
              Contribution Levels
            </h2>
            <p
              className="text-lg text-gray-400 font-normal"
              style={{ fontFamily: "var(--font-body)" }}
            >
              The more you give, the more you unlock
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                level: "Bronze",
                requirement: "£25+",
                color: "from-amber-700 to-amber-800",
                borderColor: "border-amber-600",
              },
              {
                level: "Silver",
                requirement: "£100+",
                color: "from-gray-400 to-gray-500",
                borderColor: "border-gray-400",
              },
              {
                level: "Gold",
                requirement: "£500+",
                color: "from-yellow-500 to-yellow-600",
                borderColor: "border-yellow-500",
              },
              {
                level: "Platinum",
                requirement: "£1000+",
                color: "from-cyan-400 to-cyan-500",
                borderColor: "border-cyan-400",
              },
            ].map((tier, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className={`bg-gray-800/50 rounded-2xl p-6 border-2 ${tier.borderColor} text-center`}
              >
                <div
                  className={`bg-gradient-to-br ${tier.color} w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center`}
                >
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3
                  className="text-xl font-bold text-white mb-2"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  {tier.level}
                </h3>
                <p
                  className="text-gray-400 font-normal"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {tier.requirement} donated
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
            <Globe className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Ready to Make a Difference?
            </h2>
            <p
              className="text-lg md:text-xl text-gray-400 mb-8 font-normal"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Start your giving journey today and earn rewards while supporting
              causes that matter.
            </p>
            <motion.button
              onClick={() => router.push("/rewards/causes")}
              className="bg-gradient-to-r from-emerald-600 via-teal-500 to-teal-600 text-white px-10 py-5 rounded-full font-bold text-xl shadow-2xl"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 25px 50px -12px rgba(16, 185, 129, 0.6)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              Browse Causes
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Back Links */}
      <section className="px-4 md:px-6 pb-16">
        <div className="mx-auto max-w-4xl text-center flex justify-center gap-6">
          <Link
            href="/kitchen"
            className="text-gray-400 hover:text-emerald-400 transition-colors text-sm font-semibold"
          >
            ← Kitchen
          </Link>
          <Link
            href="/hub"
            className="text-gray-400 hover:text-emerald-400 transition-colors text-sm font-semibold"
          >
            Hub →
          </Link>
        </div>
      </section>
    </div>
  );
}
