'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Bell, ArrowLeft, Plus, Target } from 'lucide-react';
import Header from '@/components/layout/Header';
import { PriceAlertCard } from '@/components/travel/my-trips';
import { mockPriceAlerts, type PriceAlert } from '@/data/travelMockData';

export default function PriceAlertsPage() {
  const [alerts, setAlerts] = useState<PriceAlert[]>(mockPriceAlerts);

  const handleToggle = (id: string, isActive: boolean) => {
    setAlerts((prev) =>
      prev.map((alert) => (alert.id === id ? { ...alert, isActive } : alert))
    );
  };

  const handleDelete = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const activeCount = alerts.filter((a) => a.isActive).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-sky-950 to-gray-900">
      <Header />

      {/* Hero Section */}
      <section className="pt-24 pb-8 md:pt-32 md:pb-12 px-4 md:px-6">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/travel/my-trips"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-sky-400 text-sm mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Trips
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-cyan-600 to-teal-600 p-3 rounded-xl">
                  <Bell className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1
                    className="text-3xl md:text-4xl font-extrabold text-white"
                    style={{ fontFamily: 'var(--font-headline)' }}
                  >
                    Price Alerts
                  </h1>
                  <p className="text-gray-400">Get notified when prices drop to your target</p>
                </div>
              </div>

              <motion.button
                className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-sky-600 to-cyan-600 text-white px-4 py-2 rounded-full font-semibold text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-4 h-4" />
                Create Alert
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 md:px-6 pb-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <p className="text-gray-400 text-sm">Total Alerts</p>
              <p className="text-2xl font-bold text-white">{alerts.length}</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <p className="text-gray-400 text-sm">Active Alerts</p>
              <p className="text-2xl font-bold text-emerald-400">{activeCount}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Alerts List */}
      <section className="px-4 md:px-6 py-8">
        <div className="mx-auto max-w-5xl">
          {alerts.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {alerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <PriceAlertCard
                    alert={alert}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700">
              <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-white font-semibold text-xl mb-2">No price alerts</h3>
              <p className="text-gray-400 mb-4">
                Set up alerts to get notified when prices drop on your favorite routes.
              </p>
              <Link href="/travel/flights">
                <motion.button
                  className="bg-gradient-to-r from-sky-600 to-cyan-600 text-white px-6 py-3 rounded-full font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Search & Create Alert
                </motion.button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 md:px-6 py-8 bg-gradient-to-r from-sky-900/20 to-cyan-900/20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-white font-bold mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-sky-400" />
            How Price Alerts Work
          </h2>
          <div className="grid sm:grid-cols-4 gap-4">
            {[
              { step: '1', title: 'Search', desc: 'Find your ideal trip' },
              { step: '2', title: 'Set Target', desc: 'Choose your target price' },
              { step: '3', title: 'Monitor', desc: 'We track prices daily' },
              { step: '4', title: 'Get Notified', desc: 'Alert when price drops' },
            ].map((item) => (
              <div key={item.step} className="bg-gray-800/50 rounded-xl p-4 text-center">
                <div className="w-10 h-10 bg-sky-600 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-3">
                  {item.step}
                </div>
                <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile Create Button */}
      <section className="px-4 md:px-6 py-8 sm:hidden">
        <div className="mx-auto max-w-5xl">
          <motion.button
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-cyan-600 text-white py-3 rounded-full font-semibold"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-5 h-5" />
            Create New Alert
          </motion.button>
        </div>
      </section>

      {/* Back Link */}
      <section className="px-4 md:px-6 py-12">
        <div className="mx-auto max-w-4xl text-center">
          <Link
            href="/travel/my-trips"
            className="text-gray-400 hover:text-sky-400 transition-colors text-sm font-semibold"
          >
            ← Back to My Trips
          </Link>
        </div>
      </section>
    </div>
  );
}
