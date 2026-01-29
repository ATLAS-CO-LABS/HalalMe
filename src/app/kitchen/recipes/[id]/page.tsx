'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Clock,
  Users,
  ChefHat,
  Star,
  MessageCircle,
  Share2,
  Bookmark,
  Check,
} from 'lucide-react';

// Mock recipe data (in real app, this would be fetched based on the ID)
const getRecipeById = (id: string) => {
  const recipes = {
    '1': {
      id: '1',
      title: 'Chicken Biryani',
      description: 'Aromatic rice dish with tender chicken and fragrant spices',
      image: '/images/services/kitchen.jpg',
      cookTime: '45 min',
      difficulty: 'Medium',
      uploadedBy: 'Chef Ahmed',
      rating: 4.8,
      servings: 6,
      ingredients: [
        '2 lbs chicken (cut into pieces)',
        '3 cups basmati rice',
        '2 large onions (sliced)',
        '4 cloves garlic (minced)',
        '2 inches ginger (grated)',
        '2 tomatoes (chopped)',
        '1 cup yogurt',
        '2 tsp biryani masala',
        '1 tsp turmeric powder',
        '1 tsp red chili powder',
        'Salt to taste',
        '4 tbsp cooking oil',
        'Fresh cilantro and mint leaves',
        'Saffron strands (soaked in milk)',
      ],
      instructions: [
        'Wash and soak basmati rice for 30 minutes. Drain and set aside.',
        'Heat oil in a large pot. Add sliced onions and fry until golden brown. Remove half for garnish.',
        'Add ginger-garlic paste to the remaining onions. Sauté for 2 minutes.',
        'Add chicken pieces and cook until they turn white. Add tomatoes and cook until soft.',
        'Mix in yogurt, biryani masala, turmeric, red chili powder, and salt. Cook for 10 minutes.',
        'In a separate pot, boil water with salt. Add rice and cook until 70% done. Drain.',
        'Layer the partially cooked rice over the chicken. Sprinkle fried onions, cilantro, mint, and saffron milk on top.',
        'Cover tightly with a lid. Cook on low heat for 20-25 minutes until rice is fully cooked.',
        'Let it rest for 5 minutes. Gently mix before serving.',
        'Garnish with boiled eggs and serve hot with raita or salad.',
      ],
    },
    // Add more mock recipes here as needed
  };

  return recipes[id as keyof typeof recipes] || recipes['1'];
};

