import { Heading, Hr, Section, Text } from "@react-email/components";
import { buildMerchantAgreement } from "@/lib/merchantAgreement";
import { EmailLayout, styles, SUPPORT_EMAIL } from "./theme";

interface MerchantContractEmailProps {
  restaurantName: string;
  ownerName?: string;
  commission: number;
  signedAt: string; // human-readable date/time
}

export default function MerchantContractEmail({
  restaurantName,
  ownerName,
  commission,
  signedAt,
}: MerchantContractEmailProps) {
  const greeting = ownerName ? `Hi ${ownerName},` : "Hi there,";
  const agreement = buildMerchantAgreement({
    restaurantName,
    ownerName,
    commission,
  });

  return (
    <EmailLayout preview="Your signed HalalMe Merchant Agreement - copy for your records">
      <Heading style={styles.h1}>Your Agreement - Confirmed</Heading>

      <Text style={styles.paragraph}>{greeting}</Text>
      <Text style={styles.paragraph}>
        Thank you for signing the HalalMe Merchant Agreement for{" "}
        <strong>{restaurantName}</strong>. This email is your copy for your
        records. Below are the key details and the full terms you agreed to.
      </Text>

      <Section style={styles.summaryBox}>
        <Text style={styles.summaryRow}>
          <strong>Restaurant:</strong> {restaurantName}
        </Text>
        <Text style={styles.summaryRow}>
          <strong>Commission rate:</strong> {agreement.commissionLabel}
        </Text>
        <Text style={styles.summaryRow}>
          <strong>Agreement version:</strong> {agreement.version}
        </Text>
        <Text style={styles.summaryRow}>
          <strong>Signed:</strong> {signedAt}
        </Text>
      </Section>

      <Hr style={styles.divider} />

      <Heading as="h2" style={styles.h2}>
        {agreement.title}
      </Heading>
      <Text style={styles.small}>{agreement.parties}</Text>

      {agreement.clauses.map((c) => (
        <Section key={c.heading} style={{ marginBottom: "12px" }}>
          <Text style={styles.clauseHeading}>{c.heading}</Text>
          <Text style={styles.clauseBody}>{c.body}</Text>
        </Section>
      ))}

      <Hr style={styles.divider} />

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

MerchantContractEmail.PreviewProps = {
  restaurantName: "Dar Par",
  ownerName: "Ahmed",
  commission: 20,
  signedAt: "15 July 2026, 10:32am",
} as MerchantContractEmailProps;
