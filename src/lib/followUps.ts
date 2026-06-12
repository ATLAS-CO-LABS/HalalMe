// Shared follow-up rules — pure functions, usable on client (in-app view) and
// server (cron). This is the "brain" that decides which merchants have gone stale.

export interface FollowUpInput {
  status: string;
  created_at: string;
  invited_at: string | null;
  contacted_at: string | null;
  next_followup_on?: string | null;
}

export interface FollowUp {
  key: string;
  label: string; // short reason shown in the UI
  action: string; // what the team should do
  severity: "warn" | "urgent";
  days: number; // days overdue in the current stage
}

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

function isPastDate(iso: string): boolean {
  // true if the date is today or earlier
  const d = new Date(iso);
  d.setHours(23, 59, 59, 999);
  return d.getTime() <= Date.now();
}

// Thresholds (days)
export const THRESHOLDS = {
  pending: 2, // registered, not invited within 48h
  invited: 3, // invited, no movement within 72h
  contacted: 5, // spoken to, stalled for 5 days
  negotiating: 5, // negotiation dragging for 5 days
};

/**
 * Returns a FollowUp if the merchant needs attention, else null.
 * Also honours a manual `next_followup_on` reminder date.
 */
export function getFollowUp(m: FollowUpInput): FollowUp | null {
  // Manual reminder date takes priority — if it's due, surface it
  if (
    m.next_followup_on &&
    isPastDate(m.next_followup_on) &&
    m.status !== "live" &&
    m.status !== "rejected"
  ) {
    return {
      key: "manual",
      label: "Follow-up due",
      action: "You set a reminder for this merchant",
      severity: "urgent",
      days: daysSince(m.next_followup_on),
    };
  }

  if (m.status === "pending") {
    const d = daysSince(m.created_at);
    if (d >= THRESHOLDS.pending) {
      return {
        key: "pending",
        label: "Not yet invited",
        action: "Invite this merchant on Hyperzod, then mark as invited",
        severity: d >= 5 ? "urgent" : "warn",
        days: d,
      };
    }
  }

  if (m.status === "invited" && m.invited_at) {
    const d = daysSince(m.invited_at);
    if (d >= THRESHOLDS.invited) {
      return {
        key: "invited",
        label: "Invite ignored",
        action: "Chase the merchant - they haven't set up their dashboard",
        severity: d >= 7 ? "urgent" : "warn",
        days: d,
      };
    }
  }

  if (
    (m.status === "contacted" || m.status === "negotiating") &&
    m.contacted_at
  ) {
    const d = daysSince(m.contacted_at);
    const threshold =
      m.status === "contacted" ? THRESHOLDS.contacted : THRESHOLDS.negotiating;
    if (d >= threshold) {
      return {
        key: m.status,
        label:
          m.status === "contacted"
            ? "Stalled after contact"
            : "Negotiation stalled",
        action: "Follow up to keep the deal moving",
        severity: "urgent",
        days: d,
      };
    }
  }

  return null;
}
