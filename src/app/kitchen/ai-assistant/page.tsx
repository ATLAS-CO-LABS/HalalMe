"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, ChefHat, ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

function renderMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your HalalMe Kitchen AI assistant. How can I help you today?\n\nYou can:\n• Tell me what ingredients you have\n• Ask for recipe suggestions\n• Get cooking tips and substitutions\n• Ask questions about halal cooking",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateMockResponse(input),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const generateMockResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();

    if (lowerInput.includes("chicken") || lowerInput.includes("ingredients")) {
      return `Great! With chicken, you can make several delicious halal dishes:\n\n🍗 **Chicken Biryani**\nCook time: 45 minutes · Perfect for dinner parties\n\n🥘 **Butter Chicken**\nCook time: 40 minutes · Perfect for family dinners\n\n🍛 **Chicken Curry**\nCook time: 35 minutes · Perfect for quick weeknight meals\n\nWould you like the detailed recipe for any of these?`;
    } else if (lowerInput.includes("pasta")) {
      return `For halal pasta dishes, I recommend:\n\n🍝 **Halal Chicken Alfredo**\n\nIngredients needed:\n• Pasta (any type)\n• Chicken breast\n• Heavy cream\n• Garlic, Parmesan, Butter\n\nCook time: 25 minutes · Difficulty: Easy\n\nWould you like step-by-step instructions?`;
    } else if (lowerInput.includes("dry") || lowerInput.includes("help")) {
      return `If your chicken is too dry, here are some fixes:\n\n💡 **Immediate Fixes:**\n1. Make a quick sauce (gravy, yogurt-based)\n2. Shred the chicken and mix with sauce\n3. Add chicken broth or cream\n\n🔧 **Prevention Tips:**\n• Don't overcook — use a meat thermometer (165°F)\n• Marinate before cooking\n• Cover while cooking to retain moisture\n• Let it rest 5 minutes before cutting\n\nNeed more specific help?`;
    } else {
      return `I'd be happy to help you with that! Could you provide more details?\n\n• What ingredients do you have?\n• What type of dish are you looking to make?\n• Any dietary restrictions or preferences?\n• Cooking skill level?\n\nThe more information you share, the better I can assist you!`;
    }
  };

  const quickPrompts = [
    "I have chicken, rice, and spices",
    "Easy breakfast recipes",
    "Cook something in 30 mins",
    "Vegetarian halal dishes",
  ];

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-dvh bg-gray-950">
      {/* ─── Top Bar ─── */}
      <div className="shrink-0 bg-gray-950/95 backdrop-blur-lg border-b border-white/[0.06] z-10">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/kitchen">
                <motion.button
                  className="p-2 -ml-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft className="w-5 h-5" />
                </motion.button>
              </Link>
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-9 h-9 bg-gradient-to-br from-fuchsia-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-fuchsia-500/20">
                    <ChefHat className="w-5 h-5 text-white" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-gray-950" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-white leading-tight">
                    AI Recipe Assistant
                  </h1>
                  <p className="text-[11px] text-emerald-400 font-medium leading-tight">
                    Online
                  </p>
                </div>
              </div>
            </div>
            <Link href="/">
              <Image
                src="/logo/logo.png"
                alt="HalalMe"
                width={28}
                height={28}
                className="opacity-60 hover:opacity-100 transition-opacity"
              />
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Chat Area ─── */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <div className="space-y-5">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="shrink-0 mt-1">
                    <div className="w-8 h-8 bg-gradient-to-br from-fuchsia-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <ChefHat className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] ${
                    message.role === "user"
                      ? "bg-fuchsia-600 text-white rounded-2xl rounded-br-md"
                      : "bg-white/[0.06] text-gray-200 border border-white/[0.06] rounded-2xl rounded-tl-md"
                  } px-4 py-3`}
                >
                  <div
                    className="whitespace-pre-wrap text-[14px] leading-relaxed"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {renderMarkdown(message.content)}
                  </div>
                  <p
                    className={`text-[10px] mt-2 ${
                      message.role === "user"
                        ? "text-fuchsia-200/60"
                        : "text-gray-500"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </motion.div>
            ))}

            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex gap-3"
                >
                  <div className="shrink-0 mt-1">
                    <div className="w-8 h-8 bg-gradient-to-br from-fuchsia-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <ChefHat className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="bg-white/[0.06] border border-white/[0.06] rounded-2xl rounded-tl-md px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Loader2 className="w-4 h-4 text-fuchsia-400 animate-spin" />
                      <span className="text-sm text-gray-400">Thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* ─── Input Area ─── */}
      <div className="shrink-0 border-t border-white/[0.06] bg-gray-950/95 backdrop-blur-lg">
        <div className="mx-auto max-w-3xl px-4 py-3">
          {/* Quick Prompts */}
          <AnimatePresence>
            {messages.length === 1 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3 overflow-hidden"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3 h-3 text-fuchsia-400" />
                  <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">
                    Try asking
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map((prompt, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleQuickPrompt(prompt)}
                      className="px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 hover:text-gray-200 text-xs rounded-full border border-white/[0.06] hover:border-fuchsia-500/30 transition-all"
                      whileTap={{ scale: 0.97 }}
                    >
                      {prompt}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about recipes, ingredients, tips..."
                className="w-full bg-white/[0.05] text-white text-sm rounded-xl px-4 py-3 border border-white/[0.08] focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/20 transition-all placeholder:text-gray-600"
                style={{ fontFamily: "var(--font-body)" }}
                disabled={isLoading}
              />
            </div>
            <motion.button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`shrink-0 rounded-xl p-3 transition-all ${
                input.trim() && !isLoading
                  ? "bg-gradient-to-br from-fuchsia-500 to-pink-600 text-white shadow-lg shadow-fuchsia-500/20"
                  : "bg-white/[0.04] text-gray-600 cursor-not-allowed"
              }`}
              whileHover={input.trim() && !isLoading ? { scale: 1.05 } : {}}
              whileTap={input.trim() && !isLoading ? { scale: 0.95 } : {}}
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </form>

          <p className="text-[10px] text-gray-600 mt-2 text-center">
            AI responses are suggestions. Always verify ingredients with your
            dietary needs.
          </p>
        </div>
      </div>
    </div>
  );
}
