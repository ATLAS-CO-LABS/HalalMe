'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
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
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import { meals, categories, type Meal } from '@/data/freshMockData';
import { useCart } from '@/context/CartContext';

export default function PreparedMealsPage() {
  const router = useRouter();
  const { addToCart, totalItems } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedMealId, setAddedMealId] = useState<string | null>(null);

  const filteredMeals = meals.filter((meal) => {
    const matchesCategory =
      selectedCategory === 'All' || meal.category === selectedCategory;
    const matchesSearch =
      meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meal.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (meal: Meal) => {
    addToCart(meal);
    setAddedMealId(meal.id);
    setTimeout(() => setAddedMealId(null), 1500);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header Bar */}
      <section className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="mx-auto max-w-7xl px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/fresh"
              className="text-gray-400 hover:text-lime-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">Prepared Meals</h1>
              <p className="text-gray-500 text-xs">
                {filteredMeals.length} meals available
              </p>
            </div>
          </div>

          <motion.button
            onClick={() => router.push('/fresh/cart')}
            className="relative bg-lime-500 hover:bg-lime-400 text-gray-900 px-5 py-2.5 rounded-full font-bold flex items-center gap-2 transition-colors text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Cart</span>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </motion.button>
        </div>
      </section>

      {/* Hero Banner */}
      <section className="relative overflow-hidden pt-12 pb-10 px-4 md:px-8">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-80 h-80 bg-lime-600 rounded-full filter blur-3xl opacity-10" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-green-600 rounded-full filter blur-3xl opacity-10" />
        </div>

        <div className="mx-auto max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 bg-lime-500/10 border border-lime-500/20 rounded-full px-4 py-2 mb-5">
              <Leaf className="w-4 h-4 text-lime-400" />
              <span className="text-lime-300 text-sm font-semibold">
                Fresh & Halal Certified
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
              Choose Your{' '}
              <span className="bg-gradient-to-r from-lime-400 to-green-400 bg-clip-text text-transparent">
                Meals
              </span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Chef-prepared halal meals, ready in minutes. Browse, pick, and
              we&apos;ll deliver fresh to your door.
            </p>
          </motion.div>

          {/* Search & Filters */}
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative max-w-md mx-auto w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search meals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-lime-500/50 focus:ring-1 focus:ring-lime-500/20 transition-all"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <motion.button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    selectedCategory === category
                      ? 'bg-lime-500 text-gray-900 shadow-lg shadow-lime-500/20'
                      : 'bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-700 hover:text-gray-300'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Meals Grid */}
      <section className="px-4 md:px-8 pb-16">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            <AnimatePresence mode="popLayout">
              {filteredMeals.map((meal, index) => (
                <motion.div
                  key={meal.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
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
              className="text-center py-20"
            >
              <Search className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-400 text-xl mb-2">No meals found</p>
              <p className="text-gray-600 text-sm mb-6">
                Try adjusting your search or filters
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="text-lime-400 hover:text-lime-300 font-semibold text-sm"
              >
                Clear all filters
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Bottom Trust Bar */}
      <section className="border-t border-gray-800/50 bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 md:px-8 py-8">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
            {[
              { icon: ShieldCheck, text: '100% Halal Certified' },
              { icon: Sparkles, text: 'Fresh Daily' },
              { icon: Clock, text: 'Ready in 5-10 min' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <item.icon className="w-4 h-4 text-lime-500/60" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-6 mt-6">
            <Link
              href="/fresh"
              className="text-gray-500 hover:text-lime-400 transition-colors text-sm font-semibold"
            >
              &larr; Back to Fresh
            </Link>
            <Link
              href="/"
              className="text-gray-500 hover:text-lime-400 transition-colors text-sm font-semibold"
            >
              Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─────────────────── Meal Card ─────────────────── */
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
      className="group bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-lime-500/40 transition-all duration-300"
      whileHover={{ y: -4 }}
    >
      {/* Image - clickable to detail page */}
      <Link href={`/fresh/meals/${meal.id}`}>
        <div className="relative h-48 bg-gray-800 overflow-hidden cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent z-10" />
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
            style={{
              backgroundImage: `url(${meal.image})`,
              backgroundColor: '#1f2937',
            }}
          />
          {/* Badges */}
          <div className="absolute top-3 left-3 z-20 flex gap-2">
            {meal.isPopular && (
              <span className="bg-lime-500 text-gray-900 text-xs font-bold px-2.5 py-1 rounded-full">
                Popular
              </span>
            )}
            {meal.isNew && (
              <span className="bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                New
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link href={`/fresh/meals/${meal.id}`}>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-lime-300 transition-colors cursor-pointer">
              {meal.name}
            </h3>
            <span className="text-lime-400 font-bold whitespace-nowrap">
              £{meal.price.toFixed(2)}
            </span>
          </div>
        </Link>

        <p className="text-gray-500 text-sm mb-3 line-clamp-2">
          {meal.description}
        </p>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-xs text-gray-600 mb-4">
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
          className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all text-sm ${
            isAdded
              ? 'bg-green-500 text-white'
              : 'bg-lime-500 hover:bg-lime-400 text-gray-900'
          }`}
          whileHover={{ scale: isAdded ? 1 : 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isAdded ? (
            <>
              <Check className="w-4 h-4" />
              Added!
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Add to Cart
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
