'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, ChefHat, Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your HalalMe Kitchen AI assistant. How can I help you today?\n\nYou can:\n• Tell me what ingredients you have\n• Ask for recipe suggestions\n• Get cooking tips and substitutions\n• Ask questions about halal cooking',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response (replace with actual API call later)
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateMockResponse(input),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  // Mock response generator (replace with actual AI API integration)
  const generateMockResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();

    if (lowerInput.includes('chicken') || lowerInput.includes('ingredients')) {
      return `Great! With chicken, you can make several delicious halal dishes:\n\n🍗 **Chicken Biryani**\n- Cook time: 45 minutes\n- Perfect for: Dinner parties\n\n🥘 **Butter Chicken**\n- Cook time: 40 minutes\n- Perfect for: Family dinners\n\n🍛 **Chicken Curry**\n- Cook time: 35 minutes\n- Perfect for: Quick weeknight meals\n\nWould you like the detailed recipe for any of these?`;
    } else if (lowerInput.includes('pasta')) {
      return `For halal pasta dishes, I recommend:\n\n🍝 **Halal Chicken Alfredo**\nIngredients needed:\n- Pasta (any type)\n- Chicken breast\n- Heavy cream\n- Garlic\n- Parmesan cheese\n- Butter\n\nCook time: 25 minutes\nDifficulty: Easy\n\nWould you like step-by-step instructions?`;
    } else if (lowerInput.includes('dry') || lowerInput.includes('help')) {
      return `If your chicken is too dry, here are some fixes:\n\n💡 **Immediate Fixes:**\n1. Make a quick sauce (gravy, yogurt-based)\n2. Shred the chicken and mix with sauce\n3. Add chicken broth or cream\n\n🔧 **Prevention Tips:**\n- Don't overcook (use meat thermometer: 165°F)\n- Marinate before cooking\n- Cover while cooking to retain moisture\n- Let it rest 5 minutes before cutting\n\nNeed more specific help?`;
    } else {
      return `I'd be happy to help you with that! Could you provide more details? For example:\n\n- What ingredients do you have?\n- What type of dish are you looking to make?\n- Any dietary restrictions or preferences?\n- Cooking skill level?\n\nThe more information you share, the better I can assist you!`;
    }
  };

  const quickPrompts = [
    'I have chicken, rice, and spices',
    'Show me easy breakfast recipes',
    'What can I cook in 30 minutes?',
    'Suggest vegetarian halal dishes',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-lg border-b border-gray-700">
        <div className="mx-auto max-w-4xl px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/kitchen">
                <motion.button
                  className="text-gray-400 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft className="w-6 h-6" />
                </motion.button>
              </Link>
              <div className="flex items-center gap-2 md:gap-3">
                <div className="bg-gradient-to-br from-[#FF8A1E] to-[#CC6A0F] rounded-full p-1.5 md:p-2">
                  <ChefHat className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h1
                    className="text-base md:text-xl font-bold text-white"
                    style={{ fontFamily: 'var(--font-headline)' }}
                  >
                    AI Recipe Assistant
                  </h1>
                  <p className="text-xs md:text-sm text-gray-400 hidden sm:block" style={{ fontFamily: 'var(--font-body)' }}>
                    Your personal halal cooking helper
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FF8A1E]" />
              <span className="text-sm text-gray-400">Powered by AI</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="mx-auto max-w-4xl px-4 md:px-6 py-4 md:py-8">
        <div className="space-y-4 md:space-y-6 mb-32">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] md:max-w-[80%] rounded-2xl px-4 md:px-6 py-3 md:py-4 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-[#FF8A1E] to-[#CC6A0F] text-white'
                    : 'bg-gray-800 text-gray-100 border border-gray-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  {message.role === 'assistant' && (
                    <div className="mt-1 bg-gradient-to-br from-[#FF8A1E] to-[#CC6A0F] rounded-full p-1.5">
                      <ChefHat className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p
                      className="whitespace-pre-wrap leading-relaxed font-normal"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {message.content}
                    </p>
                    <p className="text-xs mt-2 opacity-60">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-gray-800 border border-gray-700 rounded-2xl px-6 py-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-[#FF8A1E] animate-spin" />
                  <span className="text-gray-400">AI is thinking...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/98 backdrop-blur-lg border-t border-gray-700 safe-area-padding-bottom">
        <div className="mx-auto max-w-4xl px-4 md:px-6 py-3 md:py-4">
          {/* Quick Prompts */}
          {messages.length === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <p className="text-xs md:text-sm text-gray-400 mb-2 md:mb-3 font-normal" style={{ fontFamily: 'var(--font-body)' }}>
                Quick suggestions:
              </p>
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((prompt, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setInput(prompt)}
                    className="px-3 md:px-4 py-1.5 md:py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs md:text-sm rounded-full border border-gray-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex gap-2 md:gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about cooking..."
              className="flex-1 bg-gray-800 text-white text-sm md:text-base rounded-full px-4 md:px-6 py-3 md:py-4 border border-gray-700 focus:outline-none focus:border-[#FF8A1E] transition-colors font-normal"
              style={{ fontFamily: 'var(--font-body)' }}
              disabled={isLoading}
            />
            <motion.button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`rounded-full px-4 md:px-6 py-3 md:py-4 font-semibold transition-all ${
                input.trim() && !isLoading
                  ? 'bg-gradient-to-br from-[#FF8A1E] to-[#CC6A0F] text-white shadow-lg'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
              whileHover={input.trim() && !isLoading ? { scale: 1.05 } : {}}
              whileTap={input.trim() && !isLoading ? { scale: 0.95 } : {}}
            >
              <Send className="w-4 h-4 md:w-5 md:h-5" />
            </motion.button>
          </form>

          <p className="text-xs text-gray-500 mt-3 text-center font-normal" style={{ fontFamily: 'var(--font-body)' }}>
            AI responses are suggestions. Always verify ingredient compatibility with your dietary needs.
          </p>
        </div>
      </div>
    </div>
  );
}