export default function RecipeDetailPage({ params }: { params: { id: string } }) {
  const recipe = getRecipeById(params.id);
  const [checkedIngredients, setCheckedIngredients] = useState<number[]>([]);
  const [checkedSteps, setCheckedSteps] = useState<number[]>([]);

  const toggleIngredient = (index: number) => {
    setCheckedIngredients((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const toggleStep = (index: number) => {
    setCheckedSteps((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-400 bg-green-400/10';
      case 'Medium':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'Hard':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-fuchsia-950 to-gray-900">
      {/* Header Image */}
      <div className="relative h-64 md:h-80 lg:h-96">
        <Image
          src={recipe.image}
          alt={recipe.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-gray-900"></div>

        {/* Back Button */}
        <div className="absolute top-4 md:top-6 left-4 md:left-6">
          <Link href="/kitchen/recipes">
            <motion.button
              className="bg-black/60 backdrop-blur-sm text-white rounded-full p-2 md:p-3 border border-white/20"
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
            </motion.button>
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-4 md:top-6 right-4 md:right-6 flex gap-2 md:gap-3">
          <motion.button
            className="bg-black/60 backdrop-blur-sm text-white rounded-full p-2 md:p-3 border border-white/20"
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
            whileTap={{ scale: 0.95 }}
          >
            <Share2 className="w-5 h-5 md:w-6 md:h-6" />
          </motion.button>
          <motion.button
            className="bg-black/60 backdrop-blur-sm text-white rounded-full p-2 md:p-3 border border-white/20"
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
            whileTap={{ scale: 0.95 }}
          >
            <Bookmark className="w-5 h-5 md:w-6 md:h-6" />
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 md:px-6 py-6 md:py-8">
        {/* Title and Meta */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1
            className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-3 md:mb-4"
            style={{ fontFamily: 'var(--font-headline)' }}
          >
            {recipe.title}
          </h1>
          <p
            className="text-base md:text-lg lg:text-xl text-gray-300 mb-4 md:mb-6 font-normal"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {recipe.description}
          </p>

          {/* Meta Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-700">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Clock className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-xs md:text-sm">Cook Time</span>
              </div>
              <p className="text-white font-semibold text-base md:text-lg">{recipe.cookTime}</p>
            </div>

            <div className="bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-700">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Users className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-xs md:text-sm">Servings</span>
              </div>
              <p className="text-white font-semibold text-base md:text-lg">{recipe.servings} people</p>
            </div>

            <div className="bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-700">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <ChefHat className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-xs md:text-sm">Difficulty</span>
              </div>
              <span
                className={`inline-block px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold ${getDifficultyColor(
                  recipe.difficulty
                )}`}
              >
                {recipe.difficulty}
              </span>
            </div>

            <div className="bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-700">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 fill-yellow-400" />
                <span className="text-xs md:text-sm">Rating</span>
              </div>
              <p className="text-white font-semibold text-base md:text-lg">{recipe.rating} / 5.0</p>
            </div>
          </div>

          {/* Uploaded By */}
          <div className="mt-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-fuchsia-600 to-pink-600 rounded-full flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Uploaded by</p>
              <p className="text-white font-semibold">{recipe.uploadedBy}</p>
            </div>
          </div>
        </motion.div>

        {/* Ask AI Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6 md:mb-8"
        >
          <Link href={`/kitchen/ai-assistant?recipe=${recipe.id}`}>
            <motion.button
              className="w-full bg-gradient-to-br from-fuchsia-600 to-pink-600 text-white rounded-2xl p-4 md:p-6 font-semibold text-base md:text-lg flex items-center justify-center gap-2 md:gap-3 shadow-xl"
              whileHover={{ scale: 1.02, boxShadow: '0 25px 50px -12px rgba(217, 70, 239, 0.5)' }}
              whileTap={{ scale: 0.98 }}
            >
              <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
              Ask AI About This Recipe
            </motion.button>
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Ingredients */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h2
                className="text-2xl font-bold text-white mb-6 flex items-center gap-3"
                style={{ fontFamily: 'var(--font-headline)' }}
              >
                <span className="text-3xl">🥘</span>
                Ingredients
              </h2>
              <div className="space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <motion.div
                    key={index}
                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                      checkedIngredients.includes(index)
                        ? 'bg-fuchsia-600/20 border border-fuchsia-500'
                        : 'bg-gray-900/50 border border-gray-700 hover:bg-gray-900'
                    }`}
                    onClick={() => toggleIngredient(index)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        checkedIngredients.includes(index)
                          ? 'bg-fuchsia-500 border-fuchsia-500'
                          : 'border-gray-600'
                      }`}
                    >
                      {checkedIngredients.includes(index) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <p
                      className={`font-normal ${
                        checkedIngredients.includes(index)
                          ? 'text-white line-through opacity-60'
                          : 'text-gray-300'
                      }`}
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {ingredient}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h2
                className="text-2xl font-bold text-white mb-6 flex items-center gap-3"
                style={{ fontFamily: 'var(--font-headline)' }}
              >
                <span className="text-3xl">👨‍🍳</span>
                Instructions
              </h2>
              <div className="space-y-4">
                {recipe.instructions.map((step, index) => (
                  <motion.div
                    key={index}
                    className={`flex gap-4 p-4 rounded-lg cursor-pointer transition-all ${
                      checkedSteps.includes(index)
                        ? 'bg-fuchsia-600/20 border border-fuchsia-500'
                        : 'bg-gray-900/50 border border-gray-700 hover:bg-gray-900'
                    }`}
                    onClick={() => toggleStep(index)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${
                        checkedSteps.includes(index)
                          ? 'bg-fuchsia-500 text-white'
                          : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      {checkedSteps.includes(index) ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <p
                      className={`font-normal leading-relaxed ${
                        checkedSteps.includes(index)
                          ? 'text-white line-through opacity-60'
                          : 'text-gray-300'
                      }`}
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {step}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
