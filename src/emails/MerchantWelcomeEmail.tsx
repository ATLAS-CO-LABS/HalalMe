import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface MerchantWelcomeEmailProps {
  restaurantName: string;
  ownerName?: string;
  dashboardUrl?: string;
}

export default function MerchantWelcomeEmail({
  restaurantName,
  ownerName,
  dashboardUrl = "https://halalme.co.uk/merchant",
}: MerchantWelcomeEmailProps) {
  const greeting = ownerName ? `Hi ${ownerName},` : "Hi there,";

  return (
    <Html>
      <Head />
      <Preview>Your HalalMe merchant application has been received</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Brand header */}
          <Section style={header}>
            <Text style={brand}>HalalMe</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>Application Received</Heading>

            <Text style={paragraph}>{greeting}</Text>
            <Text style={paragraph}>
              Thank you for applying to join HalalMe as a merchant partner.
              We&apos;ve received your application for{" "}
              <strong>{restaurantName}</strong> and our team is reviewing it
              now.
            </Text>

            <Hr style={divider} />

            <Heading as="h2" style={h2}>
              Your next 2 steps
            </Heading>

            <Section style={stepList}>
              <Text style={step}>
                <span style={stepNumber}>1</span>
                <span style={stepText}>
                  <strong>Access your merchant dashboard</strong> - track your
                  onboarding status and manage your details in one place. Use
                  the button below to open it.
                </span>
              </Text>
              <Text style={step}>
                <span style={stepNumber}>2</span>
                <span style={stepText}>
                  <strong>Complete your verification</strong> - upload your
                  halal certificate, food hygiene rating and other documents in
                  the dashboard so our team can verify{" "}
                  <strong>{restaurantName}</strong> and get you live.
                </span>
              </Text>
            </Section>

            <Section style={buttonWrap}>
              <Button style={button} href={dashboardUrl}>
                Open My Dashboard
              </Button>
            </Section>

            <Hr style={divider} />

            <Section style={notice}>
              <Text style={noticeText}>
                <strong>Important:</strong> Your restaurant is{" "}
                <em>not yet live</em> on HalalMe. You&apos;ll go live once your
                verification is complete and our team confirms it with you.
              </Text>
            </Section>

            <Text style={paragraph}>
              If you have any questions in the meantime, reply to this email or
              contact us at{" "}
              <a href="mailto:support@halalme.co.uk" style={link}>
                support@halalme.co.uk
              </a>
              .
            </Text>

            <Text style={paragraph}>
              We&apos;re excited to have you on board.
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

// Styles
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

const stepText: React.CSSProperties = {
  flex: 1,
};

const buttonWrap: React.CSSProperties = {
  textAlign: "center",
  margin: "8px 0 4px",
};

const button: React.CSSProperties = {
  backgroundColor: "#102C26",
  color: "#F7E7CE",
  fontSize: "15px",
  fontWeight: "600",
  textDecoration: "none",
  padding: "12px 28px",
  borderRadius: "6px",
  display: "inline-block",
};

const notice: React.CSSProperties = {
  backgroundColor: "#FFF8F0",
  borderLeft: "4px solid #F03E9E",
  borderRadius: "4px",
  padding: "16px 20px",
  marginBottom: "24px",
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
