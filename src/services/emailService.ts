import { Resend } from "resend";
import { render } from "@react-email/components";
import MerchantWelcomeEmail from "@/emails/MerchantWelcomeEmail";
import MerchantInviteSentEmail from "@/emails/MerchantInviteSentEmail";
import MerchantAgreementEmail from "@/emails/MerchantAgreementEmail";
import MerchantLiveEmail from "@/emails/MerchantLiveEmail";
import MerchantChaseEmail from "@/emails/MerchantChaseEmail";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "HalalMe <noreply@halalme.co.uk>";

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
