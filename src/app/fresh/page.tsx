'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Leaf,
  ShoppingCart,
  Clock,
  Flame,
  Sparkles,
  Check,
  Plus,
  Search,
  Filter,
} from 'lucide-react';
import { meals, categories, type Meal } from '@/data/freshMockData';
import { useCart } from '@/context/CartContext';

export default function FreshLandingPage() {
  const router = useRouter();
  const { addToCart, totalItems } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedMealId, setAddedMealId] = useState<string | null>(null);

  const filteredMeals = meals.filter((meal) => {
    const matchesCategory = selectedCategory === 'All' || meal.category === selectedCategory;
    const matchesSearch = meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meal.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (meal: Meal) => {
    addToCart(meal);
    setAddedMealId(meal.id);
    setTimeout(() => setAddedMealId(null), 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-lime-950 to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24 px-4 md:px-6">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-lime-600 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-600 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        </div>

        <div className="mx-auto max-w-5xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 bg-lime-500/20 border border-lime-500/30 rounded-full px-4 py-2 mb-6"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Leaf className="w-4 h-4 text-lime-400" />
              <span className="text-lime-300 text-sm font-semibold">
                Fresh & Halal Certified
              </span>
            </motion.div>

            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6"
            >
              HalalMe{' '}
              <span className="bg-gradient-to-r from-lime-400 via-green-400 to-emerald-400 bg-clip-text text-transparent">
                Fresh
              </span>
            </h1>

            <p
              className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed"
            >
              Ready-made halal meals delivered to your door.
              Fresh, delicious, and prepared with care.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mb-8">
              {[
                { icon: Clock, label: "Ready in minutes", value: "5-10" },
                { icon: Leaf, label: "Fresh ingredients", value: "100%" },
                { icon: Sparkles, label: "Halal certified", value: "Always" },
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                    className="text-center"
                  >
                    <Icon className="w-6 h-6 text-lime-400 mx-auto mb-2" />
                    <p className="text-white font-bold">{stat.value}</p>
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="px-4 md:px-6 py-8 bg-gray-900/50">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search meals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-lime-500 transition-colors"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.slice(0, 6).map((category) => (
                <motion.button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    selectedCategory === category
                      ? 'bg-lime-500 text-gray-900'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {category}
                </motion.button>
              ))}
            </div>

            {/* Cart Button */}
            <motion.button
              onClick={() => router.push('/fresh/cart')}
              className="relative bg-lime-500 hover:bg-lime-400 text-gray-900 px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Cart</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </motion.button>
          </div>
        </div>
      </section>

      {/* Meals Grid */}
      <section className="px-4 md:px-6 py-12 md:py-16">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredMeals.map((meal, index) => (
                <motion.div
                  key={meal.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <MealCard
                    meal={meal}
                    onAddToCart={handleAddToCart}
                    isAdded={addedMealId === meal.id}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredMeals.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="text-gray-400 text-xl">No meals found matching your criteria.</p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="mt-4 text-lime-400 hover:text-lime-300 font-semibold"
              >
                Clear filters
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 md:px-6 py-16 md:py-20 bg-gradient-to-r from-lime-900/20 to-green-900/20">
        <div className="mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Leaf,
                title: "100% Halal",
                description: "All meals are certified halal, prepared in halal-certified kitchens",
                color: "from-lime-500 to-lime-600",
              },
              {
                icon: Clock,
                title: "Ready to Eat",
                description: "Heat and serve in minutes. Perfect for busy days",
                color: "from-green-500 to-green-600",
              },
              {
                icon: Sparkles,
                title: "Fresh Daily",
                description: "Meals prepared fresh every day with quality ingredients",
                color: "from-emerald-500 to-emerald-600",
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-lime-500 transition-all"
                >
                  <div
                    className={`bg-gradient-to-br ${feature.color} rounded-xl p-4 mb-4 inline-block`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
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
            <Leaf className="w-16 h-16 text-lime-400 mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Order?
            </h2>
            <p className="text-lg md:text-xl text-gray-400 mb-8">
              Browse our selection of fresh, halal meals and get them delivered to your doorstep.
            </p>
            <motion.button
              onClick={() => router.push('/fresh/cart')}
              className="bg-gradient-to-r from-lime-600 via-green-500 to-green-600 text-white px-10 py-5 rounded-full font-bold text-xl shadow-2xl"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 25px 50px -12px rgba(132, 204, 22, 0.6)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              View Cart ({totalItems} items)
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Back Links */}
      <section className="px-4 md:px-6 pb-16">
        <div className="mx-auto max-w-4xl text-center flex justify-center gap-6">
          <Link
            href="/"
            className="text-gray-400 hover:text-lime-400 transition-colors text-sm font-semibold"
          >
            ← Home
          </Link>
          <Link
            href="/kitchen"
            className="text-gray-400 hover:text-lime-400 transition-colors text-sm font-semibold"
          >
            Kitchen →
          </Link>
        </div>
      </section>
    </div>
  );
}

// Meal Card Component
function MealCard({
  meal,
  onAddToCart,
  isAdded,
}: {
  meal: Meal;
  onAddToCart: (meal: Meal) => void;
  isAdded: boolean;
}) {
  return (
    <motion.div
      className="group bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-lime-500 transition-all"
      whileHover={{ y: -4 }}
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-700 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
          style={{
            backgroundImage: `url(${meal.image})`,
            backgroundColor: '#374151',
          }}
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 z-20 flex gap-2">
          {meal.isPopular && (
            <span className="bg-lime-500 text-gray-900 text-xs font-bold px-2 py-1 rounded-full">
              Popular
            </span>
          )}
          {meal.isNew && (
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              New
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-lg font-bold text-white line-clamp-1">
            {meal.name}
          </h3>
          <span className="text-lime-400 font-bold whitespace-nowrap">
            £{meal.price.toFixed(2)}
          </span>
        </div>

        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
          {meal.description}
        </p>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          {meal.calories && (
            <span className="flex items-center gap-1">
              <Flame className="w-3 h-3" />
              {meal.calories} cal
            </span>
          )}
          {meal.prepTime && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {meal.prepTime}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <motion.button
          onClick={() => onAddToCart(meal)}
          className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
            isAdded
              ? 'bg-green-500 text-white'
              : 'bg-lime-500 hover:bg-lime-400 text-gray-900'
          }`}
          whileHover={{ scale: isAdded ? 1 : 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isAdded ? (
            <>
              <Check className="w-5 h-5" />
              Added!
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Add to Cart
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
