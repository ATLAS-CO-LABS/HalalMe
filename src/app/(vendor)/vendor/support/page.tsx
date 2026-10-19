"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, LifeBuoy, MessageSquarePlus, Send } from "lucide-react";
import { vendorService } from "@/services/vendorService";
import type { SupportTicket } from "@/types/marketplaceVendor";
import { useVendorMutation, vendorKeys } from "@/components/vendor/VendorProvider";
import {
  Badge,
  Button,
  Callout,
  Card,
  display,
  EmptyState,
  Field,
  fmtDateTime,
  Input,
  LoadError,
  Modal,
  PageBody,
  PageHeader,
  Select,
  TableSkeleton,
  Textarea,
  ToastView,
  useToast,
} from "@/components/vendor/ui";

const TOPICS = ["Orders", "Products", "Payouts", "Delivery", "Account", "Something else"];

const TICKET_STATUS: Record<SupportTicket["status"], { label: string; tone: "amber" | "green" | "gray" }> = {
  open: { label: "Waiting on us", tone: "amber" },
  answered: { label: "Answered", tone: "green" },
  closed: { label: "Closed", tone: "gray" },
};

const FAQ = [
  { q: "When do I get paid?", a: "Money for an order is added to your available balance once it is marked delivered. Payouts are sent on the schedule shown on your Earnings page." },
  { q: "How long does product approval take?", a: "Usually within 1 working day. You will get a notification when a product is approved, or if we need something changed." },
  { q: "What if a customer wants to return something?", a: "Customers contact HalalMe first. We will pass the return to you with the reason, and the refund is taken from your next payout." },
  { q: "Can I change my delivery charge?", a: "Yes, at any time under Store, then Delivery & returns. The new charge applies to orders placed after you save." },
];

function NewTicketForm({ onDone }: { onDone: (ticket: SupportTicket) => void }) {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const create = useVendorMutation(() => vendorService.createTicket(subject, topic, message), { onSuccess: onDone, onError: setError });

  return (
    <form
      className="p-5 sm:p-6 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!subject.trim() || !message.trim()) return setError("Add a subject and a message.");
        setError(null);
        create.mutate(undefined);
      }}
    >
      <h2 id="ticket-title" className={`${display.className} text-base font-bold uppercase tracking-tight text-[#102C26]`}>
        Contact support
      </h2>
      <Field label="Topic">
        <Select value={topic} onChange={(e) => setTopic(e.target.value)} options={TOPICS.map((t) => ({ value: t, label: t }))} />
      </Field>
      <Field label="Subject">
        <Input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={100} />
      </Field>
      <Field label="How can we help?" hint="Include order numbers or product names if it is about something specific.">
        <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} />
      </Field>
      {error && (
        <Callout tone="danger" icon={AlertCircle}>
          {error}
        </Callout>
      )}
      <div className="flex justify-end">
        <Button type="submit" icon={Send} loading={create.isPending}>
          Send message
        </Button>
      </div>
    </form>
  );
}

function Thread({ ticket }: { ticket: SupportTicket }) {
  const [reply, setReply] = useState("");
  const send = useVendorMutation(() => vendorService.replyToTicket(ticket.id, reply), { onSuccess: () => setReply("") });

  return (
    <Card
      title={ticket.subject}
      subtitle={`${ticket.topic} · opened ${fmtDateTime(ticket.createdAt)}`}
      action={<Badge label={TICKET_STATUS[ticket.status].label} tone={TICKET_STATUS[ticket.status].tone} />}
    >
      <ol className="space-y-3">
        {ticket.messages.map((m) => (
          <li key={m.at} className={`flex ${m.from === "vendor" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] px-4 py-3 ${m.from === "vendor" ? "bg-[#102C26] text-[#F7E7CE]" : "bg-gray-100 text-gray-900"}`}>
              <p className="text-[10px] font-bold uppercase tracking-wide opacity-70 mb-1">
                {m.from === "vendor" ? "You" : "HalalMe support"} · {fmtDateTime(m.at)}
              </p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.body}</p>
            </div>
          </li>
        ))}
      </ol>

      {ticket.status !== "closed" && (
        <form
          className="mt-5 pt-4 border-t border-[#102C26]/8 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (reply.trim()) send.mutate(undefined);
          }}
        >
          <Textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a reply" rows={3} aria-label="Reply" />
          <div className="flex justify-end">
            <Button type="submit" icon={Send} loading={send.isPending} disabled={!reply.trim()}>
              Send reply
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}

