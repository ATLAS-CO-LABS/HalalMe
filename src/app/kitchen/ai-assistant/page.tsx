"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, ChefHat, Plus, MessageSquare,
  Menu, X, RotateCcw, Sparkles,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

/* ─── Types ─────────────────────────────────────────────────────── */
type Role    = "user" | "assistant";
type Message = { id: string; role: Role; content: string; ts: Date };
type Conv    = { id: string; title: string; group: string };

/* ─── Palette ────────────────────────────────────────────────────── */
const BG       = "#08060F";
const BG_SIDE  = "#0C0918";
const BG_CARD  = "#130F1F";
const BG_USER  = "#1A1228";
const CREAM    = "#F7E7CE";
const FX       = "#a21caf";
const FX2      = "#a855f7";

/* ─── Mock conversations ─────────────────────────────────────────── */
const CONVS: Conv[] = [
  { id: "c1", title: "Chicken Biryani Recipe",   group: "Today"        },
  { id: "c2", title: "Quick Breakfast Ideas",    group: "Today"        },
  { id: "c3", title: "30-Minute Halal Meals",    group: "Yesterday"    },
  { id: "c4", title: "Vegetarian Halal Dishes",  group: "Yesterday"    },
  { id: "c5", title: "Lamb Chop Marinade Tips",  group: "Last 7 Days"  },
  { id: "c6", title: "Halal Pasta Alternatives", group: "Last 7 Days"  },
  { id: "c7", title: "Eid Feast Planning",       group: "Last 7 Days"  },
];

const CONV_GROUPS = ["Today", "Yesterday", "Last 7 Days"];

/* ─── Welcome suggestion cards ───────────────────────────────────── */
const SUGGESTIONS = [
  { emoji: "🍗", title: "Quick dinner ideas",   sub: "with chicken & rice"   },
  { emoji: "🥗", title: "Healthy halal meals",  sub: "for the whole family"  },
  { emoji: "🍳", title: "Easy breakfast",        sub: "ready in 15 minutes"   },
  { emoji: "🎉", title: "Special occasion",      sub: "impress your guests"   },
];

/* ─── Markdown renderer ──────────────────────────────────────────── */
function md(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith("**") && p.endsWith("**")
      ? <strong key={i} style={{ color: CREAM, fontWeight: 600 }}>{p.slice(2, -2)}</strong>
      : <span key={i}>{p}</span>
  );
}

/* ─── Mock AI responses ──────────────────────────────────────────── */
function aiReply(q: string): string {
  const s = q.toLowerCase();
  if (s.includes("chicken") || s.includes("ingredient"))
    return `Great! With chicken, here are some delicious halal dishes:\n\n🍗 **Chicken Biryani**\nCook time: 45 min · Perfect for dinner parties\n\n🥘 **Butter Chicken**\nCook time: 40 min · Perfect for family dinners\n\n🍛 **Chicken Curry**\nCook time: 35 min · Weeknight favourite\n\nWould you like the full recipe for any of these?`;
  if (s.includes("pasta"))
    return `For halal pasta, I recommend:\n\n🍝 **Halal Chicken Alfredo**\n\nIngredients:\n• Pasta · Chicken breast · Heavy cream\n• Garlic · Parmesan · Butter\n\nCook time: 25 min · Difficulty: Easy\n\nWould you like step-by-step instructions?`;
  if (s.includes("breakfast"))
    return `Quick halal breakfast ideas:\n\n🥚 **Shakshuka** — Eggs in spiced tomato sauce · 20 min\n🥞 **Halal Sausage Pancakes** — Fluffy & filling · 15 min\n🫓 **Avocado Toast with Feta** — Light & fresh · 10 min\n\nWant a full recipe for any of these?`;
  if (s.includes("vegetarian"))
    return `Vegetarian halal dishes:\n\n🍲 **Chana Masala** — Spiced chickpea curry · 30 min\n🥗 **Fattoush Salad** — Fresh Lebanese salad · 15 min\n🧆 **Falafel Wrap** — Crispy chickpea fritters · 25 min\n\nAll naturally halal and full of flavour!`;
  if (s.includes("30") || s.includes("quick") || s.includes("fast"))
    return `Meals in 30 minutes or less:\n\n⚡ **One-Pan Chicken & Rice** — 25 min\n⚡ **Grilled Halal Lamb Chops** — 20 min\n⚡ **Red Lentil Soup** — 30 min\n\nWhich would you like to try?`;
  return `I'd be happy to help! A few more details would be useful:\n\n• What ingredients do you have?\n• What type of dish are you looking for?\n• How much time do you have?\n• Any dietary preferences?\n\nThe more you share, the better I can assist!`;
}

