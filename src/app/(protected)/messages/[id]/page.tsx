"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft, Send } from "lucide-react";

interface Message {
  id: string;
  sender_role: "user" | "admin";
  body: string;
  created_at: string;
}

interface Conversation {
  id: string;
  subject: string;
  status: "open" | "pending" | "resolved" | "closed";
  priority: "low" | "normal" | "high";
}

const STATUS_STYLES: Record<Conversation["status"], string> = {
  open: "bg-[#F59E0B]/15 text-[#F59E0B]",
  pending: "bg-sky-500/15 text-sky-400",
  resolved: "bg-emerald-500/15 text-emerald-400",
  closed: "bg-[#F7E7CE]/10 text-[#F7E7CE]/40",
};

const STATUS_LABELS: Record<Conversation["status"], string> = {
  open: "Awaiting reply",
  pending: "We replied",
  resolved: "Resolved",
  closed: "Closed",
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function MessageThreadPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/support/conversations/${id}/messages`);
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      if (!res.ok) throw new Error();
      const data = await res.json();
      setConversation(data.conversation);
      setMessages(data.messages ?? []);
    } catch {
      setError("Could not load this conversation.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // Pick up admin replies without a manual refresh: silent poll + on focus.
  useEffect(() => {
    const tick = () => { if (!document.hidden) load(); };
    const interval = setInterval(tick, 20000);
    window.addEventListener("focus", tick);
    return () => { clearInterval(interval); window.removeEventListener("focus", tick); };
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const m = reply.trim();
    if (!m) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/support/conversations/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: m }),
      });
      if (!res.ok) throw new Error();
      setReply("");
      await load();
    } catch {
      setError("Could not send your message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#102C26]">
        <Loader2 className="h-6 w-6 animate-spin text-[#F59E0B]" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#102C26]">
        <div className="container mx-auto max-w-2xl px-4 py-14 text-center">
          <p className="text-sm text-[#F7E7CE]/50 mb-4">
            This conversation could not be found.
          </p>
          <button
            type="button"
            onClick={() => router.push("/messages")}
            className="text-sm font-semibold text-[#F59E0B] hover:text-[#FBBF24] transition-colors"
          >
            Back to My Messages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#102C26]">
      <div className="container mx-auto max-w-2xl px-4 py-10 sm:py-14">
        {/* ── Header ── */}
        <Link
          href="/messages"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#F7E7CE]/40 hover:text-[#F7E7CE]/70 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          My Messages
        </Link>

        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F7E7CE]">
            {conversation?.subject}
          </h1>
          {conversation && (
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${STATUS_STYLES[conversation.status]}`}
            >
              {STATUS_LABELS[conversation.status]}
            </span>
          )}
        </div>

        {/* ── Thread ── */}
        <div className="space-y-4 mb-6">
          {messages.map((msg) => {
            const isUser = msg.sender_role === "user";
            return (
              <div
                key={msg.id}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    isUser
                      ? "bg-[#F59E0B] text-[#0A1C19] rounded-br-sm"
                      : "bg-[#0A1C19] border border-[#F7E7CE]/10 text-[#F7E7CE] rounded-bl-sm"
                  }`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-50">
                    {isUser ? "You" : "HalalMe Support"}
                  </p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {msg.body}
                  </p>
                  <p className="mt-1.5 text-[10px] opacity-40">
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* ── Reply ── */}
        {conversation?.status === "closed" ? (
          <p className="rounded-xl border border-[#F7E7CE]/10 bg-[#0A1C19] px-5 py-4 text-center text-sm text-[#F7E7CE]/40">
            This conversation is closed. Start a new message if you need more help.
          </p>
        ) : (
          <form
            onSubmit={handleSend}
            className="rounded-xl border border-[#F7E7CE]/10 bg-[#0A1C19] p-4"
          >
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={3}
              placeholder="Type your reply…"
              className="w-full rounded-md border border-[#F7E7CE]/15 bg-[#F7E7CE]/5 px-3 py-2.5 text-sm text-[#F7E7CE] placeholder-[#F7E7CE]/20 outline-none transition-colors focus:border-[#F59E0B]/60 focus:ring-1 focus:ring-[#F59E0B]/15 resize-none"
            />
            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={sending || !reply.trim()}
                className="flex items-center gap-2 rounded-md bg-[#F59E0B] px-5 py-2.5 text-sm font-bold text-[#0A1C19] uppercase tracking-wider transition-all hover:bg-[#FBBF24] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
