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

interface MerchantAgreementEmailProps {
  restaurantName: string;
  ownerName?: string;
}

export default function MerchantAgreementEmail({
  restaurantName,
  ownerName,
}: MerchantAgreementEmailProps) {
  const greeting = ownerName ? `Hi ${ownerName},` : "Hi there,";

  return (
    <Html>
      <Head />
      <Preview>Thanks for confirming — your HalalMe onboarding is underway</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={brand}>HalalMe</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>We&apos;re Almost There</Heading>

            <Text style={paragraph}>{greeting}</Text>
            <Text style={paragraph}>
              Thank you for confirming the commission arrangement for{" "}
              <strong>{restaurantName}</strong>. We&apos;re delighted to have you
              partnering with HalalMe.
            </Text>

            <Hr style={divider} />

            <Heading as="h2" style={h2}>
              What happens now
            </Heading>

            <Section style={stepList}>
              <Text style={step}>
                <span style={stepNumber}>1</span>
                <span style={stepText}>
                  <strong>Final onboarding review.</strong> Our team is verifying
                  your menu, details, and setup to make sure everything is ready
                  for customers.
                </span>
              </Text>
              <Text style={step}>
                <span style={stepNumber}>2</span>
                <span style={stepText}>
                  <strong>Going live.</strong> Once the review is complete,
                  we&apos;ll activate your restaurant on HalalMe and let you know
                  the moment you&apos;re live.
                </span>
              </Text>
            </Section>

            <Section style={notice}>
              <Text style={noticeText}>
                <strong>Typical timeline:</strong> most merchants are reviewed and
                live within a few working days, provided your menu and dashboard
                setup are complete.
              </Text>
            </Section>

            <Text style={paragraph}>
              In the meantime, make sure your menu and opening hours are finalised
              in your Hyperzod dashboard so there are no delays.
            </Text>

            <Text style={paragraph}>
              Any questions? Reply to this email or contact us at{" "}
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

const h1: React.CSSProperties = {
  color: "#102C26",
  fontSize: "26px",
  fontWeight: "700",
  marginTop: 0,
  marginBottom: "16px",
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

const notice: React.CSSProperties = {
  backgroundColor: "#F0F7FF",
  borderLeft: "4px solid #3B82F6",
  borderRadius: "4px",
  padding: "16px 20px",
  margin: "0 0 16px",
};

const noticeText: React.CSSProperties = {
  color: "#444444",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: 0,
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
