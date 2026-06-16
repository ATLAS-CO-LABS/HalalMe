import { Button, Heading, Section, Text } from "@react-email/components";
import { EmailLayout, styles } from "./theme";

interface MerchantDocsActionNeededEmailProps {
  restaurantName: string;
  ownerName?: string;
  documentLabel: string;
  reason?: string;
  dashboardUrl?: string;
}

export default function MerchantDocsActionNeededEmail({
  restaurantName,
  ownerName,
  documentLabel,
  reason,
  dashboardUrl = "https://halalme.co.uk/merchant",
}: MerchantDocsActionNeededEmailProps) {
  const greeting = ownerName ? `Hi ${ownerName},` : "Hi there,";

  return (
    <EmailLayout
      preview={`Action needed on your ${documentLabel} - ${restaurantName}`}
    >
      <Heading style={styles.h1}>A document needs your attention</Heading>

      <Text style={styles.paragraph}>{greeting}</Text>
      <Text style={styles.paragraph}>
        Thanks for submitting your verification documents for{" "}
        <strong>{restaurantName}</strong>. We weren&apos;t able to approve your{" "}
        <strong>{documentLabel}</strong> just yet.
      </Text>

      {reason && (
        <Section style={styles.notice}>
          <Text style={styles.noticeText}>
            <strong>What needs fixing:</strong> {reason}
          </Text>
        </Section>
      )}

      <Text style={styles.paragraph}>
        Please re-upload this document from your dashboard and we&apos;ll review
        it again right away.
      </Text>

      <div style={styles.buttonWrap}>
        <Button style={styles.button} href={dashboardUrl}>
          Re-upload Document
        </Button>
      </div>

      <Text style={styles.paragraph}>
        Need a hand? Reply to this email or contact us at{" "}
        <a href="mailto:support@halalme.co.uk" style={styles.link}>
          support@halalme.co.uk
        </a>
        .
      </Text>

      <Text style={styles.signature}>The HalalMe Delivery Team</Text>
    </EmailLayout>
  );
}
