import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface MerchantCounterOfferEmailProps {
  restaurantName: string;
  ownerName?: string;
  commission: number;
  dashboardUrl?: string;
}

export default function MerchantCounterOfferEmail({
  restaurantName,
  ownerName,
  commission,
  dashboardUrl = "https://halalme.co.uk/merchant",
}: MerchantCounterOfferEmailProps) {
  const greeting = ownerName ? `Hi ${ownerName},` : "Hi there,";
  const pct = `${Number.isInteger(commission) ? commission : commission.toFixed(1)}%`;

  return (
    <Html>
      <Head />
      <Preview>We&apos;ve made you a counter-offer - {restaurantName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={brand}>HalalMe</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>We&apos;ve Made You an Offer</Heading>

            <Text style={paragraph}>{greeting}</Text>
            <Text style={paragraph}>
              Thanks for your commission review request for{" "}
              <strong>{restaurantName}</strong>. We&apos;ve reviewed it and
              we&apos;d like to offer you:
            </Text>

            <Section style={rateBox}>
              <Text style={rateLabel}>Our counter-offer</Text>
              <Text style={rateValue}>{pct}</Text>
            </Section>

            <Text style={paragraph}>
              Log in to your dashboard to accept this rate and continue your
              onboarding.
            </Text>

            <Section style={buttonWrap}>
              <Button style={button} href={dashboardUrl}>
                Review &amp; Accept
              </Button>
            </Section>

            <Text style={paragraph}>
              Questions? Reply to this email or contact us at{" "}
              <a href="mailto:support@halalme.co.uk" style={link}>
                support@halalme.co.uk
              </a>
              .
            </Text>

            <Text style={signature}>The HalalMe Team</Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} HalalMe · United Kingdom
            </Text>
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
const paragraph: React.CSSProperties = {
  color: "#444444", fontSize: "15px", lineHeight: "1.6", margin: "0 0 16px",
};
const rateBox: React.CSSProperties = {
  backgroundColor: "#F7F4EC", border: "1px solid #E7DFCC", borderRadius: "6px",
  padding: "20px", textAlign: "center", margin: "0 0 16px",
};
const rateLabel: React.CSSProperties = {
  color: "#888888", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 4px",
};
const rateValue: React.CSSProperties = {
  color: "#102C26", fontSize: "34px", fontWeight: "700", margin: 0,
};
const buttonWrap: React.CSSProperties = { textAlign: "center", margin: "8px 0 20px" };
const button: React.CSSProperties = {
  backgroundColor: "#102C26", color: "#F7E7CE", fontSize: "15px", fontWeight: "600",
  textDecoration: "none", padding: "12px 28px", borderRadius: "6px", display: "inline-block",
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
