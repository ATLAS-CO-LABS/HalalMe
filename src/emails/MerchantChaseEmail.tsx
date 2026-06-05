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

interface MerchantChaseEmailProps {
  restaurantName: string;
  ownerName?: string;
}

export default function MerchantChaseEmail({
  restaurantName,
  ownerName,
}: MerchantChaseEmailProps) {
  const greeting = ownerName ? `Hi ${ownerName},` : "Hi there,";

  return (
    <Html>
      <Head />
      <Preview>Need a hand setting up your HalalMe dashboard?</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={brand}>HalalMe</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>Need a hand getting set up?</Heading>

            <Text style={paragraph}>{greeting}</Text>
            <Text style={paragraph}>
              A little while ago we sent your dashboard invite for{" "}
              <strong>{restaurantName}</strong>, but it looks like the setup
              isn&apos;t finished yet. No worries — we&apos;re here to help you get
              live.
            </Text>

            <Hr style={divider} />

            <Heading as="h2" style={h2}>
              To pick up where you left off
            </Heading>

            <Section style={stepList}>
              <Text style={step}>
                <span style={stepNumber}>1</span>
                <span style={stepText}>
                  Check your inbox (and <strong>spam folder</strong>) for the
                  invite email from <strong>Hyperzod</strong> — that&apos;s where
                  you set up your login.
                </span>
              </Text>
              <Text style={step}>
                <span style={stepNumber}>2</span>
                <span style={stepText}>
                  Sign in and finish adding your menu and opening hours.
                </span>
              </Text>
              <Text style={step}>
                <span style={stepNumber}>3</span>
                <span style={stepText}>
                  Reply to this email if you can&apos;t find the invite — we&apos;ll
                  resend it right away.
                </span>
              </Text>
            </Section>

            <Hr style={divider} />

            <Text style={paragraph}>
              Stuck on anything at all? Just reply here or email us at{" "}
              <a href="mailto:support@halalme.co.uk" style={link}>
                support@halalme.co.uk
              </a>{" "}
              — we&apos;ll get you sorted.
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
  maxWidth: "580px", margin: "40px auto", backgroundColor: "#ffffff",
  borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};
const header: React.CSSProperties = { backgroundColor: "#102C26", padding: "24px 40px" };
const brand: React.CSSProperties = { color: "#F7E7CE", fontSize: "24px", fontWeight: "700", letterSpacing: "0.5px", margin: 0 };
const content: React.CSSProperties = { padding: "40px 40px 24px" };
const h1: React.CSSProperties = { color: "#102C26", fontSize: "24px", fontWeight: "700", marginTop: 0, marginBottom: "16px" };
const h2: React.CSSProperties = { color: "#102C26", fontSize: "18px", fontWeight: "600", marginBottom: "12px" };
const paragraph: React.CSSProperties = { color: "#444444", fontSize: "15px", lineHeight: "1.6", margin: "0 0 16px" };
const divider: React.CSSProperties = { borderColor: "#eeeeee", margin: "24px 0" };
const stepList: React.CSSProperties = { margin: "0 0 8px" };
const step: React.CSSProperties = { display: "flex", alignItems: "flex-start", color: "#444444", fontSize: "15px", lineHeight: "1.6", margin: "0 0 14px" };
const stepNumber: React.CSSProperties = {
  display: "inline-block", backgroundColor: "#102C26", color: "#F7E7CE", borderRadius: "50%",
  width: "24px", height: "24px", lineHeight: "24px", textAlign: "center", fontSize: "13px",
  fontWeight: "700", flexShrink: 0, marginRight: "12px", marginTop: "1px",
};
const stepText: React.CSSProperties = { flex: 1 };
const link: React.CSSProperties = { color: "#102C26", textDecoration: "underline" };
const signature: React.CSSProperties = { color: "#102C26", fontSize: "15px", fontWeight: "600", margin: "24px 0 0" };
const footer: React.CSSProperties = { backgroundColor: "#f9f9f9", padding: "16px 40px", borderTop: "1px solid #eeeeee" };
const footerText: React.CSSProperties = { color: "#999999", fontSize: "12px", margin: 0, textAlign: "center" };
