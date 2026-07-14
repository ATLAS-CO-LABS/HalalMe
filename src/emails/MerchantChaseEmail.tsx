import { Heading, Hr, Section, Text } from "@react-email/components";
import { EmailLayout, styles, SUPPORT_EMAIL } from "./theme";

interface MerchantChaseEmailProps {
  restaurantName: string;
  ownerName?: string;
}

export default function MerchantChaseEmail({
  restaurantName,
  ownerName,
}: MerchantChaseEmailProps) {
  const greeting = ownerName ? `Hi ${ownerName},` : "Hi there,";

  return (
    <EmailLayout preview="Need a hand setting up your HalalMe dashboard?">
      <Heading style={styles.h1}>Need a hand getting set up?</Heading>

      <Text style={styles.paragraph}>{greeting}</Text>
      <Text style={styles.paragraph}>
        A little while ago we sent your dashboard invite for{" "}
        <strong>{restaurantName}</strong>, but it looks like the setup isn&apos;t
        finished yet. No worries - we&apos;re here to help you get live.
      </Text>

      <Hr style={styles.divider} />

      <Heading as="h2" style={styles.h2}>
        To pick up where you left off
      </Heading>

      <Section style={styles.stepList}>
        <Text style={styles.step}>
          <span style={styles.stepNumber}>1</span>
          <span style={styles.stepText}>
            Check your inbox (and <strong>spam folder</strong>) for the invite
            email from <strong>Hyperzod</strong> - that&apos;s where you set up
            your login.
          </span>
        </Text>
        <Text style={styles.step}>
          <span style={styles.stepNumber}>2</span>
          <span style={styles.stepText}>
            Sign in and finish adding your menu and opening hours.
          </span>
        </Text>
        <Text style={styles.step}>
          <span style={styles.stepNumber}>3</span>
          <span style={styles.stepText}>
            Reply to this email if you can&apos;t find the invite - we&apos;ll
            resend it right away.
          </span>
        </Text>
      </Section>

      <Hr style={styles.divider} />

      <Text style={styles.paragraph}>
        Stuck on anything at all? Just reply here or email us at{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} style={styles.link}>
          {SUPPORT_EMAIL}
        </a>{" "}
        - we&apos;ll get you sorted.
      </Text>

      <Text style={styles.signature}>The HalalMe Delivery Team</Text>
    </EmailLayout>
  );
}
