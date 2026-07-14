import { Button, Heading, Section, Text } from "@react-email/components";
import { EmailLayout, styles, SITE_URL, SUPPORT_EMAIL } from "./theme";

interface MerchantCounterOfferEmailProps {
  restaurantName: string;
  ownerName?: string;
  commission: number;
  dashboardUrl?: string;
}

export default function MerchantCounterOfferEmail({
  restaurantName,
  ownerName,
  commission,
  dashboardUrl = `${SITE_URL}/merchant`,
}: MerchantCounterOfferEmailProps) {
  const greeting = ownerName ? `Hi ${ownerName},` : "Hi there,";
  const pct = `${Number.isInteger(commission) ? commission : commission.toFixed(1)}%`;

  return (
    <EmailLayout preview={`We've made you a counter-offer - ${restaurantName}`}>
      <Heading style={styles.h1}>We&apos;ve Made You an Offer</Heading>

      <Text style={styles.paragraph}>{greeting}</Text>
      <Text style={styles.paragraph}>
        Thanks for your commission review request for{" "}
        <strong>{restaurantName}</strong>. We&apos;ve reviewed it and we&apos;d
        like to offer you:
      </Text>

      <Section style={styles.rateBox}>
        <Text style={styles.rateLabel}>Our counter-offer</Text>
        <Text style={styles.rateValue}>{pct}</Text>
      </Section>

      <Text style={styles.paragraph}>
        Log in to your dashboard to accept this rate and continue your
        onboarding.
      </Text>

      <div style={styles.buttonWrap}>
        <Button style={styles.button} href={dashboardUrl}>
          Review &amp; Accept
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
