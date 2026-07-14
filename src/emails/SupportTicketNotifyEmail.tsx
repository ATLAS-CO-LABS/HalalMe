import { Button, Heading, Hr, Section, Text } from "@react-email/components";
import { EmailLayout, styles } from "./theme";

interface SupportTicketNotifyEmailProps {
  requesterName: string;
  requesterEmail: string;
  source: "user" | "merchant";
  subject: string;
  messagePreview: string;
  conversationUrl: string;
  isNew: boolean;
}

// Sent to the support team inbox when a user/merchant opens a new conversation
// or sends a new message on an existing one.
export default function SupportTicketNotifyEmail({
  requesterName,
  requesterEmail,
  source,
  subject,
  messagePreview,
  conversationUrl,
  isNew,
}: SupportTicketNotifyEmailProps) {
  return (
    <EmailLayout preview={`New support message from ${requesterName}`}>
      <Heading style={styles.h1}>
        {isNew ? "New support conversation" : "New reply on a conversation"}
      </Heading>

      <Text style={styles.paragraph}>
        {requesterName} ({source === "merchant" ? "merchant" : "user"}) sent a
        message to HalalMe Support.
      </Text>

      <Section style={styles.summaryBox}>
        <Text style={styles.summaryRow}>
          <strong>From:</strong> {requesterName}
        </Text>
        <Text style={styles.summaryRow}>
          <strong>Email:</strong> {requesterEmail}
        </Text>
        <Text style={styles.summaryRow}>
          <strong>Source:</strong> {source === "merchant" ? "Merchant" : "User"}
        </Text>
        <Text style={styles.summaryRow}>
          <strong>Subject:</strong> {subject}
        </Text>
      </Section>

      <Hr style={styles.divider} />

      <Heading as="h2" style={styles.h2}>
        Message
      </Heading>
      <Text style={{ ...styles.paragraph, whiteSpace: "pre-wrap" }}>
        {messagePreview}
      </Text>

      <Section style={styles.buttonWrap}>
        <Button href={conversationUrl} style={styles.button}>
          Open in admin inbox
        </Button>
      </Section>
    </EmailLayout>
  );
}
