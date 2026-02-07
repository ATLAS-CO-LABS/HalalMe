'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ArrowRight,
  Leaf,
  ShoppingBag,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const router = useRouter();
  const { items, removeFromCart, updateQuantity, totalItems, totalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-lime-950 to-gray-900 pt-24 px-4">
        <div className="mx-auto max-w-2xl text-center py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ShoppingBag className="w-24 h-24 text-gray-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-4">Your cart is empty</h1>
            <p className="text-gray-400 mb-8">
              Looks like you haven't added any meals yet. Browse our fresh selection!
            </p>
            <motion.button
              onClick={() => router.push('/fresh')}
              className="bg-lime-500 hover:bg-lime-400 text-gray-900 px-8 py-4 rounded-full font-bold inline-flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5" />
              Browse Meals
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-lime-950 to-gray-900">
      {/* Header */}
      <section className="pt-24 pb-8 px-4 md:px-6">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <ShoppingCart className="w-8 h-8 text-lime-400" />
              <h1 className="text-3xl md:text-4xl font-bold text-white">Your Cart</h1>
            </div>
            <p className="text-gray-400">
              {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
            </p>
          </motion.div>
        </div>
      </section>

      {/* Cart Items */}
      <section className="px-4 md:px-6 pb-8">
        <div className="mx-auto max-w-4xl">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
            {items.map((item, index) => (
              <motion.div
                key={item.meal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`p-4 md:p-6 ${
                  index !== items.length - 1 ? 'border-b border-gray-700' : ''
                }`}
              >
                <div className="flex gap-4">
                  {/* Image */}
                  <div
                    className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-gray-700 flex-shrink-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${item.meal.image})`,
                    }}
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-bold text-white truncate">
                          {item.meal.name}
                        </h3>
                        <p className="text-gray-400 text-sm line-clamp-1">
                          {item.meal.description}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.meal.id)}
                        className="text-gray-500 hover:text-red-400 transition-colors p-2"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <motion.button
                          onClick={() => updateQuantity(item.meal.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-white transition-colors"
                          whileTap={{ scale: 0.9 }}
                        >
                          <Minus className="w-4 h-4" />
                        </motion.button>
                        <span className="text-white font-semibold w-8 text-center">
                          {item.quantity}
                        </span>
                        <motion.button
                          onClick={() => updateQuantity(item.meal.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-lime-500 hover:bg-lime-400 flex items-center justify-center text-gray-900 transition-colors"
                          whileTap={{ scale: 0.9 }}
                        >
                          <Plus className="w-4 h-4" />
                        </motion.button>
                      </div>

                      {/* Price */}
                      <p className="text-lime-400 font-bold text-lg">
                        £{(item.meal.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Clear Cart Button */}
          <div className="mt-4 text-right">
            <button
              onClick={clearCart}
              className="text-gray-500 hover:text-red-400 text-sm font-semibold transition-colors"
            >
              Clear cart
            </button>
          </div>
        </div>
      </section>

      {/* Order Summary */}
      <section className="px-4 md:px-6 pb-8">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-gray-800 rounded-2xl border border-gray-700 p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal ({totalItems} items)</span>
                <span>£{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Delivery</span>
                <span className="text-lime-400">Free</span>
              </div>
              <div className="border-t border-gray-700 pt-3">
                <div className="flex justify-between text-white text-lg font-bold">
                  <span>Total</span>
                  <span className="text-lime-400">£{totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Halal Badge */}
            <div className="bg-lime-500/10 border border-lime-500/30 rounded-xl p-3 mb-6 flex items-center gap-3">
              <Leaf className="w-5 h-5 text-lime-400 flex-shrink-0" />
              <p className="text-lime-300 text-sm">
                All meals are 100% halal certified and prepared fresh
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                onClick={() => router.push('/fresh')}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowLeft className="w-5 h-5" />
                Continue Shopping
              </motion.button>
              <motion.button
                onClick={() => router.push('/fresh/checkout')}
                className="flex-1 bg-lime-500 hover:bg-lime-400 text-gray-900 px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Order Now
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Back Link */}
      <section className="px-4 md:px-6 pb-16">
        <div className="mx-auto max-w-4xl text-center">
          <Link
            href="/fresh"
            className="text-gray-400 hover:text-lime-400 transition-colors text-sm font-semibold"
          >
            ← Back to Fresh
          </Link>
        </div>
      </section>
    </div>
  );
}
