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
      <Heading style={styles.h1}>You&apos;re Approved - Here&apos;s Your Dashboard</Heading>

      <Text style={styles.paragraph}>{greeting}</Text>
      <Text style={styles.paragraph}>
        Your commission is agreed and <strong>{restaurantName}</strong> is
        approved to join HalalMe. The last step is setting up your menu, and
        we&apos;ve just sent your dashboard invite as a separate email - it
        should land shortly.
      </Text>

      <Hr style={styles.divider} />

      <Heading as="h2" style={styles.h2}>
        What to do now
      </Heading>

      <Section style={styles.stepList}>
        <Text style={styles.step}>
          <span style={styles.stepNumber}>1</span>
          <span style={styles.stepText}>
            <strong>Check your inbox for your dashboard invite.</strong> This is
            a separate email - look for it in your inbox and your spam / junk
            folder.
          </span>
        </Text>
        <Text style={styles.step}>
          <span style={styles.stepNumber}>2</span>
          <span style={styles.stepText}>
            <strong>Click the invite link</strong> in that email to set
            up your login credentials and access your merchant dashboard.
          </span>
        </Text>
        <Text style={styles.step}>
          <span style={styles.stepNumber}>3</span>
          <span style={styles.stepText}>
            <strong>Build your menu</strong> - add your categories, dishes,
            prices, and opening hours inside your HalalMe Delivery dashboard.
          </span>
        </Text>
        <Text style={styles.step}>
          <span style={styles.stepNumber}>4</span>
          <span style={styles.stepText}>
            <strong>Tell us when you&apos;re ready</strong> - once your menu is
            complete, our team does a final check and switches you live.
          </span>
        </Text>
      </Section>

      <Hr style={styles.divider} />

      <Section style={styles.notice}>
        <Text style={styles.noticeText}>
          <strong>One more step:</strong> your restaurant goes live on HalalMe
          once your menu is set up and our team has done a final check. Finish
          your menu and you&apos;re ready to take orders.
        </Text>
      </Section>

      <Section style={styles.infoNotice}>
        <Text style={styles.noticeText}>
          <strong>Can&apos;t find the invite email?</strong> Check your spam or
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
