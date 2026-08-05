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
            <strong>Your dashboard invite.</strong> We&apos;ll send your
            restaurant dashboard invite shortly - that&apos;s where you&apos;ll
            build your menu, prices, and opening hours.
          </span>
        </Text>
        <Text style={styles.step}>
          <span style={styles.stepNumber}>2</span>
          <span style={styles.stepText}>
            <strong>Going live.</strong> Once your menu is set up and our team
            has done a final check, we&apos;ll activate your restaurant and let
            you know the moment you&apos;re live.
          </span>
        </Text>
      </Section>

      <Section style={styles.notice}>
        <Text style={styles.noticeText}>
          <strong>Typical timeline:</strong> most merchants are live within a few
          working days of setting up their menu.
        </Text>
      </Section>

      <Text style={styles.paragraph}>
        Keep an eye on your inbox - your dashboard invite is on its way.
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
