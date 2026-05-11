"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Plus, MessageSquare,
  Menu, X, RotateCcw, Sparkles, Loader2,
  BookmarkPlus, Check, Copy, Trash2, Clock, Users, Flame,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { recipeService, AIRequestError } from "@/services/recipeService";
import { useAuth } from "@/hooks/useAuth";
import { useAuthGate } from "@/hooks/useAuthGate";
import type { AIAssistantResponse, AIMessage } from "@/types";

// ── Palette ───────────────────────────────────────────────────────────
const BG      = "#1C1C1C";
const BG_SIDE = "#161616";
const CREAM   = "#F0DFC0";
const GOLD    = "#C9973A";
const VIOLET  = "#F03E9E";   // bright magenta
const FUCHSIA = "#C41E73";   // deep magenta
const FX      = FUCHSIA;
const FX2     = VIOLET;

// ── Types ─────────────────────────────────────────────────────────────
type Role    = "user" | "assistant";
type Message = {
  id: string;
  role: Role;
  content: string;
  ts: Date;
  responseType?: "chat" | "recipe";
  recipe?: AIAssistantResponse["recipe"];
  recipeId?: string | null;
  requestsRemaining?: number;
  aiMessage?: string;
};
type Conv = { id: string; title: string; group: string };

// ── Suggestion cards ──────────────────────────────────────────────────
const SUGGESTIONS = [
  { emoji: "🍗", title: "What can I cook",    sub: "with chicken & rice?",      grad: "from-violet-900/40 to-purple-900/20" },
  { emoji: "🥗", title: "Healthy meal ideas", sub: "for the whole family",      grad: "from-emerald-900/30 to-teal-900/20"  },
  { emoji: "🍳", title: "Quick breakfast",     sub: "ready in 15 minutes",       grad: "from-amber-900/30 to-orange-900/20"  },
  { emoji: "🎉", title: "Special occasion",    sub: "impress your guests",       grad: "from-rose-900/30 to-pink-900/20"     },
];

