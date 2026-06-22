"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Loader2, Send, Store, User as UserIcon, ExternalLink, Mail, AlertCircle,
} from "lucide-react";
import { display } from "../../_fonts";
import { useToast, ToastView, Badge } from "../../_ui";
import ThemedSelect from "@/components/admin/ThemedSelect";

type Ref = { id: string; full_name?: string | null; username?: string | null; avatar_url?: string | null; email?: string | null };
type MerchantRef = { id: string; name: string };
function one<T>(v: T | T[] | null | undefined): T | null {
  return Array.isArray(v) ? (v[0] ?? null) : (v ?? null);
}

interface Message {
  id: string;
  sender_role: "user" | "admin";
  body: string;
  created_at: string;
  sender: Ref | Ref[] | null;
}
interface Conversation {
  id: string;
  subject: string;
  status: "open" | "pending" | "resolved" | "closed";
  priority: "low" | "normal" | "high";
  delivery_reference: string | null;
  created_at: string;
  assigned_to: string | null;
  requester_email: string | null;
  requester_name: string | null;
  requester: Ref | Ref[] | null;
  assignee: Ref | Ref[] | null;
  merchant: MerchantRef | MerchantRef[] | null;
}
interface TeamMember { id: string; full_name?: string | null; email?: string | null }

