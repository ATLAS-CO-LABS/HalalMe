import { Button, Heading, Section, Text } from "@react-email/components";
import { EmailLayout, styles, SITE_URL, SUPPORT_EMAIL } from "./theme";

interface MerchantDocsApprovedEmailProps {
  restaurantName: string;
  ownerName?: string;
  dashboardUrl?: string;
}

export default function MerchantDocsApprovedEmail({
  restaurantName,
  ownerName,
  dashboardUrl = `${SITE_URL}/merchant`,
}: MerchantDocsApprovedEmailProps) {
  const greeting = ownerName ? `Hi ${ownerName},` : "Hi there,";

  return (
    <EmailLayout preview={`Your documents are verified - ${restaurantName}`}>
      <Section style={styles.celebrate}>
        <Text style={styles.iconBadge}>✓</Text>
        <Heading style={styles.h1Center}>Documents Verified</Heading>
      </Section>

      <Text style={styles.paragraph}>{greeting}</Text>
      <Text style={styles.paragraph}>
        Good news - we&apos;ve reviewed and approved all the required
        verification documents for <strong>{restaurantName}</strong>.
        That&apos;s a big step done.
      </Text>
      <Text style={styles.paragraph}>
        Next, our team will be in touch to agree your commission rate. Once
        that&apos;s settled, we&apos;ll send you your restaurant dashboard so you
        can set up your menu. You can track your progress any time from your
        onboarding dashboard.
      </Text>

      <div style={styles.buttonWrap}>
        <Button style={styles.button} href={dashboardUrl}>
          View My Dashboard
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
