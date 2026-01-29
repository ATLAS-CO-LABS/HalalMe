"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Gift,
  Star,
  Trophy,
  Heart,
  Calendar,
  TrendingUp,
  Award,
  Lock,
} from "lucide-react";
import Header from "@/components/layout/Header";

// Sample user rewards data (would come from API/database in real app)
const userRewards = {
  totalPoints: 450,
  totalDonated: 45,
  donationCount: 3,
  currentLevel: "Bronze",
  nextLevel: "Silver",
  pointsToNextLevel: 550,
  badges: [
    {
      id: "first-giver",
      name: "First Giver",
      description: "Made your first donation",
      earned: true,
      icon: Heart,
      color: "from-pink-500 to-rose-500",
    },
    {
      id: "consistent",
      name: "Consistent Giver",
      description: "Donated 5 times",
      earned: false,
      icon: Calendar,
      color: "from-blue-500 to-indigo-500",
      progress: "3/5",
    },
    {
      id: "generous",
      name: "Generous Heart",
      description: "Donated £100 total",
      earned: false,
      icon: Gift,
      color: "from-purple-500 to-violet-500",
      progress: "£45/£100",
    },
    {
      id: "champion",
      name: "Charity Champion",
      description: "Reached Gold status",
      earned: false,
      icon: Trophy,
      color: "from-yellow-500 to-amber-500",
      progress: "Bronze",
    },
  ],
  recentDonations: [
    {
      id: "1",
      charityName: "Water for All",
      amount: 20,
      points: 200,
      date: "2024-01-15",
    },
    {
      id: "2",
      charityName: "Feed the Hungry",
      amount: 15,
      points: 150,
      date: "2024-01-10",
    },
    {
      id: "3",
      charityName: "Education for Hope",
      amount: 10,
      points: 100,
      date: "2024-01-05",
    },
  ],
};

const levels = [
  { name: "Bronze", minPoints: 0, color: "from-amber-700 to-amber-800" },
  { name: "Silver", minPoints: 1000, color: "from-gray-400 to-gray-500" },
  { name: "Gold", minPoints: 5000, color: "from-yellow-500 to-yellow-600" },
  { name: "Platinum", minPoints: 10000, color: "from-cyan-400 to-cyan-500" },
];

export default function MyRewardsPage() {
  const currentLevelIndex = levels.findIndex(
    (l) => l.name === userRewards.currentLevel
  );
  const progressToNextLevel =
    currentLevelIndex < levels.length - 1
      ? ((userRewards.totalPoints - levels[currentLevelIndex].minPoints) /
          (levels[currentLevelIndex + 1].minPoints -
            levels[currentLevelIndex].minPoints)) *
        100
      : 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-emerald-950 to-gray-900">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-8 md:pt-32 md:pb-12 px-4 md:px-6">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600 rounded-full filter blur-3xl opacity-10"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-600 rounded-full filter blur-3xl opacity-10"></div>
        </div>

        <div className="mx-auto max-w-5xl relative z-10">
          <Link
            href="/rewards"
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-semibold">Back to Rewards</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              My{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Rewards
              </span>
            </h1>
            <p
              className="text-lg text-gray-400 font-normal"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Track your donations, points, and badges
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="px-4 md:px-6 pb-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Total Points",
                value: userRewards.totalPoints,
                icon: Star,
                color: "text-emerald-400",
              },
              {
                label: "Total Donated",
                value: `£${userRewards.totalDonated}`,
                icon: Heart,
                color: "text-pink-400",
              },
              {
                label: "Donations Made",
                value: userRewards.donationCount,
                icon: Gift,
                color: "text-purple-400",
              },
              {
                label: "Current Level",
                value: userRewards.currentLevel,
                icon: Trophy,
                color: "text-amber-400",
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-gray-800 rounded-xl p-5 border border-gray-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <p
                  className="text-2xl font-bold text-white"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  {stat.value}
                </p>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Level Progress */}
      <section className="px-4 md:px-6 pb-8">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-xl font-bold text-white"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                Level Progress
              </h2>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">
                  {userRewards.pointsToNextLevel} points to{" "}
                  {userRewards.nextLevel}
                </span>
              </div>
            </div>

            {/* Level Bar */}
            <div className="relative mb-6">
              <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToNextLevel}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>

              {/* Level Markers */}
              <div className="flex justify-between mt-2">
                {levels.map((level, index) => (
                  <div key={level.name} className="text-center">
                    <div
                      className={`w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center ${
                        index <= currentLevelIndex
                          ? `bg-gradient-to-br ${level.color}`
                          : "bg-gray-700"
                      }`}
                    >
                      {index <= currentLevelIndex ? (
                        <Star className="w-4 h-4 text-white" />
                      ) : (
                        <Lock className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                    <p
                      className={`text-xs font-semibold ${
                        index <= currentLevelIndex
                          ? "text-white"
                          : "text-gray-500"
                      }`}
                    >
                      {level.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Badges Section */}
      <section className="px-4 md:px-6 pb-8">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h2
              className="text-2xl font-bold text-white mb-6"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Badges
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {userRewards.badges.map((badge, index) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                  className={`bg-gray-800 rounded-xl p-5 border ${
                    badge.earned
                      ? "border-emerald-500"
                      : "border-gray-700 opacity-60"
                  } relative overflow-hidden`}
                >
                  {badge.earned && (
                    <div className="absolute top-2 right-2">
                      <Award className="w-5 h-5 text-emerald-400" />
                    </div>
                  )}

                  <div
                    className={`w-14 h-14 rounded-full mb-4 flex items-center justify-center ${
                      badge.earned
                        ? `bg-gradient-to-br ${badge.color}`
                        : "bg-gray-700"
                    }`}
                  >
                    <badge.icon
                      className={`w-7 h-7 ${
                        badge.earned ? "text-white" : "text-gray-500"
                      }`}
                    />
                  </div>

                  <h3
                    className="text-lg font-bold text-white mb-1"
                    style={{ fontFamily: "var(--font-headline)" }}
                  >
                    {badge.name}
                  </h3>
                  <p
                    className="text-gray-400 text-sm mb-2 font-normal"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {badge.description}
                  </p>

                  {badge.earned ? (
                    <span className="text-emerald-400 text-sm font-semibold">
                      Earned
                    </span>
                  ) : (
                    <span className="text-gray-500 text-sm">
                      Progress: {badge.progress}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Recent Donations */}
      <section className="px-4 md:px-6 pb-16">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-2xl font-bold text-white"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                Recent Donations
              </h2>
              <Link
                href="/rewards/causes"
                className="text-emerald-400 hover:text-emerald-300 font-semibold text-sm"
              >
                Donate More →
              </Link>
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              {userRewards.recentDonations.length > 0 ? (
                <div className="divide-y divide-gray-700">
                  {userRewards.recentDonations.map((donation, index) => (
                    <motion.div
                      key={donation.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                      className="p-4 flex items-center justify-between hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-600/30 to-teal-600/30 rounded-lg flex items-center justify-center">
                          <Heart className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-white font-semibold">
                            {donation.charityName}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {new Date(donation.date).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">
                          £{donation.amount}
                        </p>
                        <p className="text-emerald-400 text-sm">
                          +{donation.points} pts
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Heart className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">No donations yet</p>
                  <Link
                    href="/rewards/causes"
                    className="text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    Make your first donation →
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
