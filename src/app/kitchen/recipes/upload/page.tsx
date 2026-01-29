'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Upload,
  Plus,
  X,
  Image as ImageIcon,
  Check,
  Loader2,
} from 'lucide-react';

type RecipeForm = {
  title: string;
  description: string;
  cookTime: string;
  servings: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | '';
  ingredients: string[];
  instructions: string[];
  image: File | null;
};

export default function UploadRecipePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [currentInstruction, setCurrentInstruction] = useState('');
  const [formData, setFormData] = useState<RecipeForm>({
    title: '',
    description: '',
    cookTime: '',
    servings: '',
    difficulty: '',
    ingredients: [],
    instructions: [],
    image: null,
  });

  const handleInputChange = (
    field: keyof RecipeForm,
    value: string | number | File | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addIngredient = () => {
    if (currentIngredient.trim()) {
      setFormData((prev) => ({
        ...prev,
        ingredients: [...prev.ingredients, currentIngredient.trim()],
      }));
      setCurrentIngredient('');
    }
  };

  const removeIngredient = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const addInstruction = () => {
    if (currentInstruction.trim()) {
      setFormData((prev) => ({
        ...prev,
        instructions: [...prev.instructions, currentInstruction.trim()],
      }));
      setCurrentInstruction('');
    }
  };

  const removeInstruction = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index),
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleInputChange('image', file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (
      !formData.title ||
      !formData.description ||
      !formData.cookTime ||
      !formData.servings ||
      !formData.difficulty ||
      formData.ingredients.length === 0 ||
      formData.instructions.length === 0
    ) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Recipe uploaded successfully!');
      router.push('/kitchen/recipes');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-fuchsia-950 to-gray-900 py-6 md:py-8">
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
            <Link href="/kitchen/recipes">
              <motion.button
                className="text-gray-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
              </motion.button>
            </Link>
            <h1
              className="text-xl md:text-2xl lg:text-3xl font-bold text-white"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              Upload Your Recipe
            </h1>
          </div>
          <p
            className="text-sm md:text-base text-gray-400 font-normal"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Share your culinary creation with the HalalMe community
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Basic Info Card */}
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <h2
              className="text-xl font-bold text-white mb-6"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              Basic Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 font-semibold mb-2">
                  Recipe Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Chicken Biryani"
                  className="w-full bg-gray-900 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-fuchsia-500 transition-colors font-normal"
                  style={{ fontFamily: 'var(--font-body)' }}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of your recipe..."
                  rows={3}
                  className="w-full bg-gray-900 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-fuchsia-500 transition-colors resize-none font-normal"
                  style={{ fontFamily: 'var(--font-body)' }}
                  required
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-2">
                    Cook Time *
                  </label>
                  <input
                    type="text"
                    value={formData.cookTime}
                    onChange={(e) => handleInputChange('cookTime', e.target.value)}
                    placeholder="e.g., 45 min"
                    className="w-full bg-gray-900 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-fuchsia-500 transition-colors font-normal"
                    style={{ fontFamily: 'var(--font-body)' }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-2">
                    Servings *
                  </label>
                  <input
                    type="number"
                    value={formData.servings}
                    onChange={(e) => handleInputChange('servings', e.target.value)}
                    placeholder="e.g., 4"
                    min="1"
                    className="w-full bg-gray-900 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-fuchsia-500 transition-colors font-normal"
                    style={{ fontFamily: 'var(--font-body)' }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-2">
                    Difficulty *
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) =>
                      handleInputChange(
                        'difficulty',
                        e.target.value as 'Easy' | 'Medium' | 'Hard'
                      )
                    }
                    className="w-full bg-gray-900 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-fuchsia-500 transition-colors font-normal"
                    style={{ fontFamily: 'var(--font-body)' }}
                    required
                  >
                    <option value="">Select...</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Image Upload Card */}
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <h2
              className="text-xl font-bold text-white mb-6"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              Recipe Image
            </h2>

            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full h-48 bg-gray-900 border-2 border-dashed border-gray-700 rounded-xl cursor-pointer hover:border-fuchsia-500 transition-colors"
              >
                {formData.image ? (
                  <div className="text-center">
                    <Check className="w-12 h-12 text-green-400 mx-auto mb-2" />
                    <p className="text-white font-semibold">{formData.image.name}</p>
                    <p className="text-gray-400 text-sm mt-1">Click to change</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <ImageIcon className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                    <p className="text-white font-semibold">Upload Recipe Image</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Click to browse (PNG, JPG, up to 5MB)
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Ingredients Card */}
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <h2
              className="text-xl font-bold text-white mb-6"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              Ingredients *
            </h2>

            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentIngredient}
                  onChange={(e) => setCurrentIngredient(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
                  placeholder="e.g., 2 cups rice"
                  className="flex-1 bg-gray-900 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-fuchsia-500 transition-colors font-normal"
                  style={{ fontFamily: 'var(--font-body)' }}
                />
                <motion.button
                  type="button"
                  onClick={addIngredient}
                  className="bg-gradient-to-br from-fuchsia-600 to-pink-600 text-white rounded-xl px-6 py-3 font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-5 h-5" />
                </motion.button>
              </div>

              {formData.ingredients.length > 0 && (
                <div className="space-y-2">
                  {formData.ingredients.map((ingredient, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between bg-gray-900 rounded-lg px-4 py-3 border border-gray-700"
                    >
                      <p className="text-gray-300 font-normal" style={{ fontFamily: 'var(--font-body)' }}>
                        {ingredient}
                      </p>
                      <motion.button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X className="w-5 h-5" />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Instructions Card */}
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <h2
              className="text-xl font-bold text-white mb-6"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              Instructions *
            </h2>

            <div className="space-y-4">
              <div className="flex gap-2">
                <textarea
                  value={currentInstruction}
                  onChange={(e) => setCurrentInstruction(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      e.preventDefault();
                      addInstruction();
                    }
                  }}
                  placeholder="Describe the cooking step... (Press Ctrl+Enter to add)"
                  rows={2}
                  className="flex-1 bg-gray-900 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-fuchsia-500 transition-colors resize-none font-normal"
                  style={{ fontFamily: 'var(--font-body)' }}
                />
                <motion.button
                  type="button"
                  onClick={addInstruction}
                  className="bg-gradient-to-br from-fuchsia-600 to-pink-600 text-white rounded-xl px-6 py-3 font-semibold self-start"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-5 h-5" />
                </motion.button>
              </div>

              {formData.instructions.length > 0 && (
                <div className="space-y-2">
                  {formData.instructions.map((instruction, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-3 bg-gray-900 rounded-lg p-4 border border-gray-700"
                    >
                      <div className="w-8 h-8 bg-fuchsia-500 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="flex-1 text-gray-300 font-normal" style={{ fontFamily: 'var(--font-body)' }}>
                        {instruction}
                      </p>
                      <motion.button
                        type="button"
                        onClick={() => removeInstruction(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X className="w-5 h-5" />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            className={`w-full rounded-2xl px-8 py-4 font-bold text-lg flex items-center justify-center gap-3 shadow-xl ${
              isSubmitting
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-br from-fuchsia-600 to-pink-600 text-white'
            }`}
            whileHover={!isSubmitting ? { scale: 1.02 } : {}}
            whileTap={!isSubmitting ? { scale: 0.98 } : {}}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Uploading Recipe...
              </>
            ) : (
              <>
                <Upload className="w-6 h-6" />
                Upload Recipe
              </>
            )}
          </motion.button>
        </motion.form>
      </div>
    </div>
  );
}
