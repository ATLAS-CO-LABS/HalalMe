import { Button, Heading, Text } from "@react-email/components";
import { EmailLayout, styles } from "./theme";

interface MerchantCommissionInviteEmailProps {
  restaurantName: string;
  ownerName?: string;
  dashboardUrl?: string;
}

export default function MerchantCommissionInviteEmail({
  restaurantName,
  ownerName,
  dashboardUrl = "https://halalme.co.uk/merchant",
}: MerchantCommissionInviteEmailProps) {
  const greeting = ownerName ? `Hi ${ownerName},` : "Hi there,";

  return (
    <EmailLayout preview={`Let's agree your commission - ${restaurantName}`}>
      <Heading style={styles.h1}>Let&apos;s Agree Your Commission</Heading>

      <Text style={styles.paragraph}>{greeting}</Text>
      <Text style={styles.paragraph}>
        Great news - <strong>{restaurantName}</strong> is ready for the
        commission stage. It only takes a minute: answer a few quick questions in
        your dashboard and we&apos;ll show you your recommended rate straight
        away.
      </Text>
      <Text style={styles.paragraph}>
        If you&apos;re on cheaper terms with another delivery platform, you can
        request a review and our Price Promise may match it.
      </Text>

      <div style={styles.buttonWrap}>
        <Button style={styles.button} href={dashboardUrl}>
          Set Up My Commission
        </Button>
      </div>

      <Text style={styles.paragraph}>
        Questions? Reply to this email or contact us at{" "}
        <a href="mailto:support@halalme.co.uk" style={styles.link}>
          support@halalme.co.uk
        </a>
        .
      </Text>

      <Text style={styles.signature}>The HalalMe Delivery Team</Text>
    </EmailLayout>
  );
}