const STATUS_TONE: Record<Conversation["status"], "amber" | "blue" | "green" | "gray"> = {
  open: "amber", pending: "blue", resolved: "green", closed: "gray",
};
const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "pending", label: "Pending" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];
const PRIORITY_OPTIONS = [
  { value: "low", label: "Low priority" },
  { value: "normal", label: "Normal priority" },
  { value: "high", label: "High priority" },
];

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function AdminThreadPage() {
  const { id } = useParams<{ id: string }>();
  const { toast, flash } = useToast();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [canManage, setCanManage] = useState(false);
  const [evermileUrl, setEvermileUrl] = useState<string | null>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [savingField, setSavingField] = useState<string | null>(null);
  const [deliveryRef, setDeliveryRef] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/support/conversations/${id}`);
      if (res.status === 404) { setNotFound(true); return; }
      if (!res.ok) throw new Error();
      const data = await res.json();
      setConversation(data.conversation);
      setMessages(data.messages ?? []);
      setCanManage(!!data.canManage);
      setEvermileUrl(data.evermileUrl ?? null);
    } catch {
      flash("err", "Could not load conversation.");
    } finally {
      setLoading(false);
    }
  }, [id, flash]);

  useEffect(() => { load(); }, [load]);

  // Keep the delivery-reference input in sync with the saved value (won't clobber
  // local typing, since this only fires when the persisted value changes).
  useEffect(() => {
    setDeliveryRef(conversation?.delivery_reference ?? "");
  }, [conversation?.delivery_reference]);

  // Near-live thread: silent refetch every 20s and on tab focus.
  useEffect(() => {
    const tick = () => { if (!document.hidden) load(); };
    const interval = setInterval(tick, 20000);
    window.addEventListener("focus", tick);
    return () => { clearInterval(interval); window.removeEventListener("focus", tick); };
  }, [load]);

  useEffect(() => {
    fetch("/api/admin/team")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.team) setTeam(d.team); })
      .catch(() => {});
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView(); }, [messages]);

  async function patch(body: Record<string, unknown>, field: string) {
    setSavingField(field);
    try {
      const res = await fetch(`/api/admin/support/conversations/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      if (!res.ok) { const j = await res.json().catch(() => null); flash("err", j?.error ?? "Update failed."); return; }
      flash("ok", "Updated.");
      await load();
    } finally {
      setSavingField(null);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const m = reply.trim();
    if (!m) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/support/conversations/${id}/messages`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: m }),
      });
      if (!res.ok) { const j = await res.json().catch(() => null); flash("err", j?.error ?? "Could not send reply."); return; }
      setReply("");
      await load();
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return <div className="bg-[#F3E9D6] min-h-full flex items-center justify-center py-32"><Loader2 className="animate-spin text-[#102C26]/40" size={26} /></div>;
  }

  if (notFound || !conversation) {
    return (
      <div className="bg-[#F3E9D6] min-h-full px-4 sm:px-8 py-10">
        <div className="bg-white border border-[#102C26]/12 rounded-none p-8 text-center max-w-md mx-auto">
          <AlertCircle className="mx-auto text-gray-400 mb-3" size={24} />
          <p className="text-sm text-gray-700 mb-4">This conversation could not be found.</p>
          <Link href="/admin/chat" className="text-sm font-semibold text-[#102C26] hover:underline">Back to inbox</Link>
        </div>
      </div>
    );
  }

  const r = one(conversation.requester);
  const m = one(conversation.merchant);
  const isMerchant = !!m;
  const isGuest = !isMerchant && !r;
  const requesterName = isMerchant
    ? m!.name
    : r
      ? (r.full_name ?? (r.username ? `@${r.username}` : r.email ?? "Unknown"))
      : (conversation.requester_name ?? conversation.requester_email ?? "Guest");
  const requesterEmail = r?.email ?? conversation.requester_email ?? null;

  const teamOptions = [
    { value: "", label: "Unassigned" },
    ...team.map((t) => ({ value: t.id, label: t.full_name ?? t.email ?? "Team member" })),
  ];

  return (
    <div className="bg-[#F3E9D6] min-h-full">
      <ToastView toast={toast} />

      {/* Header */}
      <div className="bg-white border-b border-[#102C26]/12 px-4 sm:px-8 py-4 sm:py-5">
        <Link href="/admin/chat" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#102C26]/50 hover:text-[#102C26] transition-colors mb-3">
          <ArrowLeft size={14} /> Inbox
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className={`${display.className} text-xl sm:text-2xl font-extrabold tracking-tight text-[#102C26]`}>{conversation.subject}</h1>
              <Badge label={conversation.status} tone={STATUS_TONE[conversation.status]} />
            </div>
            <p className="text-xs sm:text-sm text-gray-600 inline-flex items-center gap-1.5">
              {isMerchant ? <Store size={13} /> : <UserIcon size={13} />}
              {requesterName}{isMerchant ? " · Merchant" : isGuest ? " · Guest" : ""}
              {requesterEmail && <span className="text-gray-400">· {requesterEmail}</span>}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-8 py-5 grid lg:grid-cols-[1fr_280px] gap-5 items-start">
        {/* Thread + reply */}
        <div className="bg-white rounded-none border border-[#102C26]/12 flex flex-col">
          <div className="p-4 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            {messages.map((msg) => {
              const isAdmin = msg.sender_role === "admin";
              const s = one(msg.sender);
              return (
                <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-4 py-3 rounded-none ${isAdmin ? "bg-[#102C26] text-[#F7E7CE]" : "bg-gray-100 text-gray-900"}`}>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-50">
                      {isAdmin ? (s?.full_name ?? "Support") : requesterName}
                    </p>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.body}</p>
                    <p className="mt-1.5 text-[10px] opacity-40">{fmtTime(msg.created_at)}</p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Reply */}
          {canManage ? (
            <form onSubmit={handleSend} className="border-t border-[#102C26]/8 p-4">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={3}
                placeholder="Type your reply…"
                className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-200 bg-gray-50 rounded-none focus:outline-none focus:ring-2 focus:ring-[#102C26]/15 focus:border-[#102C26] focus:bg-white placeholder:text-gray-500 resize-none transition-colors"
              />
              <div className="mt-3 flex justify-end">
                <button type="submit" disabled={sending || !reply.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#102C26] text-[#F7E7CE] rounded-none text-sm font-bold uppercase tracking-tight hover:bg-[#102C26]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  {sending ? <Loader2 size={14} className="animate-spin" /> : <><Send size={14} /> Send reply</>}
                </button>
              </div>
            </form>
          ) : (
            <div className="border-t border-[#102C26]/8 p-4 text-center text-sm text-gray-500">
              You have view-only access to support conversations.
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div className="bg-white rounded-none border border-[#102C26]/12 p-4 space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500">Manage</p>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
              <ThemedSelect
                value={conversation.status}
                options={STATUS_OPTIONS}
                disabled={!canManage || savingField === "status"}
                onChange={(v) => patch({ status: v }, "status")}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Priority</label>
              <ThemedSelect
                value={conversation.priority}
                options={PRIORITY_OPTIONS}
                disabled={!canManage || savingField === "priority"}
                onChange={(v) => patch({ priority: v }, "priority")}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Assigned to</label>
              <ThemedSelect
                value={conversation.assigned_to ?? ""}
                options={teamOptions}
                disabled={!canManage || savingField === "assigned"}
                onChange={(v) => patch({ assigned_to: v }, "assigned")}
              />
            </div>
          </div>

          {/* Delivery escalation — attach an Evermile order ref (P1: deep-link only) */}
          {(canManage || conversation.delivery_reference) && (
            <div className="bg-white rounded-none border border-[#102C26]/12 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-2">Delivery</p>

              {canManage ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={deliveryRef}
                    onChange={(e) => setDeliveryRef(e.target.value)}
                    placeholder="Evermile order ref"
                    className="flex-1 min-w-0 px-3 py-2 text-sm font-mono text-gray-900 border border-gray-200 bg-gray-50 rounded-none focus:outline-none focus:ring-2 focus:ring-[#102C26]/15 focus:border-[#102C26] focus:bg-white placeholder:text-gray-400 placeholder:font-sans transition-colors"
                  />
                  <button
                    type="button"
                    disabled={savingField === "delivery" || deliveryRef.trim() === (conversation.delivery_reference ?? "")}
                    onClick={() => patch({ delivery_reference: deliveryRef.trim() }, "delivery")}
                    className="px-3 py-2 bg-[#102C26] text-[#F7E7CE] rounded-none text-xs font-bold uppercase tracking-tight hover:bg-[#102C26]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-700 mb-2">Ref: <span className="font-mono">{conversation.delivery_reference}</span></p>
              )}

              {conversation.delivery_reference && (
                evermileUrl ? (
                  <a href={evermileUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-[#F59E0B] hover:underline">
                    <ExternalLink size={13} /> Open in Evermile
                  </a>
                ) : (
                  <p className="text-xs text-gray-400 mt-2">Set NEXT_PUBLIC_EVERMILE_ORDER_URL to enable the deep link.</p>
                )
              )}
            </div>
          )}

          {/* Requester email */}
          {requesterEmail && (
            <div className="bg-white rounded-none border border-[#102C26]/12 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-2">
                Requester{isGuest ? " (Guest)" : ""}
              </p>
              <a href={`mailto:${requesterEmail}`} className="inline-flex items-center gap-1.5 text-sm text-[#102C26] hover:underline break-all">
                <Mail size={13} /> {requesterEmail}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
