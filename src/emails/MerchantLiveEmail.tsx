import { Button, Heading, Hr, Section, Text } from "@react-email/components";
import { EmailLayout, styles, SUPPORT_EMAIL } from "./theme";

interface MerchantLiveEmailProps {
  restaurantName: string;
  ownerName?: string;
}

const DASHBOARD_URL = "https://merchant.hyperzod.app";

export default function MerchantLiveEmail({
  restaurantName,
  ownerName,
}: MerchantLiveEmailProps) {
  const greeting = ownerName ? `Hi ${ownerName},` : "Hi there,";

  return (
    <EmailLayout preview="You're live on HalalMe - customers can now order from you">
      <Section style={styles.celebrate}>
        <Text style={styles.celebrateEmoji}>🎉</Text>
        <Heading style={styles.h1Center}>You&apos;re Live on HalalMe!</Heading>
      </Section>

      <Text style={styles.paragraph}>{greeting}</Text>
      <Text style={styles.paragraph}>
        Congratulations - <strong>{restaurantName}</strong> is now live on
        HalalMe. Customers in your area can find your restaurant and start
        placing orders right away.
      </Text>

      <Hr style={styles.divider} />

      <Heading as="h2" style={styles.h2}>
        Managing your orders
      </Heading>

      <Section style={styles.stepList}>
        <Text style={styles.step}>
          <span style={styles.stepNumber}>1</span>
          <span style={styles.stepText}>
            <strong>Keep your dashboard open.</strong> New orders come through
            your Hyperzod merchant dashboard - make sure someone is watching it
            during opening hours.
          </span>
        </Text>
        <Text style={styles.step}>
          <span style={styles.stepNumber}>2</span>
          <span style={styles.stepText}>
            <strong>Accept orders promptly.</strong> Fast acceptance and accurate
            prep times lead to happier customers and better reviews.
          </span>
        </Text>
        <Text style={styles.step}>
          <span style={styles.stepNumber}>3</span>
          <span style={styles.stepText}>
            <strong>Keep your menu fresh.</strong> Update availability and prices
            in your dashboard so customers always see what&apos;s in stock.
          </span>
        </Text>
      </Section>

      <div style={{ ...styles.buttonWrap, margin: "28px 0 8px" }}>
        <Button style={styles.button} href={DASHBOARD_URL}>
          Open Your Dashboard
        </Button>
      </div>

      <Hr style={styles.divider} />

      <Text style={styles.paragraph}>
        Need a hand getting started, or have a question about your first orders?
        We&apos;re here to help - just reply to this email or contact us at{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} style={styles.link}>
          {SUPPORT_EMAIL}
        </a>
        .
      </Text>

      <Text style={styles.paragraph}>
        Welcome to the HalalMe family - here&apos;s to your first of many orders.
      </Text>

      <Text style={styles.signature}>The HalalMe Delivery Team</Text>
    </EmailLayout>
  );
}
