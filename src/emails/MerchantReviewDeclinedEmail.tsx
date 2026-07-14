import { Button, Heading, Text } from "@react-email/components";
import { EmailLayout, styles, SITE_URL, SUPPORT_EMAIL } from "./theme";

interface MerchantReviewDeclinedEmailProps {
  restaurantName: string;
  ownerName?: string;
  standardRate?: number | null;
  dashboardUrl?: string;
}

export default function MerchantReviewDeclinedEmail({
  restaurantName,
  ownerName,
  standardRate,
  dashboardUrl = `${SITE_URL}/merchant`,
}: MerchantReviewDeclinedEmailProps) {
  const greeting = ownerName ? `Hi ${ownerName},` : "Hi there,";
  const pct =
    standardRate != null
      ? `${Number.isInteger(standardRate) ? standardRate : standardRate.toFixed(1)}%`
      : "your standard rate";

  return (
    <EmailLayout preview={`Update on your commission review - ${restaurantName}`}>
      <Heading style={styles.h1}>Update On Your Review</Heading>

      <Text style={styles.paragraph}>{greeting}</Text>
      <Text style={styles.paragraph}>
        Thanks for your commission review request for{" "}
        <strong>{restaurantName}</strong>. On this occasion we&apos;re not able
        to offer a lower rate, so your standard commission of{" "}
        <strong>{pct}</strong> stands.
      </Text>
      <Text style={styles.paragraph}>
        You can accept your standard rate any time from your dashboard to
        continue onboarding. If your circumstances change, we&apos;re always
        happy to talk it through.
      </Text>

      <div style={styles.buttonWrap}>
        <Button style={styles.button} href={dashboardUrl}>
          Go to My Dashboard
        </Button>
      </div>

      <Text style={styles.paragraph}>
        Questions? Reply to this email or contact us at{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} style={styles.link}>
          {SUPPORT_EMAIL}
        </a>
        .
      </Text>

      <Text style={styles.signature}>The HalalMe Delivery Team</Text>
    </EmailLayout>
  );
}
