'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ShoppingCart,
  Flame,
  Clock,
  Users,
  Plus,
  Minus,
  Check,
  ShieldCheck,
  Leaf,
  AlertTriangle,
  ChefHat,
  Heart,
} from 'lucide-react';
import { meals, type Meal } from '@/data/freshMockData';
import { useCart } from '@/context/CartContext';

export default function MealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart, totalItems } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const meal = meals.find((m) => m.id === params.id);

  if (!meal) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Meal Not Found
          </h1>
          <p className="text-gray-400 mb-6">
            The meal you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/fresh/meals"
            className="text-lime-400 hover:text-lime-300 font-semibold"
          >
            &larr; Back to Meals
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(meal);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const relatedMeals = meals
    .filter((m) => m.category === meal.category && m.id !== meal.id)
    .slice(0, 3);

  const nutritionItems = [
    { label: 'Calories', value: meal.calories ? `${meal.calories}` : null, unit: 'kcal', icon: Flame },
    { label: 'Protein', value: meal.protein ? `${meal.protein}` : null, unit: 'g', icon: null },
    { label: 'Carbs', value: meal.carbs ? `${meal.carbs}` : null, unit: 'g', icon: null },
    { label: 'Fat', value: meal.fat ? `${meal.fat}` : null, unit: 'g', icon: null },
  ].filter((n) => n.value !== null);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="mx-auto max-w-7xl px-4 md:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-lime-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Back</span>
          </button>

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
      </header>

      <main className="mx-auto max-w-7xl px-4 md:px-8 py-8 md:py-12">
        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 mb-16">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] bg-gray-900">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${meal.image})`,
                  backgroundColor: '#1f2937',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/30 to-transparent" />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                {meal.isPopular && (
                  <span className="bg-lime-500 text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    Popular
                  </span>
                )}
                {meal.isNew && (
                  <span className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    New
                  </span>
                )}
              </div>

              {/* Halal badge */}
              <div className="absolute bottom-4 right-4">
                <div className="bg-gray-950/70 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-2 border border-gray-700/50">
                  <ShieldCheck className="w-4 h-4 text-lime-400" />
                  <span className="text-xs font-semibold text-white">
                    Halal Certified
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col"
          >
            {/* Category */}
            <span className="text-lime-400 text-sm font-semibold mb-2 tracking-wide uppercase">
              {meal.category}
            </span>

            {/* Name & Price */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">
              {meal.name}
            </h1>
            <div className="text-3xl font-bold text-lime-400 mb-6">
              £{meal.price.toFixed(2)}
            </div>

            {/* Description */}
            <p className="text-gray-400 leading-relaxed mb-8 text-lg">
              {meal.longDescription || meal.description}
            </p>

            {/* Quick Info Pills */}
            <div className="flex flex-wrap gap-3 mb-8">
              {meal.calories && (
                <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-full px-4 py-2 text-sm">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-gray-300">{meal.calories} cal</span>
                </div>
              )}
              {meal.prepTime && (
                <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-full px-4 py-2 text-sm">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-300">{meal.prepTime}</span>
                </div>
              )}
              {meal.servings && (
                <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-full px-4 py-2 text-sm">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-300">
                    {meal.servings} serving{meal.servings > 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>

            {/* Quantity + Add to Cart */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center bg-gray-900 border border-gray-800 rounded-full">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center text-white font-bold">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <motion.button
                onClick={handleAddToCart}
                whileHover={{ scale: added ? 1 : 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`flex-1 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                  added
                    ? 'bg-green-500 text-white'
                    : 'bg-lime-500 hover:bg-lime-400 text-gray-900'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5" />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart - £{(meal.price * quantity).toFixed(2)}
                  </>
                )}
              </motion.button>
            </div>

            {/* Trust bar */}
            <div className="flex items-center gap-4 text-xs text-gray-500 pt-4 border-t border-gray-800/50">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-lime-500/60" />
                <span>100% Halal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-lime-500/60" />
                <span>Fresh Daily</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ChefHat className="w-3.5 h-3.5 text-lime-500/60" />
                <span>Chef-Prepared</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Details Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {/* Nutrition */}
          {nutritionItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
            >
              <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-400" />
                Nutrition per Serving
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {nutritionItems.map((item, i) => (
                  <div
                    key={i}
                    className="bg-gray-950 rounded-xl p-4 text-center"
                  >
                    <div className="text-2xl font-extrabold text-white mb-1">
                      {item.value}
                      <span className="text-sm text-gray-500 font-medium ml-0.5">
                        {item.unit}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Ingredients */}
          {meal.ingredients && meal.ingredients.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
            >
              <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-lime-400" />
                Ingredients
              </h3>
              <div className="flex flex-wrap gap-2">
                {meal.ingredients.map((ing, i) => (
                  <span
                    key={i}
                    className="bg-gray-950 text-gray-300 text-sm px-3 py-1.5 rounded-full border border-gray-800"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Allergens */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Allergen Info
            </h3>
            {meal.allergens && meal.allergens.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-4">
                {meal.allergens.map((allergen, i) => (
                  <span
                    key={i}
                    className="bg-amber-500/10 text-amber-400 text-sm font-semibold px-3 py-1.5 rounded-full border border-amber-500/20"
                  >
                    {allergen}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-green-400 text-sm mb-4">
                No common allergens detected
              </p>
            )}
            <p className="text-gray-600 text-xs leading-relaxed">
              Produced in a kitchen that handles nuts, dairy, gluten, sesame, and
              fish. Please contact us for specific dietary requirements.
            </p>
          </motion.div>
        </div>

        {/* Related Meals */}
        {relatedMeals.length > 0 && (
          <section>
            <h3 className="text-2xl font-bold text-white mb-6">
              More from{' '}
              <span className="text-lime-400">{meal.category}</span>
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedMeals.map((related, i) => (
                <motion.div
                  key={related.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                >
                  <Link href={`/fresh/meals/${related.id}`}>
                    <motion.div
                      whileHover={{ y: -4 }}
                      className="group bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-lime-500/40 transition-all duration-300 cursor-pointer"
                    >
                      <div className="relative h-40 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent z-10" />
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                          style={{
                            backgroundImage: `url(${related.image})`,
                            backgroundColor: '#1f2937',
                          }}
                        />
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-bold text-white line-clamp-1 group-hover:text-lime-300 transition-colors">
                            {related.name}
                          </h4>
                          <span className="text-lime-400 font-bold text-sm whitespace-nowrap">
                            £{related.price.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm line-clamp-1">
                          {related.description}
                        </p>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Back navigation */}
        <div className="flex justify-center gap-6 mt-16 pt-8 border-t border-gray-800/50">
          <Link
            href="/fresh/meals"
            className="text-gray-500 hover:text-lime-400 transition-colors text-sm font-semibold"
          >
            &larr; All Meals
          </Link>
          <Link
            href="/fresh"
            className="text-gray-500 hover:text-lime-400 transition-colors text-sm font-semibold"
          >
            Fresh Home
          </Link>
          <Link
            href="/"
            className="text-gray-500 hover:text-lime-400 transition-colors text-sm font-semibold"
          >
            Home
          </Link>
        </div>
      </main>
    </div>
  );
}
