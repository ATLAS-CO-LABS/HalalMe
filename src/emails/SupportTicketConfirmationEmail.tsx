import { Heading, Hr, Section, Text } from "@react-email/components";
import { EmailLayout, styles } from "./theme";

interface SupportTicketConfirmationEmailProps {
  recipientName: string;
  subject: string;
  messagePreview: string;
  reference: string;
}

// Sent to the submitter immediately after a contact-form ticket is created,
// so they have a reference and know it actually went through.
export default function SupportTicketConfirmationEmail({
  recipientName,
  subject,
  messagePreview,
  reference,
}: SupportTicketConfirmationEmailProps) {
  return (
    <EmailLayout preview="We've received your message">
      <Heading style={styles.h1}>We&apos;ve got your message</Heading>

      <Text style={styles.paragraph}>Hi {recipientName},</Text>
      <Text style={styles.paragraph}>
        Thanks for reaching out about <strong>{subject}</strong>. Our team
        will get back to you within 24 hours during business days.
      </Text>

      <Section style={styles.notice}>
        <Text style={{ ...styles.noticeText, whiteSpace: "pre-wrap" }}>
          {messagePreview}
        </Text>
      </Section>

      <Hr style={styles.divider} />

      <Text style={styles.small}>Reference: {reference}</Text>
      <Text style={styles.signature}>The HalalMe Support Team</Text>
    </EmailLayout>
  );
}
