import { Heading, Hr, Section, Text } from "@react-email/components";
import { EmailLayout, styles, SUPPORT_EMAIL } from "./theme";

interface MerchantAgreementEmailProps {
  restaurantName: string;
  ownerName?: string;
}

export default function MerchantAgreementEmail({
  restaurantName,
  ownerName,
}: MerchantAgreementEmailProps) {
  const greeting = ownerName ? `Hi ${ownerName},` : "Hi there,";

  return (
    <EmailLayout preview="Thanks for confirming - your HalalMe onboarding is underway">
      <Heading style={styles.h1}>We&apos;re Almost There</Heading>

      <Text style={styles.paragraph}>{greeting}</Text>
      <Text style={styles.paragraph}>
        Thank you for confirming the commission arrangement for{" "}
        <strong>{restaurantName}</strong>. We&apos;re delighted to have you
        partnering with HalalMe.
      </Text>

      <Hr style={styles.divider} />

      <Heading as="h2" style={styles.h2}>
        What happens now
      </Heading>

      <Section style={styles.stepList}>
        <Text style={styles.step}>
          <span style={styles.stepNumber}>1</span>
          <span style={styles.stepText}>
            <strong>Final onboarding review.</strong> Our team is verifying your
            menu, details, and setup to make sure everything is ready for
            customers.
          </span>
        </Text>
        <Text style={styles.step}>
          <span style={styles.stepNumber}>2</span>
          <span style={styles.stepText}>
            <strong>Going live.</strong> Once the review is complete, we&apos;ll
            activate your restaurant on HalalMe and let you know the moment
            you&apos;re live.
          </span>
        </Text>
      </Section>

      <Section style={styles.notice}>
        <Text style={styles.noticeText}>
          <strong>Typical timeline:</strong> most merchants are reviewed and live
          within a few working days, provided your menu and dashboard setup are
          complete.
        </Text>
      </Section>

      <Text style={styles.paragraph}>
        In the meantime, make sure your menu and opening hours are finalised in
        your Hyperzod dashboard so there are no delays.
      </Text>

      <Text style={styles.paragraph}>
        Any questions? Reply to this email or contact us at{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} style={styles.link}>
          {SUPPORT_EMAIL}
        </a>
        .
      </Text>

      <Text style={styles.signature}>The HalalMe Delivery Team</Text>
    </EmailLayout>
  );
}