export default function VendorSupportPage() {
  const { toast, flash } = useToast();
  const [creating, setCreating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: tickets, isLoading, isError, refetch } = useQuery({
    queryKey: vendorKeys.resource("tickets"),
    queryFn: () => vendorService.listTickets(),
  });

  const selected = tickets?.find((t) => t.id === selectedId) ?? tickets?.[0] ?? null;

  return (
    <>
      <ToastView toast={toast} />
      <PageHeader
        eyebrow="Support"
        title="Help and support"
        description="Message the HalalMe seller team. We reply by email and here, usually within 1 working day."
        actions={
          <Button icon={MessageSquarePlus} onClick={() => setCreating(true)}>
            Contact support
          </Button>
        }
      />
      <PageBody>
        <div className="grid lg:grid-cols-3 gap-5 items-start">
          <div className="space-y-5">
            <Card title="Your conversations" flush>
              {isError ? (
                <LoadError message="We could not load your conversations." onRetry={() => void refetch()} compact />
              ) : isLoading ? (
                <TableSkeleton />
              ) : tickets?.length === 0 ? (
                <EmptyState icon={LifeBuoy} title="No conversations yet" hint="Messages you send to support will appear here." />
              ) : (
                <ul className="divide-y divide-[#102C26]/8">
                  {tickets?.map((t) => (
                    <li key={t.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(t.id)}
                        aria-current={selected?.id === t.id}
                        className={`w-full text-left px-4 sm:px-5 py-3.5 border-l-2 transition-colors ${
                          selected?.id === t.id ? "border-[#F59E0B] bg-[#F59E0B]/[0.06]" : "border-transparent hover:bg-[#102C26]/[0.03]"
                        }`}
                      >
                        <span className="flex items-start justify-between gap-3">
                          <span className="text-sm font-semibold text-gray-900">{t.subject}</span>
                          <Badge label={TICKET_STATUS[t.status].label} tone={TICKET_STATUS[t.status].tone} />
                        </span>
                        <span className="block text-xs text-gray-500 mt-1">
                          {t.topic} · {t.messages.length} message{t.messages.length === 1 ? "" : "s"}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card title="Common questions">
              <div className="divide-y divide-[#102C26]/8 -my-3">
                {FAQ.map((item) => (
                  <details key={item.q} className="group py-3">
                    <summary className="text-sm font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between gap-3">
                      {item.q}
                      <span className="text-gray-400 group-open:rotate-45 transition-transform text-lg leading-none">+</span>
                    </summary>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">{item.a}</p>
                  </details>
                ))}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {/* Keyed so the reply box clears when switching conversation */}
            {selected ? (
              <Thread key={selected.id} ticket={selected} />
            ) : (
              !isLoading && (
                <Card>
                  <EmptyState icon={LifeBuoy} title="How can we help?" hint="Start a conversation and our seller team will get back to you." />
                </Card>
              )
            )}
          </div>
        </div>
      </PageBody>

      <Modal open={creating} onClose={() => setCreating(false)} labelledBy="ticket-title" maxWidth="max-w-lg">
        {creating && (
          <NewTicketForm
            onDone={(ticket) => {
              setCreating(false);
              setSelectedId(ticket.id);
              flash("ok", "Message sent");
            }}
          />
        )}
      </Modal>
    </>
  );
}
