import { Resend } from "resend";
import { render } from "@react-email/components";
import MerchantWelcomeEmail from "@/emails/MerchantWelcomeEmail";
import MerchantInviteSentEmail from "@/emails/MerchantInviteSentEmail";
import MerchantAgreementEmail from "@/emails/MerchantAgreementEmail";
import MerchantLiveEmail from "@/emails/MerchantLiveEmail";
import MerchantChaseEmail from "@/emails/MerchantChaseEmail";
import MerchantDocsApprovedEmail from "@/emails/MerchantDocsApprovedEmail";
import MerchantDocsActionNeededEmail from "@/emails/MerchantDocsActionNeededEmail";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "HalalMe <noreply@halalme.co.uk>";
const SUPPORT_INBOX = "support@halalme.co.uk";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendMerchantSupportEmail({
  restaurantName,
  merchantId,
  fromEmail,
  ownerName,
  subject,
  message,
}: {
  restaurantName: string;
  merchantId: string;
  fromEmail: string;
  ownerName?: string;
  subject: string;
  message: string;
}): Promise<void> {
  const html = `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">
      <h2 style="margin:0 0 12px;">Merchant support request</h2>
      <p style="margin:0 0 4px;"><strong>Restaurant:</strong> ${escapeHtml(restaurantName)}</p>
      <p style="margin:0 0 4px;"><strong>Owner:</strong> ${escapeHtml(ownerName ?? "—")}</p>
      <p style="margin:0 0 4px;"><strong>Account:</strong> ${escapeHtml(fromEmail)}</p>
      <p style="margin:0 0 12px;"><strong>Merchant ID:</strong> ${escapeHtml(merchantId)}</p>
      <hr style="border:none;border-top:1px solid #eee;margin:12px 0;" />
      <p style="margin:0 0 4px;"><strong>Subject:</strong> ${escapeHtml(subject)}</p>
      <p style="margin:0;white-space:pre-wrap;">${escapeHtml(message)}</p>
    </div>`;

  const { error } = await resend.emails.send({
    from: FROM,
    to: SUPPORT_INBOX,
    replyTo: fromEmail,
    subject: `[Merchant Support] ${restaurantName}: ${subject}`,
    html,
  });

  if (error) {
    console.error("[emailService] sendMerchantSupportEmail failed", error);
    throw new Error(`Email send failed: ${error.message}`);
  }
}

export async function sendMerchantWelcomeEmail({
  to,
  restaurantName,
  ownerName,
}: {
  to: string;
  restaurantName: string;
  ownerName?: string;
}): Promise<void> {
  const html = await render(
    MerchantWelcomeEmail({ restaurantName, ownerName }),
  );

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `We've received your application — ${restaurantName}`,
    html,
  });

  if (error) {
    console.error("[emailService] sendMerchantWelcomeEmail failed", error);
    throw new Error(`Email send failed: ${error.message}`);
  }
}

export async function sendMerchantInviteSentEmail({
  to,
  restaurantName,
  ownerName,
}: {
  to: string;
  restaurantName: string;
  ownerName?: string;
}): Promise<void> {
  const html = await render(
    MerchantInviteSentEmail({ restaurantName, ownerName }),
  );

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `Your dashboard invite has been sent — ${restaurantName}`,
    html,
  });

  if (error) {
    console.error("[emailService] sendMerchantInviteSentEmail failed", error);
    throw new Error(`Email send failed: ${error.message}`);
  }
}

export async function sendMerchantAgreementEmail({
  to,
  restaurantName,
  ownerName,
}: {
  to: string;
  restaurantName: string;
  ownerName?: string;
}): Promise<void> {
  const html = await render(
    MerchantAgreementEmail({ restaurantName, ownerName }),
  );

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `Your onboarding is underway — ${restaurantName}`,
    html,
  });

  if (error) {
    console.error("[emailService] sendMerchantAgreementEmail failed", error);
    throw new Error(`Email send failed: ${error.message}`);
  }
}

export async function sendMerchantLiveEmail({
  to,
  restaurantName,
  ownerName,
}: {
  to: string;
  restaurantName: string;
  ownerName?: string;
}): Promise<void> {
  const html = await render(MerchantLiveEmail({ restaurantName, ownerName }));

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `🎉 You're live on HalalMe — ${restaurantName}`,
    html,
  });

  if (error) {
    console.error("[emailService] sendMerchantLiveEmail failed", error);
    throw new Error(`Email send failed: ${error.message}`);
  }
}

export async function sendMerchantDocsApprovedEmail({
  to,
  restaurantName,
  ownerName,
}: {
  to: string;
  restaurantName: string;
  ownerName?: string;
}): Promise<void> {
  const html = await render(
    MerchantDocsApprovedEmail({ restaurantName, ownerName }),
  );

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `Your documents are verified — ${restaurantName}`,
    html,
  });

  if (error) {
    console.error("[emailService] sendMerchantDocsApprovedEmail failed", error);
    throw new Error(`Email send failed: ${error.message}`);
  }
}

export async function sendMerchantDocsActionNeededEmail({
  to,
  restaurantName,
  ownerName,
  documentLabel,
  reason,
}: {
  to: string;
  restaurantName: string;
  ownerName?: string;
  documentLabel: string;
  reason?: string;
}): Promise<void> {
  const html = await render(
    MerchantDocsActionNeededEmail({ restaurantName, ownerName, documentLabel, reason }),
  );

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `Action needed on your ${documentLabel} — ${restaurantName}`,
    html,
  });

  if (error) {
    console.error("[emailService] sendMerchantDocsActionNeededEmail failed", error);
    throw new Error(`Email send failed: ${error.message}`);
  }
}

export async function sendMerchantChaseEmail({
  to,
  restaurantName,
  ownerName,
}: {
  to: string;
  restaurantName: string;
  ownerName?: string;
}): Promise<void> {
  const html = await render(MerchantChaseEmail({ restaurantName, ownerName }));

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `Follow-up on your HalalMe application — ${restaurantName}`,
    html,
  });

  if (error) {
    console.error("[emailService] sendMerchantChaseEmail failed", error);
    throw new Error(`Email send failed: ${error.message}`);
  }
}
