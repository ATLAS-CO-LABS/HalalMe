import { Heading, Hr, Section, Text } from "@react-email/components";
import { EmailLayout, styles, SUPPORT_EMAIL } from "./theme";

interface MerchantInviteSentEmailProps {
  restaurantName: string;
  ownerName?: string;
}

export default function MerchantInviteSentEmail({
  restaurantName,
  ownerName,
}: MerchantInviteSentEmailProps) {
  const greeting = ownerName ? `Hi ${ownerName},` : "Hi there,";

  return (
    <EmailLayout preview="Your HalalMe merchant dashboard invite has been sent">
      <Heading style={styles.h1}>Your Dashboard Invite Has Been Sent</Heading>

      <Text style={styles.paragraph}>{greeting}</Text>
      <Text style={styles.paragraph}>
        Great news - we&apos;ve sent your merchant dashboard invite for{" "}
        <strong>{restaurantName}</strong>. You should receive a separate email
        from <strong>Hyperzod</strong> shortly.
      </Text>

      <Hr style={styles.divider} />

      <Heading as="h2" style={styles.h2}>
        What to do now
      </Heading>

      <Section style={styles.stepList}>
        <Text style={styles.step}>
          <span style={styles.stepNumber}>1</span>
          <span style={styles.stepText}>
            <strong>Check your inbox for an email from Hyperzod.</strong> This is
            a separate email - look for it in your inbox and your spam / junk
            folder.
          </span>
        </Text>
        <Text style={styles.step}>
          <span style={styles.stepNumber}>2</span>
          <span style={styles.stepText}>
            <strong>Click the invite link</strong> in the Hyperzod email to set
            up your login credentials and access your merchant dashboard.
          </span>
        </Text>
        <Text style={styles.step}>
          <span style={styles.stepNumber}>3</span>
          <span style={styles.stepText}>
            <strong>Start preparing your menu</strong> - add your categories,
            dishes, prices, and opening hours inside the Hyperzod dashboard.
          </span>
        </Text>
        <Text style={styles.step}>
          <span style={styles.stepNumber}>4</span>
          <span style={styles.stepText}>
            <strong>Our agent will be in touch shortly</strong> to walk you
            through the next steps and discuss your commission arrangement.
          </span>
        </Text>
      </Section>

      <Hr style={styles.divider} />

      <Section style={styles.notice}>
        <Text style={styles.noticeText}>
          <strong>Important:</strong> Your restaurant is <em>not yet live</em> on
          HalalMe. You will only go live once our team has reviewed your setup
          and given final approval.
        </Text>
      </Section>

      <Section style={styles.infoNotice}>
        <Text style={styles.noticeText}>
          <strong>Can&apos;t find the Hyperzod email?</strong> Check your spam or
          junk folder - it may have been filtered automatically. If you still
          can&apos;t find it, reply to this email and we will resend it.
        </Text>
      </Section>

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
