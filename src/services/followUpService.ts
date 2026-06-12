// Server-side only.
//
// notifyTeam() is the ONE place the internal "merchants need attention" alert
// is delivered. Today it logs + (optionally) emails a digest. To switch to
// Slack / Discord / Telegram later, you only change this function.

import { Resend } from "resend";

export interface FollowUpSummaryItem {
  id: string;
  name: string;
  reason: string;
  action: string;
  days: number;
  rep: string | null;
}

export interface FollowUpSummary {
  total: number;
  items: FollowUpSummaryItem[];
}

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "HalalMe <noreply@halalme.co.uk>";

/**
 * Deliver the internal "needs attention" digest.
 * - Always logs (so it's visible in server logs).
 * - If TEAM_DIGEST_EMAIL is configured, emails the digest.
 * - Swap/add Slack/Discord here later — single integration point.
 */
export async function notifyTeam(summary: FollowUpSummary): Promise<void> {
  if (summary.total === 0) return;

  console.log(
    `[follow-ups] ${summary.total} merchant(s) need attention:`,
    summary.items.map((i) => `${i.name} (${i.reason}, ${i.days}d)`).join("; "),
  );

  const to = process.env.TEAM_DIGEST_EMAIL;
  if (!to) return; // No channel configured yet — in-app view still surfaces these.

  const rows = summary.items
    .map(
      (i) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;color:#102C26;">${i.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#b45309;">${i.reason} · ${i.days}d</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#555;">${i.action}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;">${i.rep ?? "Unassigned"}</td>
    </tr>`,
    )
    .join("");

  const html = `
    <div style="font-family:Helvetica,Arial,sans-serif;max-width:640px;margin:0 auto;">
      <div style="background:#102C26;padding:20px 24px;border-radius:8px 8px 0 0;">
        <span style="color:#F7E7CE;font-size:20px;font-weight:700;">HalalMe</span>
        <span style="color:rgba(255,255,255,0.6);font-size:12px;margin-left:8px;">Daily Follow-up Digest</span>
      </div>
      <div style="border:1px solid #eee;border-top:none;border-radius:0 0 8px 8px;padding:24px;">
        <h2 style="color:#102C26;margin:0 0 4px;">${summary.total} merchant${summary.total !== 1 ? "s" : ""} need attention</h2>
        <p style="color:#777;font-size:14px;margin:0 0 20px;">These leads have gone quiet - follow up before they go cold.</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <thead>
            <tr style="text-align:left;color:#999;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">
              <th style="padding:8px 12px;">Merchant</th><th style="padding:8px 12px;">Issue</th>
              <th style="padding:8px 12px;">Action</th><th style="padding:8px 12px;">Rep</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `${summary.total} merchant${summary.total !== 1 ? "s" : ""} need attention today`,
      html,
    });
  } catch (err) {
    console.error("[follow-ups] digest email failed", err);
  }
}
