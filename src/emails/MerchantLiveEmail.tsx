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

interface MerchantLiveEmailProps {
  restaurantName: string;
  ownerName?: string;
}

const DASHBOARD_URL = "https://merchant.hyperzod.app";

export default function MerchantLiveEmail({
  restaurantName,
  ownerName,
}: MerchantLiveEmailProps) {
  const greeting = ownerName ? `Hi ${ownerName},` : "Hi there,";

  return (
    <Html>
      <Head />
      <Preview>You&apos;re live on HalalMe — customers can now order from you</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={brand}>HalalMe</Text>
          </Section>

          <Section style={content}>
            <Section style={celebrate}>
              <Text style={celebrateEmoji}>🎉</Text>
              <Heading style={h1}>You&apos;re Live on HalalMe!</Heading>
            </Section>

            <Text style={paragraph}>{greeting}</Text>
            <Text style={paragraph}>
              Congratulations — <strong>{restaurantName}</strong> is now live on
              HalalMe. Customers in your area can find your restaurant and start
              placing orders right away.
            </Text>

            <Hr style={divider} />

            <Heading as="h2" style={h2}>
              Managing your orders
            </Heading>

            <Section style={stepList}>
              <Text style={step}>
                <span style={stepNumber}>1</span>
                <span style={stepText}>
                  <strong>Keep your dashboard open.</strong> New orders come
                  through your Hyperzod merchant dashboard — make sure someone is
                  watching it during opening hours.
                </span>
              </Text>
              <Text style={step}>
                <span style={stepNumber}>2</span>
                <span style={stepText}>
                  <strong>Accept orders promptly.</strong> Fast acceptance and
                  accurate prep times lead to happier customers and better
                  reviews.
                </span>
              </Text>
              <Text style={step}>
                <span style={stepNumber}>3</span>
                <span style={stepText}>
                  <strong>Keep your menu fresh.</strong> Update availability and
                  prices in your dashboard so customers always see what&apos;s in
                  stock.
                </span>
              </Text>
            </Section>

            <Section style={ctaWrap}>
              <a href={DASHBOARD_URL} style={ctaButton}>
                Open Your Dashboard
              </a>
            </Section>

            <Hr style={divider} />

            <Text style={paragraph}>
              Need a hand getting started, or have a question about your first
              orders? We&apos;re here to help — just reply to this email or contact
              us at{" "}
              <a href="mailto:support@halalme.co.uk" style={link}>
                support@halalme.co.uk
              </a>
              .
            </Text>

            <Text style={paragraph}>
              Welcome to the HalalMe family — here&apos;s to your first of many
              orders.
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

const header: React.CSSProperties = {
  backgroundColor: "#102C26",
  padding: "24px 40px",
};

const brand: React.CSSProperties = {
  color: "#F7E7CE",
  fontSize: "24px",
  fontWeight: "700",
  letterSpacing: "0.5px",
  margin: 0,
};

const content: React.CSSProperties = {
  padding: "40px 40px 24px",
};

const celebrate: React.CSSProperties = {
  textAlign: "center",
  marginBottom: "8px",
};

const celebrateEmoji: React.CSSProperties = {
  fontSize: "40px",
  margin: "0 0 8px",
  lineHeight: 1,
};

const h1: React.CSSProperties = {
  color: "#102C26",
  fontSize: "26px",
  fontWeight: "700",
  margin: 0,
  textAlign: "center",
};

const h2: React.CSSProperties = {
  color: "#102C26",
  fontSize: "18px",
  fontWeight: "600",
  marginBottom: "12px",
};

const paragraph: React.CSSProperties = {
  color: "#444444",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 16px",
};

const divider: React.CSSProperties = {
  borderColor: "#eeeeee",
  margin: "24px 0",
};

const stepList: React.CSSProperties = {
  margin: "0 0 8px",
};

const step: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  color: "#444444",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 14px",
};

const stepNumber: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: "#102C26",
  color: "#F7E7CE",
  borderRadius: "50%",
  width: "24px",
  height: "24px",
  lineHeight: "24px",
  textAlign: "center",
  fontSize: "13px",
  fontWeight: "700",
  flexShrink: 0,
  marginRight: "12px",
  marginTop: "1px",
};

const stepText: React.CSSProperties = { flex: 1 };

const ctaWrap: React.CSSProperties = {
  textAlign: "center",
  margin: "28px 0 8px",
};

const ctaButton: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: "#F03E9E",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "700",
  textDecoration: "none",
  padding: "13px 32px",
  borderRadius: "8px",
};

const link: React.CSSProperties = {
  color: "#102C26",
  textDecoration: "underline",
};

const signature: React.CSSProperties = {
  color: "#102C26",
  fontSize: "15px",
  fontWeight: "600",
  margin: "24px 0 0",
};

const footer: React.CSSProperties = {
  backgroundColor: "#f9f9f9",
  padding: "16px 40px",
  borderTop: "1px solid #eeeeee",
};

const footerText: React.CSSProperties = {
  color: "#999999",
  fontSize: "12px",
  margin: 0,
  textAlign: "center",
};
