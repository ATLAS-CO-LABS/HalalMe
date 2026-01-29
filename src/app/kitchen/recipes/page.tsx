"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Clock,
  ChefHat,
  Search,
  Plus,
  ArrowLeft,
  Star,
  Users,
} from "lucide-react";

type Recipe = {
  id: string;
  title: string;
  description: string;
  image: string;
  cookTime: string;
  difficulty: "Easy" | "Medium" | "Hard";
  uploadedBy: string;
  rating: number;
  servings: number;
};

// Mock recipe data
const mockRecipes: Recipe[] = [
  {
    id: "1",
    title: "Chicken Biryani",
    description: "Aromatic rice dish with tender chicken and fragrant spices",
    image: "/images/services/kitchen.jpg",
    cookTime: "45 min",
    difficulty: "Medium",
    uploadedBy: "Chef Ahmed",
    rating: 4.8,
    servings: 6,
  },
  {
    id: "2",
    title: "Beef Shawarma",
    description: "Middle Eastern street food classic with marinated beef",
    image: "/images/services/kitchen.jpg",
    cookTime: "30 min",
    difficulty: "Easy",
    uploadedBy: "Sara K.",
    rating: 4.9,
    servings: 4,
  },
  {
    id: "3",
    title: "Lamb Kabsa",
    description: "Traditional Saudi Arabian rice dish with tender lamb",
    image: "/images/services/kitchen.jpg",
    cookTime: "60 min",
    difficulty: "Medium",
    uploadedBy: "Chef Mohammed",
    rating: 4.7,
    servings: 8,
  },
  {
    id: "4",
    title: "Butter Chicken",
    description: "Creamy and rich tomato-based curry with tender chicken",
    image: "/images/services/kitchen.jpg",
    cookTime: "40 min",
    difficulty: "Medium",
    uploadedBy: "Aisha M.",
    rating: 4.9,
    servings: 4,
  },
  {
    id: "5",
    title: "Falafel Wrap",
    description: "Crispy chickpea fritters wrapped in warm pita",
    image: "/images/services/kitchen.jpg",
    cookTime: "25 min",
    difficulty: "Easy",
    uploadedBy: "Fatima R.",
    rating: 4.6,
    servings: 4,
  },
  {
    id: "6",
    title: "Moroccan Tagine",
    description: "Slow-cooked stew with aromatic spices and vegetables",
    image: "/images/services/kitchen.jpg",
    cookTime: "90 min",
    difficulty: "Hard",
    uploadedBy: "Chef Hassan",
    rating: 4.8,
    servings: 6,
  },
  {
    id: "7",
    title: "Chicken Tikka Masala",
    description: "British-Indian favorite with grilled chicken in spiced curry",
    image: "/images/services/kitchen.jpg",
    cookTime: "50 min",
    difficulty: "Medium",
    uploadedBy: "Zainab A.",
    rating: 4.9,
    servings: 4,
  },
  {
    id: "8",
    title: "Turkish Kebab",
    description: "Grilled meat skewers with traditional Turkish seasonings",
    image: "/images/services/kitchen.jpg",
    cookTime: "35 min",
    difficulty: "Easy",
    uploadedBy: "Chef Mehmet",
    rating: 4.7,
    servings: 4,
  },
];

export default function RecipesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");

  const filteredRecipes = mockRecipes.filter((recipe) => {
    const matchesSearch =
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty =
      selectedDifficulty === "All" || recipe.difficulty === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-400 bg-green-400/10";
      case "Medium":
        return "text-yellow-400 bg-yellow-400/10";
      case "Hard":
        return "text-red-400 bg-red-400/10";
      default:
        return "text-gray-400 bg-gray-400/10";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-fuchsia-950 to-gray-900">
      {/* Header */}
      <div className="bg-gray-900/95 backdrop-blur-lg border-b border-gray-700">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4 md:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 md:mb-6">
            <div className="flex items-center gap-3 md:gap-4">
              <Link href="/kitchen">
                <motion.button
                  className="text-gray-400 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
                </motion.button>
              </Link>
              <div>
                <h1
                  className="text-xl md:text-2xl lg:text-3xl font-bold text-white"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  Explore Recipes
                </h1>
                <p
                  className="text-gray-400 mt-0.5 md:mt-1 text-sm md:text-base font-normal"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Discover and share halal recipes
                </p>
              </div>
            </div>
            <Link href="/kitchen/recipes/upload" className="w-full sm:w-auto">
              <motion.button
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-br from-fuchsia-600 to-pink-600 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-full font-semibold shadow-lg text-sm md:text-base"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                Upload Recipe
              </motion.button>
            </Link>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800 text-white text-sm md:text-base rounded-full pl-10 md:pl-12 pr-4 md:pr-6 py-2.5 md:py-3 border border-gray-700 focus:outline-none focus:border-fuchsia-500 transition-colors font-normal"
                style={{ fontFamily: "var(--font-body)" }}
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              {["All", "Easy", "Medium", "Hard"].map((difficulty) => (
                <motion.button
                  key={difficulty}
                  onClick={() => setSelectedDifficulty(difficulty)}
                  className={`px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold transition-all whitespace-nowrap text-sm md:text-base ${
                    selectedDifficulty === difficulty
                      ? "bg-gradient-to-br from-fuchsia-600 to-pink-600 text-white"
                      : "bg-gray-800 text-gray-400 border border-gray-700"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {difficulty}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recipe Grid */}
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-8 md:py-12">
        {filteredRecipes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <ChefHat className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3
              className="text-2xl font-bold text-white mb-2"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              No recipes found
            </h3>
            <p
              className="text-gray-400 font-normal"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Try adjusting your search or filters
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredRecipes.map((recipe, index) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Link href={`/kitchen/recipes/${recipe.id}`}>
                  <motion.div
                    className="group bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-fuchsia-500 transition-all cursor-pointer"
                    whileHover={{
                      y: -8,
                      boxShadow: "0 20px 40px -12px rgba(217, 70, 239, 0.3)",
                    }}
                  >
                    {/* Recipe Image */}
                    <div className="relative h-48 bg-gray-700 overflow-hidden">
                      <Image
                        src={recipe.image}
                        alt={recipe.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-white text-sm font-semibold">
                          {recipe.rating}
                        </span>
                      </div>
                    </div>

                    {/* Recipe Info */}
                    <div className="p-5">
                      <h3
                        className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-fuchsia-400 transition-colors"
                        style={{ fontFamily: "var(--font-headline)" }}
                      >
                        {recipe.title}
                      </h3>
                      <p
                        className="text-gray-400 text-sm mb-4 line-clamp-2 font-normal"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {recipe.description}
                      </p>

                      {/* Meta Info */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <Clock className="w-4 h-4" />
                          <span>{recipe.cookTime}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <Users className="w-4 h-4" />
                          <span>{recipe.servings} servings</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(
                            recipe.difficulty
                          )}`}
                        >
                          {recipe.difficulty}
                        </span>
                        <span
                          className="text-gray-500 text-xs font-normal"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          by {recipe.uploadedBy}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
