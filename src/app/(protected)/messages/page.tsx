"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Loader2, MessageSquarePlus, ChevronRight, Inbox } from "lucide-react";

interface Conversation {
  id: string;
  subject: string;
  status: "open" | "pending" | "resolved" | "closed";
  priority: "low" | "normal" | "high";
  last_message_at: string;
  created_at: string;
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

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/support/conversations");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setConversations(data.conversations ?? []);
    } catch {
      setError("Could not load your messages.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const s = subject.trim();
    const m = message.trim();
    if (!s || !m) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/support/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: s, message: m }),
      });
      if (!res.ok) throw new Error();
      setSubject("");
      setMessage("");
      setComposing(false);
      setLoading(true);
      await load();
    } catch {
      setError("Could not send your message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#102C26]">
      <div className="container mx-auto max-w-2xl px-4 py-10 sm:py-14">
        {/* ── Page title ── */}
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#F59E0B] mb-2">
              Support
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tighter leading-none text-[#F7E7CE]">
              My
              <br />
              <span className="text-[#F7E7CE]/30">Messages</span>
            </h1>
          </div>
          {!composing && (
            <button
              type="button"
              onClick={() => setComposing(true)}
              className="flex items-center gap-2 rounded-md bg-[#F59E0B] px-4 py-2.5 text-sm font-bold text-[#0A1C19] uppercase tracking-wider transition-all hover:bg-[#FBBF24]"
            >
              <MessageSquarePlus className="h-4 w-4" />
              New
            </button>
          )}
        </div>

        {/* ── Composer ── */}
        {composing && (
          <form
            onSubmit={handleSend}
            className="mb-8 rounded-xl border border-[#F7E7CE]/10 bg-[#0A1C19] overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-[#F7E7CE]/8">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#F59E0B]">
                New Message
              </h2>
            </div>
            <div className="px-5 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#F7E7CE]/35 mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="What do you need help with?"
                  className="w-full rounded-md border border-[#F7E7CE]/15 bg-[#F7E7CE]/5 px-3 py-2.5 text-sm text-[#F7E7CE] placeholder-[#F7E7CE]/20 outline-none transition-colors focus:border-[#F59E0B]/60 focus:ring-1 focus:ring-[#F59E0B]/15"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#F7E7CE]/35 mb-1.5">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder="Tell us how we can help…"
                  className="w-full rounded-md border border-[#F7E7CE]/15 bg-[#F7E7CE]/5 px-3 py-2.5 text-sm text-[#F7E7CE] placeholder-[#F7E7CE]/20 outline-none transition-colors focus:border-[#F59E0B]/60 focus:ring-1 focus:ring-[#F59E0B]/15 resize-none"
                />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={sending || !subject.trim() || !message.trim()}
                  className="flex items-center justify-center gap-2 rounded-md bg-[#F59E0B] px-5 py-2.5 text-sm font-bold text-[#0A1C19] uppercase tracking-wider transition-all hover:bg-[#FBBF24] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setComposing(false);
                    setError(null);
                  }}
                  className="text-sm font-semibold text-[#F7E7CE]/40 hover:text-[#F7E7CE]/70 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ── List ── */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-[#F59E0B]" />
          </div>
        ) : conversations.length === 0 ? (
          !composing && (
            <div className="rounded-xl border border-[#F7E7CE]/10 bg-[#0A1C19] px-5 py-16 text-center">
              <Inbox className="mx-auto h-8 w-8 text-[#F7E7CE]/20 mb-3" />
              <p className="text-sm text-[#F7E7CE]/40">
                You haven&apos;t messaged support yet.
              </p>
            </div>
          )
        ) : (
          <div className="space-y-3">
            {conversations.map((c) => (
              <Link
                key={c.id}
                href={`/messages/${c.id}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-[#F7E7CE]/10 bg-[#0A1C19] px-5 py-4 transition-colors hover:bg-[#F7E7CE]/5"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className="truncate text-sm font-semibold text-[#F7E7CE]">
                      {c.subject}
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_STYLES[c.status]}`}
                    >
                      {STATUS_LABELS[c.status]}
                    </span>
                  </div>
                  <p className="text-xs text-[#F7E7CE]/30">
                    Updated {relativeTime(c.last_message_at)}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-[#F7E7CE]/25" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