/* ─── Time formatter (no locale issues) ─────────────────────────── */
const fmt = (d: Date) =>
  `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

/* ─── Sidebar content (shared between desktop + mobile) ─────────── */
type SidebarProps = {
  activeConv: string;
  onConvClick: (id: string) => void;
  onNewChat: () => void;
  onClose?: () => void;
};

function SidebarContent({ activeConv, onConvClick, onNewChat, onClose }: SidebarProps) {
  return (
    <>
      {/* Header */}
      <div
        className="shrink-0 px-4 py-4 flex items-center justify-between"
        style={{ borderBottom: `1px solid ${CREAM}08` }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 flex items-center justify-center" style={{ backgroundColor: FX }}>
            <ChefHat className="w-4 h-4 text-white" strokeWidth={1.5} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-px" style={{ backgroundColor: FX2 }} />
              <span className="text-[10px] font-extrabold uppercase" style={{ color: CREAM, letterSpacing: "0.2em" }}>
                Kitchen AI
              </span>
            </div>
            <span className="text-[9px] font-bold uppercase" style={{ color: `${CREAM}30`, letterSpacing: "0.16em" }}>
              HalalMe
            </span>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 transition-colors"
            style={{ color: `${CREAM}35` }}
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        )}
      </div>

      {/* New Chat */}
      <div className="px-3 py-3 shrink-0">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-[11px] font-extrabold uppercase transition-colors hover:opacity-90"
          style={{ backgroundColor: FX, color: "#fff", letterSpacing: "0.18em" }}
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
          New Conversation
        </button>
      </div>

      {/* Conversations */}
      <nav className="flex-1 overflow-y-auto px-2 pb-4" style={{ scrollbarWidth: "none" }}>
        {CONV_GROUPS.map(group => {
          const items = CONVS.filter(c => c.group === group);
          return (
            <div key={group} className="mb-5">
              <div className="px-2 py-1.5">
                <span
                  className="text-[9px] font-bold uppercase"
                  style={{ color: `${CREAM}28`, letterSpacing: "0.22em" }}
                >
                  {group}
                </span>
              </div>
              <div className="space-y-px">
                {items.map(conv => {
                  const active = activeConv === conv.id;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => onConvClick(conv.id)}
                      className="w-full text-left px-2.5 py-2 flex items-center gap-2.5 transition-colors"
                      style={{
                        backgroundColor: active ? `${FX2}12` : "transparent",
                        borderLeft: `2px solid ${active ? FX2 : "transparent"}`,
                      }}
                    >
                      <MessageSquare
                        className="w-3.5 h-3.5 shrink-0"
                        strokeWidth={1.5}
                        style={{ color: active ? FX2 : `${CREAM}28` }}
                      />
                      <span
                        className="text-xs truncate"
                        style={{
                          color: active ? CREAM : `${CREAM}50`,
                          fontWeight: active ? 600 : 400,
                        }}
                      >
                        {conv.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="shrink-0 px-4 py-3 flex items-center gap-2"
        style={{ borderTop: `1px solid ${CREAM}08` }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#4ade80" }} />
        <span
          className="text-[9px] font-bold uppercase"
          style={{ color: `${CREAM}28`, letterSpacing: "0.18em" }}
        >
          Kitchen AI v1.0
        </span>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>(() => [{
    id: "init",
    role: "assistant",
    content: "Hello! I'm your HalalMe Kitchen AI assistant. How can I help you today?\n\nYou can:\n• Tell me what ingredients you have\n• Ask for recipe suggestions\n• Get cooking tips and substitutions\n• Ask questions about halal cooking",
    ts: new Date(),
  }]);
  const [input, setInput]               = useState("");
  const [isLoading, setIsLoading]       = useState(false);
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [activeConv, setActiveConv]     = useState("current");

  const chatRef     = useRef<HTMLDivElement>(null);
  const bottomRef   = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* ── Scroll ── */
  const scrollDown = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);
  useEffect(() => { scrollDown(); }, [messages, scrollDown]);

  /* ── Textarea resize ── */
  const resize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  /* ── Submit ── */
  const submit = () => {
    if (!input.trim() || isLoading) return;
    const msg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      ts: new Date(),
    };
    setMessages(p => [...p, msg]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsLoading(true);
    const captured = msg.content;
    setTimeout(() => {
      setMessages(p => [...p, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiReply(captured),
        ts: new Date(),
      }]);
      setIsLoading(false);
    }, 1400);
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
  };

  const reset = () => {
    setMessages([{
      id: Date.now().toString(),
      role: "assistant",
      content: "Hello! I'm your HalalMe Kitchen AI assistant. How can I help you today?\n\nYou can:\n• Tell me what ingredients you have\n• Ask for recipe suggestions\n• Get cooking tips and substitutions\n• Ask questions about halal cooking",
      ts: new Date(),
    }]);
    setInput("");
    setIsLoading(false);
    setActiveConv("current");
    setSidebarOpen(false);
  };

  const handleConvClick = (id: string) => {
    setActiveConv(id);
    setSidebarOpen(false);
  };

  const hasUser = messages.some(m => m.role === "user");

  /* ═══════════════════════════════════════════════════════════════ */
  return (
    <div
      className="fixed inset-0 flex overflow-hidden"
      style={{ backgroundColor: BG, color: CREAM, zIndex: 50 }}
    >

      {/* ── Desktop Sidebar ──────────────────────────────────────── */}
      <aside
        className="hidden lg:flex flex-col shrink-0"
        style={{
          width: 248,
          backgroundColor: BG_SIDE,
          borderRight: `1px solid ${CREAM}0C`,
        }}
      >
        <SidebarContent
          activeConv={activeConv}
          onConvClick={handleConvClick}
          onNewChat={reset}
        />
      </aside>

      {/* ── Mobile Sidebar (overlay) ─────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-[60] flex lg:hidden">
            <motion.aside
              className="flex flex-col h-full shrink-0"
              style={{ width: 260, backgroundColor: BG_SIDE, borderRight: `1px solid ${CREAM}0C` }}
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
            >
              <SidebarContent
                activeConv={activeConv}
                onConvClick={handleConvClick}
                onNewChat={reset}
                onClose={() => setSidebarOpen(false)}
              />
            </motion.aside>
            <motion.div
              className="flex-1"
              style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* ── Main Panel ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header
          className="shrink-0 flex items-center justify-between px-4 h-14"
          style={{ backgroundColor: BG, borderBottom: `1px solid ${CREAM}0C` }}
        >
          {/* Left */}
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1.5 -ml-1.5"
              style={{ color: `${CREAM}45` }}
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" strokeWidth={1.75} />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 flex items-center justify-center shrink-0" style={{ backgroundColor: FX }}>
                <ChefHat className="w-4 h-4 text-white" strokeWidth={1.5} />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-px" style={{ backgroundColor: FX2 }} />
                  <span className="text-[11px] font-extrabold uppercase" style={{ color: CREAM, letterSpacing: "0.2em" }}>
                    AI Recipe Assistant
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#4ade80" }} />
                  <span className="text-[9px] font-bold uppercase" style={{ color: "#4ade80", letterSpacing: "0.18em" }}>
                    Online
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {hasUser && (
              <motion.button
                onClick={reset}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold uppercase transition-all"
                style={{
                  color: `${CREAM}40`,
                  border: `1px solid ${CREAM}10`,
                  letterSpacing: "0.14em",
                }}
                whileHover={{ color: CREAM, borderColor: `${CREAM}25` } as never}
                whileTap={{ scale: 0.95 }}
              >
                <RotateCcw className="w-3 h-3" strokeWidth={2} />
                <span className="hidden sm:inline">New Chat</span>
              </motion.button>
            )}
            <Link href="/">
              <Image
                src="/logo/logo.png"
                alt="HalalMe"
                width={26}
                height={26}
                className="opacity-40 hover:opacity-90 transition-opacity"
              />
            </Link>
          </div>
        </header>

        {/* ── Chat Area ──────────────────────────────────────────── */}
        <div
          ref={chatRef}
          className="flex-1 min-h-0 overflow-y-auto"
          style={{
            backgroundImage: `radial-gradient(${CREAM}04 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        >

          {/* Welcome state */}
          <AnimatePresence>
            {!hasUser && (
              <motion.div
                className="flex flex-col items-center justify-center min-h-full px-4 py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
              >
                {/* Glow icon */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="relative mb-7"
                >
                  <div
                    className="w-16 h-16 flex items-center justify-center relative z-10"
                    style={{ backgroundColor: FX }}
                  >
                    <ChefHat className="w-8 h-8 text-white" strokeWidth={1.25} />
                  </div>
                  <div
                    className="absolute inset-0 z-0"
                    style={{
                      background: `radial-gradient(circle, ${FX}40 0%, transparent 70%)`,
                      filter: "blur(16px)",
                      transform: "scale(2)",
                    }}
                  />
                </motion.div>

                {/* Heading */}
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12, duration: 0.4 }}
                  className="text-center mb-10"
                >
                  <div className="flex items-center justify-center gap-4 mb-3">
                    <div className="w-10 h-px" style={{ backgroundColor: `${FX}80` }} />
                    <h1
                      className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tighter"
                      style={{ color: CREAM }}
                    >
                      What would you like to cook?
                    </h1>
                    <div className="w-10 h-px" style={{ backgroundColor: `${FX}80` }} />
                  </div>
                  <p className="text-sm" style={{ color: `${CREAM}45`, letterSpacing: "0.04em" }}>
                    Your AI-powered halal cooking companion
                  </p>
                </motion.div>

                {/* Suggestion cards */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="grid grid-cols-2 gap-3 w-full max-w-lg"
                >
                  {SUGGESTIONS.map((s, i) => (
                    <motion.button
                      key={i}
                      onClick={() => { setInput(`${s.title} ${s.sub}`); textareaRef.current?.focus(); }}
                      className="text-left p-4 transition-all"
                      style={{
                        backgroundColor: BG_CARD,
                        border: `1px solid ${CREAM}0D`,
                      }}
                      whileHover={{
                        backgroundColor: `${FX2}0C`,
                        borderColor: `${FX2}35`,
                        y: -2,
                      } as never}
                      whileTap={{ scale: 0.97 }}
                    >
                      <div className="text-xl mb-2">{s.emoji}</div>
                      <div
                        className="text-sm font-extrabold uppercase tracking-tight"
                        style={{ color: CREAM, letterSpacing: "-0.01em" }}
                      >
                        {s.title}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: `${CREAM}45` }}>
                        {s.sub}
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages */}
          {hasUser && (
            <div className="max-w-2xl mx-auto px-4 pt-8 pb-4 space-y-7">
              {messages.map((msg, idx) => {
                const isFirst = idx === 0 || messages[idx - 1]?.role !== msg.role;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {/* Role label */}
                    {isFirst && (
                      <div
                        className={`flex items-center gap-2 mb-2 ${
                          msg.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        {msg.role === "assistant" && (
                          <div
                            className="w-5 h-5 flex items-center justify-center shrink-0"
                            style={{ backgroundColor: FX }}
                          >
                            <ChefHat className="w-3 h-3 text-white" strokeWidth={1.5} />
                          </div>
                        )}
                        <span
                          className="text-[9px] font-bold uppercase"
                          style={{
                            color: msg.role === "assistant" ? `${FX2}75` : `${CREAM}32`,
                            letterSpacing: "0.22em",
                          }}
                        >
                          {msg.role === "assistant" ? "Kitchen AI" : "You"}
                        </span>
                        {msg.role === "user" && (
                          <div
                            className="w-5 h-5 flex items-center justify-center text-[9px] font-extrabold"
                            style={{
                              backgroundColor: `${CREAM}10`,
                              color: `${CREAM}55`,
                              border: `1px solid ${CREAM}15`,
                            }}
                          >
                            U
                          </div>
                        )}
                      </div>
                    )}

                    {/* Bubble */}
                    <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className="max-w-[88%] px-4 py-3"
                        style={
                          msg.role === "user"
                            ? { backgroundColor: BG_USER, color: CREAM }
                            : {
                                backgroundColor: BG_CARD,
                                color: `${CREAM}CC`,
                                borderLeft: `2px solid ${FX2}50`,
                              }
                        }
                      >
                        <div
                          className="whitespace-pre-wrap text-sm leading-[1.8]"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          {md(msg.content)}
                        </div>
                        <div
                          className="text-[9px] mt-2 uppercase font-semibold"
                          style={{ color: `${CREAM}20`, letterSpacing: "0.16em" }}
                        >
                          {fmt(msg.ts)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Thinking */}
              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 flex items-center justify-center" style={{ backgroundColor: FX }}>
                        <ChefHat className="w-3 h-3 text-white" strokeWidth={1.5} />
                      </div>
                      <span className="text-[9px] font-bold uppercase" style={{ color: `${FX2}75`, letterSpacing: "0.22em" }}>
                        Kitchen AI
                      </span>
                    </div>
                    <div
                      className="inline-flex items-center gap-2 px-4 py-3"
                      style={{ backgroundColor: BG_CARD, borderLeft: `2px solid ${FX2}50` }}
                    >
                      {[0, 1, 2].map(i => (
                        <motion.span
                          key={i}
                          className="block w-1.5 h-1.5"
                          style={{ backgroundColor: FX2 }}
                          animate={{ opacity: [0.15, 1, 0.15], scaleY: [0.6, 1, 0.6] }}
                          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
                        />
                      ))}
                      <span
                        className="text-[10px] font-bold uppercase ml-1"
                        style={{ color: `${CREAM}35`, letterSpacing: "0.2em" }}
                      >
                        Thinking
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Scroll anchor — always present */}
          <div ref={bottomRef} className="h-px" />
        </div>

        {/* ── Input Area ─────────────────────────────────────────── */}
        <div
          className="shrink-0 px-4 pt-3 pb-4"
          style={{ backgroundColor: BG, borderTop: `1px solid ${CREAM}0C` }}
        >
          <div className="max-w-2xl mx-auto">
            {/* Input container */}
            <div
              className="relative transition-colors"
              style={{ backgroundColor: BG_CARD, border: `1px solid ${CREAM}14` }}
              id="chat-input-container"
            >
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={e => { setInput(e.target.value); resize(); }}
                onKeyDown={onKey}
                placeholder={hasUser ? "Continue the conversation…" : "Ask about recipes, ingredients, cooking tips…"}
                disabled={isLoading}
                className="w-full resize-none text-sm outline-none px-4 py-3 pr-12"
                style={{
                  backgroundColor: "transparent",
                  color: CREAM,
                  fontFamily: "var(--font-body)",
                  minHeight: 48,
                  maxHeight: 120,
                  lineHeight: 1.6,
                  overflowY: "auto",
                  scrollbarWidth: "none",
                }}
                onFocus={() => {
                  const el = document.getElementById("chat-input-container");
                  if (el) el.style.borderColor = `${FX2}45`;
                }}
                onBlur={() => {
                  const el = document.getElementById("chat-input-container");
                  if (el) el.style.borderColor = `${CREAM}14`;
                }}
              />
              {/* Send button inside container */}
              <motion.button
                type="button"
                onClick={submit}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 bottom-2 w-8 h-8 flex items-center justify-center transition-colors"
                style={
                  input.trim() && !isLoading
                    ? { backgroundColor: FX, color: "#fff" }
                    : { backgroundColor: `${CREAM}07`, color: `${CREAM}22` }
                }
                whileHover={input.trim() && !isLoading ? { scale: 1.08 } as never : {}}
                whileTap={input.trim() && !isLoading ? { scale: 0.92 } as never : {}}
              >
                <Send className="w-3.5 h-3.5" strokeWidth={2} />
              </motion.button>
            </div>

            {/* Footer hint */}
            <div className="flex items-center justify-between mt-1.5 px-0.5">
              <span
                className="text-[9px] font-semibold uppercase"
                style={{ color: `${CREAM}18`, letterSpacing: "0.14em" }}
              >
                Enter to send · Shift+Enter for new line
              </span>
              <span
                className="text-[9px] font-semibold uppercase"
                style={{ color: `${CREAM}18`, letterSpacing: "0.14em" }}
              >
                Always verify halal
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        textarea::placeholder { color: rgba(247,231,206,0.22); }
        textarea::-webkit-scrollbar { display: none; }
        nav::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
