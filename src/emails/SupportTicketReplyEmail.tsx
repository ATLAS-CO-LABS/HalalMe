import { Button, Heading, Hr, Section, Text } from "@react-email/components";
import { EmailLayout, styles } from "./theme";

interface SupportTicketReplyEmailProps {
  recipientName?: string;
  subject: string;
  replyPreview: string;
  threadUrl: string;
}

// Sent to the requester's account email when an admin replies to their ticket.
export default function SupportTicketReplyEmail({
  recipientName,
  subject,
  replyPreview,
  threadUrl,
}: SupportTicketReplyEmailProps) {
  const greeting = recipientName ? `Hi ${recipientName},` : "Hi there,";

  return (
    <EmailLayout preview="You have a reply from HalalMe Support">
      <Heading style={styles.h1}>You have a reply from Support</Heading>

      <Text style={styles.paragraph}>{greeting}</Text>
      <Text style={styles.paragraph}>
        Our team has replied to your message about{" "}
        <strong>{subject}</strong>.
      </Text>

      <Section style={styles.notice}>
        <Text style={{ ...styles.noticeText, whiteSpace: "pre-wrap" }}>
          {replyPreview}
        </Text>
      </Section>

      <Section style={styles.buttonWrap}>
        <Button href={threadUrl} style={styles.button}>
          View &amp; reply
        </Button>
      </Section>

      <Hr style={styles.divider} />

      <Text style={styles.small}>
        Reply within the app to continue the conversation.
      </Text>

      <Text style={styles.signature}>The HalalMe Support Team</Text>
    </EmailLayout>
  );
}
