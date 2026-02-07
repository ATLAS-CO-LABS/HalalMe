'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CheckCircle,
  Package,
  Clock,
  MapPin,
  ArrowRight,
  Leaf,
  Home,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OrderSuccessPage() {
  const router = useRouter();
  const [orderNumber] = useState(() =>
    `HMF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`
  );

  useEffect(() => {
    // Trigger confetti on mount
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ['#84cc16', '#22c55e', '#4ade80'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-lime-950 to-gray-900">
      {/* Main Content */}
      <section className="pt-24 pb-16 px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="mb-8"
            >
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-lime-500 rounded-full blur-2xl opacity-30 animate-pulse" />
                <div className="relative bg-gradient-to-br from-lime-500 to-green-500 rounded-full p-6">
                  <CheckCircle className="w-16 h-16 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-bold text-white mb-4"
            >
              Order Placed Successfully!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-400 text-lg mb-8"
            >
              Thank you for your order. Your fresh halal meals are being prepared!
            </motion.p>

            {/* Order Number */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-800 rounded-2xl border border-gray-700 p-6 mb-8"
            >
              <p className="text-gray-400 text-sm mb-2">Order Number</p>
              <p className="text-2xl font-bold text-lime-400 font-mono">{orderNumber}</p>
            </motion.div>
          </motion.div>

          {/* Order Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-800 rounded-2xl border border-gray-700 p-6 mb-8"
          >
            <h2 className="text-xl font-bold text-white mb-6 text-left">What's Next?</h2>

            <div className="space-y-6">
              {[
                {
                  icon: Sparkles,
                  title: 'Order Confirmed',
                  description: 'We have received your order',
                  status: 'completed',
                },
                {
                  icon: Package,
                  title: 'Preparing Your Meals',
                  description: 'Our kitchen is preparing your fresh meals',
                  status: 'current',
                },
                {
                  icon: Clock,
                  title: 'Out for Delivery',
                  description: 'Your order will be on its way soon',
                  status: 'pending',
                },
                {
                  icon: MapPin,
                  title: 'Delivered',
                  description: 'Enjoy your delicious halal meals!',
                  status: 'pending',
                },
              ].map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          step.status === 'completed'
                            ? 'bg-green-500'
                            : step.status === 'current'
                            ? 'bg-lime-500'
                            : 'bg-gray-700'
                        }`}
                      >
                        {step.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-white" />
                        ) : (
                          <Icon
                            className={`w-5 h-5 ${
                              step.status === 'current' ? 'text-gray-900' : 'text-gray-500'
                            }`}
                          />
                        )}
                      </div>
                      {index < 3 && (
                        <div
                          className={`w-0.5 h-8 ${
                            step.status === 'completed' ? 'bg-green-500' : 'bg-gray-700'
                          }`}
                        />
                      )}
                    </div>
                    <div className="text-left flex-1 pb-2">
                      <h3
                        className={`font-semibold ${
                          step.status === 'pending' ? 'text-gray-500' : 'text-white'
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p className="text-gray-400 text-sm">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Halal Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-lime-500/10 border border-lime-500/30 rounded-xl p-4 mb-8 flex items-center gap-3 justify-center"
          >
            <Leaf className="w-6 h-6 text-lime-400" />
            <p className="text-lime-300">
              Your meals are 100% halal certified and prepared with care
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              onClick={() => router.push('/fresh')}
              className="bg-lime-500 hover:bg-lime-400 text-gray-900 px-8 py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingBag className="w-5 h-5" />
              Order More
            </motion.button>
            <motion.button
              onClick={() => router.push('/')}
              className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-colors border border-gray-600"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Home className="w-5 h-5" />
              Back to Home
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Info Section */}
      <section className="px-4 md:px-6 pb-16">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-gray-800/50 rounded-2xl p-6 text-center"
          >
            <p className="text-gray-400 text-sm">
              A confirmation email has been sent to your email address.
              <br />
              If you have any questions, please contact our support team.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Back Links */}
      <section className="px-4 md:px-6 pb-16">
        <div className="mx-auto max-w-4xl text-center flex justify-center gap-6">
          <Link
            href="/fresh"
            className="text-gray-400 hover:text-lime-400 transition-colors text-sm font-semibold"
          >
            ← Back to Fresh
          </Link>
          <Link
            href="/"
            className="text-gray-400 hover:text-lime-400 transition-colors text-sm font-semibold"
          >
            Home →
          </Link>
        </div>
      </section>
    </div>
  );
}
