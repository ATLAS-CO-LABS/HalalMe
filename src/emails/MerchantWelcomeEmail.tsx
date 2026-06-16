import { Button, Heading, Hr, Section, Text } from "@react-email/components";
import { EmailLayout, styles } from "./theme";

interface MerchantWelcomeEmailProps {
  restaurantName: string;
  ownerName?: string;
  dashboardUrl?: string;
}

export default function MerchantWelcomeEmail({
  restaurantName,
  ownerName,
  dashboardUrl = "https://halalme.co.uk/merchant",
}: MerchantWelcomeEmailProps) {
  const greeting = ownerName ? `Hi ${ownerName},` : "Hi there,";

  return (
    <EmailLayout preview="Your HalalMe merchant application has been received">
      <Heading style={styles.h1}>Application Received</Heading>

      <Text style={styles.paragraph}>{greeting}</Text>
      <Text style={styles.paragraph}>
        Thank you for applying to join HalalMe as a merchant partner. We&apos;ve
        received your application for <strong>{restaurantName}</strong> and our
        team is reviewing it now.
      </Text>

      <Hr style={styles.divider} />

      <Heading as="h2" style={styles.h2}>
        Your next 2 steps
      </Heading>

      <Section style={styles.stepList}>
        <Text style={styles.step}>
          <span style={styles.stepNumber}>1</span>
          <span style={styles.stepText}>
            <strong>Access your merchant dashboard</strong> - track your
            onboarding status and manage your details in one place. Use the
            button below to open it.
          </span>
        </Text>
        <Text style={styles.step}>
          <span style={styles.stepNumber}>2</span>
          <span style={styles.stepText}>
            <strong>Complete your verification</strong> - upload your halal
            certificate, food hygiene rating and other documents in the
            dashboard so our team can verify{" "}
            <strong>{restaurantName}</strong> and get you live.
          </span>
        </Text>
      </Section>

      <div style={styles.buttonWrap}>
        <Button style={styles.button} href={dashboardUrl}>
          Open My Dashboard
        </Button>
      </div>

      <Hr style={styles.divider} />

      <Section style={styles.notice}>
        <Text style={styles.noticeText}>
          <strong>Important:</strong> Your restaurant is <em>not yet live</em> on
          HalalMe. You&apos;ll go live once your verification is complete and our
          team confirms it with you.
        </Text>
      </Section>

      <Text style={styles.paragraph}>
        If you have any questions in the meantime, reply to this email or contact
        us at{" "}
        <a href="mailto:support@halalme.co.uk" style={styles.link}>
          support@halalme.co.uk
        </a>
        .
      </Text>

      <Text style={styles.paragraph}>We&apos;re excited to have you on board.</Text>

      <Text style={styles.signature}>The HalalMe Delivery Team</Text>
    </EmailLayout>
  );
}