// ── Helpers ───────────────────────────────────────────────────────────
const fmt = (d: Date) =>
  `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

function md(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith("**") && p.endsWith("**")
      ? <strong key={i} style={{ color: CREAM, fontWeight: 700 }}>{p.slice(2, -2)}</strong>
      : <span key={i}>{p}</span>
  );
}

// ── Recipe Card ───────────────────────────────────────────────────────
function RecipeContent({ recipe }: { recipe: NonNullable<AIAssistantResponse["recipe"]> }) {
  const totalTime = (recipe.prep_time_mins ?? 0) + (recipe.cook_time_mins ?? 0);

  const diffColor: Record<string, string> = {
    easy:   "#4ade80",
    medium: GOLD,
    hard:   "#f87171",
  };

  return (
    <div className="mt-3 overflow-hidden" style={{ borderRadius: 2 }}>
      {/* Recipe header strip */}
      <div className="px-4 pt-4 pb-3" style={{
        background: `linear-gradient(135deg, rgba(180,20,100,0.18) 0%, rgba(196,30,115,0.08) 100%)`,
        borderBottom: `1px solid rgba(240,62,158,0.15)`,
      }}>
        <h3 className="text-base font-black uppercase tracking-tight leading-tight" style={{ color: CREAM }}>
          {recipe.title}
        </h3>
        {recipe.description && (
          <p className="mt-1 text-xs leading-relaxed" style={{ color: `${CREAM}90` }}>
            {recipe.description}
          </p>
        )}
        {/* Meta chips */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {recipe.cuisine && (
            <span className="text-[9px] font-bold uppercase px-2 py-0.5"
              style={{ background: "rgba(240,62,158,0.12)", color: VIOLET, border: "1px solid rgba(240,62,158,0.25)", letterSpacing: "0.14em" }}>
              {recipe.cuisine}
            </span>
          )}
          {recipe.difficulty && (
            <span className="text-[9px] font-bold uppercase px-2 py-0.5"
              style={{ background: "rgba(201,151,58,0.10)", color: diffColor[recipe.difficulty] ?? GOLD, border: `1px solid ${diffColor[recipe.difficulty] ?? GOLD}30`, letterSpacing: "0.14em" }}>
              {recipe.difficulty}
            </span>
          )}
          {totalTime > 0 && (
            <span className="flex items-center gap-1 text-[9px] font-bold uppercase" style={{ color: `${CREAM}55`, letterSpacing: "0.12em" }}>
              <Clock className="w-2.5 h-2.5" /> {totalTime} min
            </span>
          )}
          {(recipe.servings ?? 0) > 0 && (
            <span className="flex items-center gap-1 text-[9px] font-bold uppercase" style={{ color: `${CREAM}55`, letterSpacing: "0.12em" }}>
              <Users className="w-2.5 h-2.5" /> {recipe.servings} servings
            </span>
          )}
        </div>
      </div>

      {/* Ingredients */}
      <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(247,224,192,0.06)" }}>
        <div className="flex items-center gap-2 mb-2.5">
          <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: VIOLET }}>Ingredients</span>
          <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, rgba(240,62,158,0.3), transparent)` }} />
        </div>
        <ul className="space-y-1.5">
          {recipe.ingredients.map((ing, i) => {
            const label = [ing.amount, ing.unit, ing.name].filter(Boolean).join(" ").trim() || ing.name;
            return (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: `${CREAM}CC` }}>
                <span className="mt-1.5 w-1 h-1 shrink-0 rounded-full" style={{ backgroundColor: `${VIOLET}60` }} />
                {label}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Instructions */}
      <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(247,224,192,0.06)" }}>
        <div className="flex items-center gap-2 mb-2.5">
          <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: VIOLET }}>Instructions</span>
          <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, rgba(240,62,158,0.3), transparent)` }} />
        </div>
        <ol className="space-y-3">
          {recipe.instructions.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="shrink-0 w-5 h-5 flex items-center justify-center text-[9px] font-black mt-0.5"
                style={{ background: "rgba(240,62,158,0.15)", color: VIOLET, border: "1px solid rgba(240,62,158,0.3)" }}>
                {step.step || i + 1}
              </span>
              <span className="text-sm leading-[1.7]" style={{ color: `${CREAM}CC` }}>{step.text}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Nutrition */}
      {recipe.nutrition && (
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-3 h-3" style={{ color: GOLD }} />
            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: GOLD }}>Nutrition</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Cal",     val: recipe.nutrition.calories, unit: "kcal" },
              { label: "Protein", val: recipe.nutrition.protein,  unit: "g"    },
              { label: "Carbs",   val: recipe.nutrition.carbs,    unit: "g"    },
              { label: "Fat",     val: recipe.nutrition.fat,      unit: "g"    },
            ].map(({ label, val, unit }) => (
              <div key={label} className="text-center py-1.5 px-1"
                style={{ background: "rgba(201,151,58,0.06)", border: "1px solid rgba(201,151,58,0.12)" }}>
                <div className="text-xs font-black" style={{ color: CREAM }}>{val}</div>
                <div className="text-[8px] font-bold uppercase" style={{ color: `${GOLD}80`, letterSpacing: "0.1em" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function buildRecipeHistorySummary(recipe: NonNullable<AIAssistantResponse["recipe"]>, intro?: string): string {
  return [
    "[RECIPE GENERATED]",
    `Title: ${recipe.title}`,
    intro ? `Intro: ${intro}` : null,
    "A full recipe has already been provided in this conversation.",
  ].filter(Boolean).join("\n");
}

// ── Sidebar ───────────────────────────────────────────────────────────
type SidebarProps = {
  convs: Conv[];
  activeConv: string;
  onConvClick: (id: string) => void;
  onNewChat: () => void;
  onDelete: (id: string) => void;
  userName?: string;
  userInitial?: string;
  onClose?: () => void;
};

function SidebarContent({ convs, activeConv, onConvClick, onNewChat, onDelete, userName, userInitial, onClose }: SidebarProps) {
  const groups = ["Today", "Yesterday", "This Week", "This Month", "Older"];
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <>
      {/* Sidebar top accent */}
      <div style={{ height: 2, background: `linear-gradient(to right, ${FUCHSIA}, ${VIOLET}, transparent)` }} />

      {/* Logo header */}
      <div className="shrink-0 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Image src="/logo/aqi.png" alt="AQI" width={32} height={32} className="object-contain rounded-full bg-white p-1.5" />
            <div className="absolute inset-0 rounded-full" style={{ boxShadow: `0 0 12px rgba(240,62,158,0.5)` }} />
          </div>
          <div>
            <span className="text-sm font-black uppercase" style={{ color: CREAM, letterSpacing: "0.22em" }}>AQI</span>
            <div className="text-[8px] font-bold uppercase" style={{ color: `${CREAM}35`, letterSpacing: "0.2em" }}>by HalalMe</div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 transition-opacity hover:opacity-70" style={{ color: `${CREAM}40` }}>
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        )}
      </div>

      {/* New chat button */}
      <div className="px-3 pb-3 shrink-0">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-[10px] font-black uppercase transition-all hover:brightness-110 active:scale-98"
          style={{
            background: `linear-gradient(135deg, ${FUCHSIA}, ${VIOLET})`,
            color: "#fff",
            letterSpacing: "0.2em",
          }}
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
          New Conversation
        </button>
      </div>

      {/* Divider */}
      <div className="mx-4 mb-3" style={{ height: 1, background: `rgba(240,62,158,0.12)` }} />

      {/* Conversations */}
      <nav className="flex-1 overflow-y-auto px-2 pb-4" style={{ scrollbarWidth: "none" }}>
        {groups.map((group) => {
          const items = convs.filter((c) => c.group === group);
          if (!items.length) return null;
          return (
            <div key={group} className="mb-4">
              <div className="px-2 py-1.5 flex items-center gap-2">
                <div className="w-1 h-1" style={{ backgroundColor: `${VIOLET}50` }} />
                <span className="text-[8px] font-black uppercase" style={{ color: `${CREAM}28`, letterSpacing: "0.28em" }}>
                  {group}
                </span>
              </div>
              {items.map((conv) => {
                const active  = activeConv === conv.id;
                const hovered = hoveredId === conv.id;
                return (
                  <div
                    key={conv.id}
                    className="relative flex items-center mb-0.5 transition-all duration-150"
                    style={{
                      background: active
                        ? `linear-gradient(90deg, rgba(240,62,158,0.12), transparent)`
                        : hovered ? `rgba(247,224,192,0.04)` : "transparent",
                      borderLeft: `2px solid ${active ? VIOLET : "transparent"}`,
                    }}
                    onMouseEnter={() => setHoveredId(conv.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <button
                      onClick={() => onConvClick(conv.id)}
                      className="flex-1 text-left px-2.5 py-2 flex items-center gap-2 min-w-0"
                    >
                      <MessageSquare className="w-3 h-3 shrink-0" strokeWidth={active ? 2 : 1.5}
                        style={{ color: active ? VIOLET : `${CREAM}25` }} />
                      <span className="text-xs truncate" style={{
                        color: active ? CREAM : `${CREAM}45`,
                        fontWeight: active ? 700 : 400,
                      }}>
                        {conv.title}
                      </span>
                    </button>
                    {hovered && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
                        className="shrink-0 p-1.5 mr-1 transition-colors"
                        style={{ color: `${CREAM}25` }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = `${CREAM}25`)}
                      >
                        <Trash2 className="w-3 h-3" strokeWidth={1.75} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
        {convs.length === 0 && (
          <div className="px-4 mt-6 text-center">
            <MessageSquare className="w-6 h-6 mx-auto mb-2" style={{ color: `${CREAM}12` }} strokeWidth={1} />
            <p className="text-[9px] uppercase" style={{ color: `${CREAM}20`, letterSpacing: "0.14em" }}>
              No conversations yet
            </p>
          </div>
        )}
      </nav>

      {/* User footer */}
      <div className="shrink-0 px-3 py-3 flex items-center gap-2.5" style={{
        borderTop: `1px solid rgba(240,62,158,0.10)`,
        background: `rgba(240,62,158,0.03)`,
      }}>
        <div className="w-7 h-7 flex items-center justify-center text-[10px] font-black shrink-0"
          style={{
            background: `linear-gradient(135deg, rgba(196,30,115,0.3), rgba(240,62,158,0.15))`,
            color: VIOLET,
            border: `1px solid rgba(240,62,158,0.3)`,
          }}>
          {userInitial ?? "?"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold truncate" style={{ color: `${CREAM}65` }}>
            {userName ?? "Guest"}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: "#4ade80" }} />
            <span className="text-[7px] font-black uppercase" style={{ color: `${CREAM}25`, letterSpacing: "0.2em" }}>
              AQI v1.0
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

const CHAT_STORAGE_KEY = "kitchen-ai-chat";

const WELCOME: Message = {
  id: "init",
  role: "assistant",
  content: "Salam! I'm AQI - your halal cooking companion 👨‍🍳\n\nTell me what's in your fridge, ask about a dish, or just say hi. I'll suggest ideas, answer cooking questions, and generate a full recipe whenever you're ready.\n\nWhat are we cooking today?",
  ts: new Date(),
  responseType: "chat",
};

// ═══════════════════════════════════════════════════════════════════════
export default function AIAssistantPage() {
  const router              = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { requireAuth } = useAuthGate();

  const [messages, setMessages]         = useState<Message[]>([WELCOME]);
  const [input, setInput]               = useState("");
  const [isLoading, setIsLoading]       = useState(false);
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [activeConv, setActiveConv]     = useState("current");
  const [convs, setConvs]               = useState<Conv[]>([]);
  const [requestsLeft, setRequestsLeft] = useState<number | null>(null);
  const [savedIds, setSavedIds]         = useState<Set<string>>(new Set());
  const [sessionId, setSessionId]       = useState<string | null>(null);
  const [copiedId, setCopiedId]         = useState<string | null>(null);
  const [inputFocused, setInputFocused] = useState(false);

  const [streamingContent, setStreamingContent] = useState<string | null>(null);
  const abortRef       = useRef<AbortController | null>(null);
  const chatRef        = useRef<HTMLDivElement>(null);
  const bottomRef      = useRef<HTMLDivElement>(null);
  const textareaRef    = useRef<HTMLTextAreaElement>(null);
  const hasRestoredRef = useRef(false);

  useEffect(() => { return () => { abortRef.current?.abort(); }; }, []);

  const loadConvs = useCallback(() => {
    if (!user) return;
    import("@/services/supabase").then(({ supabase }) => {
      supabase
        .from("ai_chat_sessions")
        .select("id, created_at, messages")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20)
        .then(({ data }) => {
          if (!data) return;
          const now = new Date();
          const grouped: Conv[] = data.map((s) => {
            const date = new Date(s.created_at);
            const diff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
            const group = diff < 1 ? "Today" : diff < 2 ? "Yesterday" : diff < 7 ? "This Week" : diff < 30 ? "This Month" : "Older";
            const msgs  = Array.isArray(s.messages) ? s.messages as { role: string; content: unknown }[] : [];
            const first = msgs.find((m) => m.role === "user");
            const raw   = typeof first?.content === "string" ? first.content : "New conversation";
            const title = raw.length > 40 ? raw.slice(0, 40).trimEnd() + "…" : raw;
            return { id: s.id, title, group };
          });
          setConvs(grouped);
        });
    });
  }, [user]);

  useEffect(() => { loadConvs(); }, [loadConvs]);

  // Auto-send message typed in the AQI landing section before redirect
  useEffect(() => {
    if (!user || authLoading) return;
    const pending = sessionStorage.getItem("aqi_pending_message");
    if (!pending) return;
    sessionStorage.removeItem("aqi_pending_message");
    const t = setTimeout(() => doSubmit(pending), 300);
    return () => clearTimeout(t);
  }, [user, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const scrollDown = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);
  useEffect(() => { scrollDown(); }, [messages, streamingContent, scrollDown]);

  useEffect(() => {
    if (authLoading || hasRestoredRef.current) return;
    hasRestoredRef.current = true;
    try {
      const saved = sessionStorage.getItem(CHAT_STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as { userId?: string; messages: Message[] };
      if (parsed.userId !== user?.id) { sessionStorage.removeItem(CHAT_STORAGE_KEY); return; }
      if (Array.isArray(parsed.messages) && parsed.messages.length > 1) {
        setMessages(parsed.messages.map((m) => ({ ...m, ts: new Date(m.ts as unknown as string) })));
      }
    } catch {}
  }, [authLoading, user?.id]);

  useEffect(() => {
    if (messages.length <= 1) { sessionStorage.removeItem(CHAT_STORAGE_KEY); return; }
    try { sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify({ userId: user?.id ?? null, messages })); } catch {}
  }, [messages, user?.id]);

  const resize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  const reset = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    sessionStorage.removeItem(CHAT_STORAGE_KEY);
    setStreamingContent(null);
    setMessages([{ ...WELCOME, id: Date.now().toString(), ts: new Date() }]);
    setInput("");
    setIsLoading(false);
    setActiveConv("current");
    setSidebarOpen(false);
    setRequestsLeft(null);
    setSessionId(null);
  };

  const handleSaveRecipe = async (msg: Message) => {
    if (!msg.recipeId || savedIds.has(msg.id)) return;
    setSavedIds((prev) => new Set(prev).add(msg.id));
    router.push(`/kitchen/recipes/${msg.recipeId}`);
  };

  const loadSession = async (sid: string) => {
    setActiveConv(sid);
    setSidebarOpen(false);
    try {
      const { supabase } = await import("@/services/supabase");
      const { data } = await supabase.from("ai_chat_sessions").select("messages").eq("id", sid).single();
      if (!data?.messages) return;
      const dbMsgs = data.messages as AIMessage[];
      const loaded: Message[] = dbMsgs
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m, i) => {
          const isAssistant = m.role === "assistant";
          const isRecipeObj = isAssistant && typeof m.content === "object" && m.content !== null;
          const recipe = isRecipeObj ? (m.content as AIAssistantResponse["recipe"]) : undefined;
          const content = isRecipeObj ? "" : String(m.content ?? "");
          return {
            id: `${sid}-${i}`,
            role: m.role,
            content,
            ts: m.timestamp ? new Date(m.timestamp) : new Date(),
            responseType: isAssistant ? (isRecipeObj ? "recipe" : "chat") : undefined,
            recipe,
            aiMessage: isRecipeObj && recipe ? buildRecipeHistorySummary(recipe, `Here's your ${recipe.title}!`) : undefined,
          } as Message;
        });
      if (loaded.length > 0) {
        abortRef.current?.abort();
        abortRef.current = null;
        setStreamingContent(null);
        setIsLoading(false);
        setMessages(loaded);
        setSessionId(sid);
      }
    } catch {}
  };

  const handleDeleteConv = async (id: string) => {
    try {
      const { supabase } = await import("@/services/supabase");
      await supabase.from("ai_chat_sessions").delete().eq("id", id);
      setConvs((prev) => prev.filter((c) => c.id !== id));
      if (activeConv === id) reset();
    } catch {}
  };

  const doSubmit = async (text: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text, ts: new Date() };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsLoading(true);
    setStreamingContent(null);

    try {
      const history = messages
        .filter((m) => m.id !== "init")
        .slice(-10)
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.role === "assistant" ? (m.aiMessage ?? m.content) : m.content,
        }));

      const result = await recipeService.streamAIResponse(
        text, history,
        (chunk) => { if (!controller.signal.aborted) setStreamingContent((p) => p === null ? chunk : p + chunk); },
        controller.signal,
        () => setStreamingContent(null),
        sessionId,
      );

      if (controller.signal.aborted) return;

      if (result.session_id && !sessionId) {
        setSessionId(result.session_id);
        loadConvs();
      }
      setRequestsLeft(result.requests_remaining ?? null);

      const assistantMsg: Message = {
        id:           (Date.now() + 1).toString(),
        role:         "assistant",
        content:      result.message,
        ts:           new Date(),
        responseType: result.type,
        recipe:       result.recipe,
        recipeId:     result.recipe_id ?? null,
        requestsRemaining: result.requests_remaining,
        aiMessage: result.type === "recipe" && result.recipe
          ? buildRecipeHistorySummary(result.recipe, result.message)
          : result.message,
      };
      setMessages((p) => [...p, assistantMsg]);
      setStreamingContent(null);
    } catch (err) {
      if (controller.signal.aborted) return;
      const code = err instanceof AIRequestError ? err.code : "upstream";
      const errText = err instanceof Error ? err.message : "Something went wrong";
      setStreamingContent(null);
      setMessages((p) => [...p, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        responseType: "chat" as const,
        content:
          code === "rate_limit" ? "You've reached the AI request limit (10 per hour). Please try again later."
          : code === "auth"     ? "Your sign-in session has expired. Please sign out and back in, then try again."
          :                       `Sorry, I ran into an issue. ${errText}`,
        ts: new Date(),
      }]);
    } finally {
      if (!controller.signal.aborted) setIsLoading(false);
    }
  };

  const submit = () => {
    const text = input.trim();
    if (!text || isLoading) return;
    requireAuth(() => doSubmit(text), "Sign up to chat with your personal halal cooking assistant");
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
  };

  const hasUser = messages.some((m) => m.role === "user");

  if (authLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: BG }}>
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex items-center gap-3"
        >
          <Image src="/logo/aqi.png" alt="AQI" width={24} height={24} className="object-contain rounded-full bg-white p-1 opacity-50" />
          <span className="text-[10px] font-black uppercase" style={{ color: `${CREAM}40`, letterSpacing: "0.3em" }}>
            Loading
          </span>
        </motion.div>
      </div>
    );
  }


  return (
    <div className="fixed inset-0 flex overflow-hidden" style={{ backgroundColor: BG, color: CREAM, zIndex: 50 }}>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col shrink-0" style={{ width: 252, backgroundColor: BG_SIDE, borderRight: "1px solid rgba(240,62,158,0.1)" }}>
        <SidebarContent convs={convs} activeConv={activeConv} onConvClick={loadSession} onNewChat={reset}
          onDelete={handleDeleteConv} userName={user?.full_name ?? user?.email}
          userInitial={user?.full_name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase()} />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-60 flex lg:hidden">
            <motion.aside
              className="flex flex-col h-full shrink-0"
              style={{ width: 268, backgroundColor: BG_SIDE, borderRight: "1px solid rgba(240,62,158,0.1)" }}
              initial={{ x: -268 }} animate={{ x: 0 }} exit={{ x: -268 }}
              transition={{ type: "spring", stiffness: 340, damping: 32 }}
            >
              <SidebarContent convs={convs} activeConv={activeConv} onConvClick={loadSession}
                onNewChat={reset} onClose={() => setSidebarOpen(false)}
                onDelete={handleDeleteConv} userName={user?.full_name ?? user?.email}
                userInitial={user?.full_name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase()} />
            </motion.aside>
            <motion.div className="flex-1 backdrop-blur-sm"
              style={{ backgroundColor: "rgba(14,4,10,0.7)" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)} />
          </div>
        )}
      </AnimatePresence>

      {/* Main panel */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="shrink-0 flex items-center justify-between px-4 h-14"
          style={{
            backgroundColor: `${BG}EE`,
            borderBottom: "1px solid rgba(240,62,158,0.1)",
            backdropFilter: "blur(12px)",
          }}>
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-1.5 -ml-1.5 transition-opacity hover:opacity-70"
              style={{ color: `${CREAM}40` }} onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" strokeWidth={1.75} />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Image src="/logo/aqi.png" alt="AQI" width={26} height={26} className="object-contain shrink-0 rounded-full bg-white p-1" />
                <div className="absolute inset-0" style={{ boxShadow: "0 0 10px rgba(240,62,158,0.4)" }} />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase" style={{ color: CREAM, letterSpacing: "0.22em" }}>AQI</span>
                  <span className="text-[8px] px-1.5 py-0.5 font-black uppercase"
                    style={{ background: "rgba(240,62,158,0.12)", color: VIOLET, border: "1px solid rgba(240,62,158,0.2)", letterSpacing: "0.15em" }}>
                    Halal AI
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#4ade80", boxShadow: "0 0 4px #4ade80" }} />
                  <span className="text-[8px] font-bold uppercase" style={{ color: "#4ade8080", letterSpacing: "0.16em" }}>Online</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {requestsLeft !== null && (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex gap-0.5">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="w-1 h-3 transition-all"
                      style={{
                        backgroundColor: i < requestsLeft
                          ? requestsLeft <= 3 ? "#f87171" : VIOLET
                          : "rgba(247,224,192,0.08)",
                      }} />
                  ))}
                </div>
                <span className="text-[9px] font-bold" style={{ color: requestsLeft <= 3 ? "#f87171" : `${CREAM}30` }}>
                  {requestsLeft}/10
                </span>
              </div>
            )}
            {hasUser && (
              <motion.button
                onClick={reset}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold uppercase transition-all"
                style={{ color: `${CREAM}35`, border: "1px solid rgba(247,224,192,0.08)", letterSpacing: "0.14em" }}
                whileHover={{ color: CREAM, borderColor: `rgba(240,62,158,0.3)` } as never}
                whileTap={{ scale: 0.95 }}
              >
                <RotateCcw className="w-3 h-3" strokeWidth={2} />
                <span className="hidden sm:inline">New Chat</span>
              </motion.button>
            )}
            <Link href="/">
              <Image src="/logo/logo.png" alt="HalalMe" width={24} height={24} className="object-contain opacity-30 hover:opacity-80 transition-opacity" />
            </Link>
          </div>
        </header>

        {/* Chat area */}
        <div ref={chatRef} className="flex-1 min-h-0 overflow-y-auto relative">

          {/* Atmospheric background orbs */}
          <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
            <div className="aqi-orb-1" />
            <div className="aqi-orb-2" />
            <div className="aqi-orb-3" />
          </div>

          {/* Welcome screen */}
          <AnimatePresence>
            {!hasUser && (
              <motion.div
                className="relative z-10 flex flex-col items-center justify-center min-h-full px-4 py-16"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.98 }}
              >
                {/* Logo with glow rings */}
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.05, type: "spring", stiffness: 200 }}
                  className="relative mb-10"
                >
                  <div className="aqi-logo-ring-3" />
                  <div className="aqi-logo-ring-2" />
                  <div className="aqi-logo-ring-1" />
                  <div className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(240,62,158,0.08)", border: "1px solid rgba(240,62,158,0.2)" }}>
                    <Image src="/logo/aqi.png" alt="AQI" width={52} height={52} className="object-contain rounded-full bg-white p-2" />
                  </div>
                </motion.div>

                {/* Headline */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }} className="text-center mb-3"
                >
                  <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter leading-none aqi-gradient-text">
                    What would you
                    <br />like to cook?
                  </h1>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
                  className="text-center mb-10"
                >
                  <p className="text-sm" style={{ color: `${CREAM}40` }}>
                    Halal recipes, ingredient ideas, cooking guidance - all in one place
                  </p>
                  {!user && (
                    <p className="text-xs mt-3" style={{ color: `${CREAM}28` }}>
                      <button
                        onClick={() => requireAuth(() => {}, "Sign up to chat with your personal halal cooking assistant")}
                        className="underline transition-opacity hover:opacity-80"
                        style={{ color: VIOLET }}
                      >
                        Sign in
                      </button>
                      {" "}to start cooking
                    </p>
                  )}
                </motion.div>

                {/* Suggestion cards */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="grid grid-cols-2 gap-3 w-full max-w-md"
                >
                  {SUGGESTIONS.map((s, i) => (
                    <motion.button
                      key={i}
                      onClick={() => { setInput(`${s.title} ${s.sub}`); textareaRef.current?.focus(); }}
                      className="text-left p-4 transition-all group relative overflow-hidden"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(240,62,158,0.14)",
                      }}
                      whileHover={{ scale: 1.02, borderColor: "rgba(240,62,158,0.4)" } as never}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Card glow on hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: "linear-gradient(135deg, rgba(240,62,158,0.06), transparent)" }} />
                      <div className="relative z-10">
                        <div className="text-2xl mb-2">{s.emoji}</div>
                        <div className="text-xs font-black uppercase tracking-tight leading-tight" style={{ color: CREAM }}>
                          {s.title}
                        </div>
                        <div className="text-[10px] mt-1" style={{ color: `${CREAM}40` }}>{s.sub}</div>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages */}
          {hasUser && (
            <div className="relative z-10 max-w-2xl mx-auto px-4 pt-8 pb-4 space-y-6">
              {messages.map((msg, idx) => {
                const isFirstInGroup = idx === 0 || messages[idx - 1]?.role !== msg.role;
                const isUser = msg.role === "user";
                return (
                  <div key={msg.id} className="aqi-msg-enter">

                    {/* Role label */}
                    {isFirstInGroup && (
                      <div className={`flex items-center gap-2 mb-2 ${isUser ? "justify-end" : "justify-start"}`}>
                        {!isUser && (
                          <div className="relative">
                            <Image src="/logo/aqi.png" alt="AQI" width={18} height={18} className="object-contain rounded-full bg-white p-1" />
                            <div className="absolute inset-0" style={{ boxShadow: "0 0 6px rgba(240,62,158,0.5)" }} />
                          </div>
                        )}
                        <span className="text-[9px] font-black uppercase"
                          style={{ color: isUser ? `${CREAM}28` : `${VIOLET}90`, letterSpacing: "0.24em" }}>
                          {isUser ? "You" : "AQI"}
                        </span>
                        {isUser && (
                          <div className="w-5 h-5 flex items-center justify-center text-[8px] font-black"
                            style={{
                              background: `linear-gradient(135deg, rgba(196,30,115,0.25), rgba(240,62,158,0.15))`,
                              color: VIOLET,
                              border: "1px solid rgba(240,62,158,0.25)",
                            }}>
                            {user?.full_name?.[0]?.toUpperCase() ?? "U"}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Bubble */}
                    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                      <div className="max-w-[88%]">
                        <div
                          style={isUser ? {
                            background: "linear-gradient(135deg, #2A2A2A 0%, #222222 100%)",
                            border: "1px solid rgba(240,62,158,0.2)",
                            padding: "12px 16px",
                          } : {
                            background: "rgba(38,38,38,0.95)",
                            border: "1px solid rgba(240,62,158,0.12)",
                            borderLeft: `3px solid ${VIOLET}70`,
                            padding: "12px 16px",
                          }}
                        >
                          {!isUser && msg.responseType === "recipe" && msg.recipe ? (
                            <div>
                              {msg.content && (
                                <div className="whitespace-pre-wrap text-sm leading-[1.8] mb-1" style={{ color: `${CREAM}CC` }}>
                                  {md(msg.content)}
                                </div>
                              )}
                              <RecipeContent recipe={msg.recipe} />
                            </div>
                          ) : (
                            <div className="whitespace-pre-wrap text-sm leading-[1.8]"
                              style={{ color: isUser ? CREAM : `${CREAM}CC` }}>
                              {md(msg.content)}
                            </div>
                          )}
                          <div className="text-[8px] mt-2 font-semibold uppercase"
                            style={{ color: `${CREAM}18`, letterSpacing: "0.14em" }}>
                            {fmt(msg.ts)}
                          </div>
                        </div>

                        {/* Action row */}
                        {!isUser && msg.id !== "init" && (
                          <div className="mt-2 flex items-center gap-1.5">
                            <motion.button
                              onClick={() => {
                                const text = msg.responseType === "recipe" && msg.recipe
                                  ? [
                                      msg.content,
                                      `\n${msg.recipe.title}`,
                                      "\nIngredients:",
                                      ...msg.recipe.ingredients.map((i) => `- ${[i.amount, i.unit, i.name].filter(Boolean).join(" ")}`),
                                      "\nInstructions:",
                                      ...msg.recipe.instructions.map((s) => `${s.step}. ${s.text}`),
                                    ].filter(Boolean).join("\n")
                                  : msg.content;
                                navigator.clipboard.writeText(text).then(() => {
                                  setCopiedId(msg.id);
                                  setTimeout(() => setCopiedId(null), 2000);
                                });
                              }}
                              className="flex items-center gap-1 px-2 py-1 text-[9px] font-bold uppercase transition-all"
                              style={{
                                color: copiedId === msg.id ? "#4ade80" : `${CREAM}28`,
                                border: `1px solid ${copiedId === msg.id ? "rgba(74,222,128,0.2)" : "rgba(247,224,192,0.08)"}`,
                                letterSpacing: "0.12em",
                              }}
                              whileHover={{ color: CREAM, borderColor: "rgba(247,224,192,0.2)" } as never}
                              whileTap={{ scale: 0.97 }}
                            >
                              {copiedId === msg.id
                                ? <><Check className="w-2.5 h-2.5" strokeWidth={2.5} /> Copied</>
                                : <><Copy className="w-2.5 h-2.5" strokeWidth={2} /> Copy</>}
                            </motion.button>

                            {msg.responseType === "recipe" && msg.recipeId && (
                              <motion.button
                                onClick={() => handleSaveRecipe(msg)}
                                className="flex items-center gap-1 px-2 py-1 text-[9px] font-bold uppercase transition-all"
                                style={{
                                  color: savedIds.has(msg.id) ? "#4ade80" : `${VIOLET}80`,
                                  border: `1px solid ${savedIds.has(msg.id) ? "rgba(74,222,128,0.2)" : "rgba(240,62,158,0.2)"}`,
                                  letterSpacing: "0.12em",
                                }}
                                whileHover={{ scale: 1.03 } as never}
                                whileTap={{ scale: 0.97 }}
                              >
                                {savedIds.has(msg.id)
                                  ? <><Check className="w-2.5 h-2.5" strokeWidth={2.5} /> Saved</>
                                  : <><BookmarkPlus className="w-2.5 h-2.5" strokeWidth={2} /> View Recipe</>}
                              </motion.button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Streaming message */}
              {streamingContent !== null && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="relative">
                      <Image src="/logo/aqi.png" alt="AQI" width={18} height={18} className="object-contain rounded-full bg-white p-1" />
                      <div className="absolute inset-0" style={{ boxShadow: "0 0 6px rgba(240,62,158,0.5)" }} />
                    </div>
                    <span className="text-[9px] font-black uppercase" style={{ color: `${VIOLET}90`, letterSpacing: "0.24em" }}>AQI</span>
                  </div>
                  <div className="flex justify-start">
                    <div className="max-w-[88%]">
                      <div style={{
                        background: "rgba(38,38,38,0.95)",
                        border: "1px solid rgba(240,62,158,0.12)",
                        borderLeft: `3px solid ${VIOLET}70`,
                        padding: "12px 16px",
                      }}>
                        <div className="whitespace-pre-wrap text-sm leading-[1.8]" style={{ color: `${CREAM}CC` }}>
                          {streamingContent
                            ? <>{md(streamingContent)}<span className="aqi-cursor">▊</span></>
                            : <span className="aqi-cursor">▊</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Thinking indicator */}
              <AnimatePresence>
                {isLoading && streamingContent === null && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="relative w-5 h-5 flex items-center justify-center">
                        <Image src="/logo/aqi.png" alt="AQI" width={18} height={18} className="object-contain rounded-full bg-white p-1" />
                        <Loader2 className="absolute inset-0 w-5 h-5 text-violet-400/40 animate-spin" strokeWidth={1.5} />
                      </div>
                      <span className="text-[9px] font-black uppercase" style={{ color: `${VIOLET}70`, letterSpacing: "0.24em" }}>AQI</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-4 py-3"
                      style={{
                        background: "rgba(38,38,38,0.95)",
                        borderLeft: "3px solid",
                        borderImage: `linear-gradient(180deg, ${FUCHSIA}, ${VIOLET}) 1`,
                        border: "1px solid rgba(240,62,158,0.1)",
                      }}>
                      {[0, 1, 2].map((i) => (
                        <motion.span key={i} className="block w-1.5 h-1.5"
                          style={{ background: `linear-gradient(${FUCHSIA}, ${VIOLET})` }}
                          animate={{ opacity: [0.2, 1, 0.2], scaleY: [0.5, 1, 0.5] }}
                          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <div ref={bottomRef} className="h-4" />
        </div>

        {/* Input area */}
        <div className="shrink-0 px-4 pt-3 pb-5"
          style={{
            background: `linear-gradient(to top, ${BG} 60%, transparent)`,
            backdropFilter: "blur(12px)",
          }}>
          <div className="max-w-2xl mx-auto">
            <div
              className="relative transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: inputFocused
                  ? "1px solid rgba(240,62,158,0.5)"
                  : "1px solid rgba(240,62,158,0.12)",
                boxShadow: inputFocused
                  ? "0 0 0 3px rgba(240,62,158,0.08), 0 0 20px rgba(240,62,158,0.06)"
                  : "none",
              }}
            >
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => { setInput(e.target.value); resize(); }}
                onKeyDown={onKey}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder={hasUser ? "Continue the conversation…" : "Say hi, ask what's in your fridge, or name a dish…"}
                disabled={isLoading}
                className="w-full resize-none text-sm outline-none px-4 py-3.5 pr-14"
                style={{
                  backgroundColor: "transparent",
                  color: CREAM,
                  minHeight: 52,
                  maxHeight: 120,
                  lineHeight: 1.65,
                  overflowY: "auto",
                  scrollbarWidth: "none",
                }}
              />
              <motion.button
                type="button"
                onClick={submit}
                disabled={!input.trim() || isLoading}
                className="absolute right-2.5 bottom-2.5 w-9 h-9 flex items-center justify-center transition-all"
                style={input.trim() && !isLoading
                  ? { background: `linear-gradient(135deg, ${FUCHSIA}, ${VIOLET})`, color: "#fff" }
                  : { background: "rgba(247,224,192,0.04)", color: `${CREAM}18` }
                }
                whileHover={input.trim() && !isLoading ? { scale: 1.08, boxShadow: "0 0 12px rgba(240,62,158,0.4)" } as never : {}}
                whileTap={input.trim() && !isLoading ? { scale: 0.92 } as never : {}}
              >
                <Send className="w-4 h-4" strokeWidth={2} />
              </motion.button>
            </div>

            <div className="flex items-center justify-between mt-2 px-1">
              <span className="text-[8px] font-semibold uppercase" style={{ color: `${CREAM}15`, letterSpacing: "0.14em" }}>
                Enter to send · Shift+Enter for new line
              </span>
              <span className="flex items-center gap-1 text-[8px] font-semibold uppercase" style={{ color: `${CREAM}15`, letterSpacing: "0.14em" }}>
                <Sparkles className="w-2.5 h-2.5" />
                Always verify halal
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .aqi-msg-enter { animation: aqi-fadein 0.18s ease-out both; }
        @keyframes aqi-fadein { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        textarea::placeholder { color: rgba(240,223,192,0.2); }
        textarea::-webkit-scrollbar { display: none; }
        nav::-webkit-scrollbar { display: none; }

        .aqi-gradient-text {
          background: linear-gradient(135deg, ${CREAM} 0%, rgba(240,62,158,0.9) 50%, ${CREAM} 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .aqi-cursor {
          display: inline-block;
          color: ${VIOLET};
          font-size: 0.7em;
          line-height: 1;
          vertical-align: middle;
          animation: aqi-blink 0.65s step-end infinite;
        }
        @keyframes aqi-blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }

        /* Atmospheric orbs */
        .aqi-orb-1 {
          position: absolute;
          top: -20%;
          left: -15%;
          width: 60%;
          height: 60%;
          background: radial-gradient(circle, rgba(180,20,100,0.09) 0%, rgba(180,20,100,0.03) 40%, transparent 70%);
          pointer-events: none;
        }
        .aqi-orb-2 {
          position: absolute;
          bottom: -15%;
          right: -10%;
          width: 55%;
          height: 55%;
          background: radial-gradient(circle, rgba(196,30,115,0.07) 0%, rgba(196,30,115,0.02) 40%, transparent 70%);
          pointer-events: none;
        }
        .aqi-orb-3 {
          position: absolute;
          top: 35%;
          left: 40%;
          width: 40%;
          height: 40%;
          background: radial-gradient(circle, rgba(240,62,158,0.04) 0%, transparent 60%);
          pointer-events: none;
        }

        /* Welcome logo glow rings */
        .aqi-logo-ring-1,
        .aqi-logo-ring-2,
        .aqi-logo-ring-3 {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1px solid rgba(240,62,158,0.25);
          animation: aqi-ring 2.5s ease-out infinite;
        }
        .aqi-logo-ring-2 { animation-delay: 0.8s; border-color: rgba(196,30,115,0.15); }
        .aqi-logo-ring-3 { animation-delay: 1.6s; border-color: rgba(240,62,158,0.08); }
        @keyframes aqi-ring {
          0%   { transform: scale(1);    opacity: 0.8; }
          100% { transform: scale(1.8);  opacity: 0;   }
        }
      `}</style>
    </div>
  );
}
