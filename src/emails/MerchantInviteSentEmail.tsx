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

interface MerchantInviteSentEmailProps {
  restaurantName: string;
  ownerName?: string;
}

export default function MerchantInviteSentEmail({
  restaurantName,
  ownerName,
}: MerchantInviteSentEmailProps) {
  const greeting = ownerName ? `Hi ${ownerName},` : "Hi there,";

  return (
    <Html>
      <Head />
      <Preview>Your HalalMe merchant dashboard invite has been sent</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={brand}>HalalMe</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>Your Dashboard Invite Has Been Sent</Heading>

            <Text style={paragraph}>{greeting}</Text>
            <Text style={paragraph}>
              Great news - we&apos;ve sent your merchant dashboard invite for{" "}
              <strong>{restaurantName}</strong>. You should receive a separate
              email from <strong>Hyperzod</strong> shortly.
            </Text>

            <Hr style={divider} />

            <Heading as="h2" style={h2}>
              What to do now
            </Heading>

            <Section style={stepList}>
              <Text style={step}>
                <span style={stepNumber}>1</span>
                <span style={stepText}>
                  <strong>Check your inbox for an email from Hyperzod.</strong>{" "}
                  This is a separate email - look for it in your inbox and your
                  spam / junk folder.
                </span>
              </Text>
              <Text style={step}>
                <span style={stepNumber}>2</span>
                <span style={stepText}>
                  <strong>Click the invite link</strong> in the Hyperzod email
                  to set up your login credentials and access your merchant
                  dashboard.
                </span>
              </Text>
              <Text style={step}>
                <span style={stepNumber}>3</span>
                <span style={stepText}>
                  <strong>Start preparing your menu</strong> - add your
                  categories, dishes, prices, and opening hours inside the
                  Hyperzod dashboard.
                </span>
              </Text>
              <Text style={step}>
                <span style={stepNumber}>4</span>
                <span style={stepText}>
                  <strong>Our agent will be in touch shortly</strong> to walk
                  you through the next steps and discuss your commission
                  arrangement.
                </span>
              </Text>
            </Section>

            <Hr style={divider} />

            <Section style={notice}>
              <Text style={noticeText}>
                <strong>Important:</strong> Your restaurant is{" "}
                <em>not yet live</em> on HalalMe. You will only go live once our
                team has reviewed your setup and given final approval.
              </Text>
            </Section>

            <Section style={spamNote}>
              <Text style={spamText}>
                <strong>Can&apos;t find the Hyperzod email?</strong> Check your
                spam or junk folder - it may have been filtered automatically.
                If you still can&apos;t find it, reply to this email and we will
                resend it.
              </Text>
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
  fontSize: "24px",
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
  backgroundColor: "#FFF8F0",
  borderLeft: "4px solid #F03E9E",
  borderRadius: "4px",
  padding: "16px 20px",
  marginBottom: "16px",
};

const noticeText: React.CSSProperties = {
  color: "#444444",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: 0,
};

const spamNote: React.CSSProperties = {
  backgroundColor: "#F0F7FF",
  borderLeft: "4px solid #3B82F6",
  borderRadius: "4px",
  padding: "16px 20px",
  marginBottom: "24px",
};

const spamText: React.CSSProperties = {
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
