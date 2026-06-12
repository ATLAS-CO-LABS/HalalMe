import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { buildMerchantAgreement } from "@/lib/merchantAgreement";

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
  const agreement = buildMerchantAgreement({ restaurantName, ownerName, commission });

  return (
    <Html>
      <Head />
      <Preview>Your signed HalalMe Merchant Agreement — copy for your records</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={brand}>HalalMe</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>Your Agreement — Confirmed</Heading>

            <Text style={paragraph}>{greeting}</Text>
            <Text style={paragraph}>
              Thank you for signing the HalalMe Merchant Agreement for{" "}
              <strong>{restaurantName}</strong>. This email is your copy for your
              records. Below are the key details and the full terms you agreed to.
            </Text>

            <Section style={summaryBox}>
              <Text style={summaryRow}><strong>Restaurant:</strong> {restaurantName}</Text>
              <Text style={summaryRow}><strong>Commission rate:</strong> {agreement.commissionLabel}</Text>
              <Text style={summaryRow}><strong>Agreement version:</strong> {agreement.version}</Text>
              <Text style={summaryRow}><strong>Signed:</strong> {signedAt}</Text>
            </Section>

            <Hr style={divider} />

            <Heading as="h2" style={h2}>{agreement.title}</Heading>
            <Text style={small}>{agreement.parties}</Text>

            {agreement.clauses.map((c) => (
              <Section key={c.heading} style={{ marginBottom: "12px" }}>
                <Text style={clauseHeading}>{c.heading}</Text>
                <Text style={clauseBody}>{c.body}</Text>
              </Section>
            ))}

            <Hr style={divider} />

            <Text style={paragraph}>
              Any questions? Reply to this email or contact us at{" "}
              <a href="mailto:support@halalme.co.uk" style={link}>support@halalme.co.uk</a>.
            </Text>
            <Text style={signature}>The HalalMe Team</Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>© {new Date().getFullYear()} HalalMe · United Kingdom</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main: React.CSSProperties = {
  backgroundColor: "#f4f4f4",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};
const container: React.CSSProperties = {
  maxWidth: "580px",
  margin: "40px auto",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};
const header: React.CSSProperties = { backgroundColor: "#102C26", padding: "24px 40px" };
const brand: React.CSSProperties = {
  color: "#F7E7CE", fontSize: "24px", fontWeight: "700", letterSpacing: "0.5px", margin: 0,
};
const content: React.CSSProperties = { padding: "40px 40px 24px" };
const h1: React.CSSProperties = {
  color: "#102C26", fontSize: "26px", fontWeight: "700", marginTop: 0, marginBottom: "16px",
};
const h2: React.CSSProperties = {
  color: "#102C26", fontSize: "18px", fontWeight: "600", marginBottom: "8px",
};
const paragraph: React.CSSProperties = {
  color: "#444444", fontSize: "15px", lineHeight: "1.6", margin: "0 0 16px",
};
const summaryBox: React.CSSProperties = {
  backgroundColor: "#F7F4EC",
  border: "1px solid #E7DFCC",
  borderRadius: "6px",
  padding: "16px 20px",
  margin: "0 0 8px",
};
const summaryRow: React.CSSProperties = {
  color: "#102C26", fontSize: "14px", lineHeight: "1.7", margin: 0,
};
const divider: React.CSSProperties = { borderColor: "#eeeeee", margin: "24px 0" };
const small: React.CSSProperties = {
  color: "#666666", fontSize: "13px", lineHeight: "1.6", margin: "0 0 16px",
};
const clauseHeading: React.CSSProperties = {
  color: "#102C26", fontSize: "14px", fontWeight: "700", margin: "0 0 2px",
};
const clauseBody: React.CSSProperties = {
  color: "#555555", fontSize: "13px", lineHeight: "1.6", margin: 0,
};
const link: React.CSSProperties = { color: "#102C26", textDecoration: "underline" };
const signature: React.CSSProperties = {
  color: "#102C26", fontSize: "15px", fontWeight: "600", margin: "24px 0 0",
};
const footer: React.CSSProperties = {
  backgroundColor: "#f9f9f9", padding: "16px 40px", borderTop: "1px solid #eeeeee",
};
const footerText: React.CSSProperties = {
  color: "#999999", fontSize: "12px", margin: 0, textAlign: "center",
};
