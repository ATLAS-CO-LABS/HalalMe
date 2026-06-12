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

interface MerchantDocsActionNeededEmailProps {
  restaurantName: string;
  ownerName?: string;
  documentLabel: string;
  reason?: string;
  dashboardUrl?: string;
}

export default function MerchantDocsActionNeededEmail({
  restaurantName,
  ownerName,
  documentLabel,
  reason,
  dashboardUrl = "https://halalme.co.uk/merchant",
}: MerchantDocsActionNeededEmailProps) {
  const greeting = ownerName ? `Hi ${ownerName},` : "Hi there,";

  return (
    <Html>
      <Head />
      <Preview>
        Action needed on your {documentLabel} - {restaurantName}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={brand}>HalalMe</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>A document needs your attention</Heading>

            <Text style={paragraph}>{greeting}</Text>
            <Text style={paragraph}>
              Thanks for submitting your verification documents for{" "}
              <strong>{restaurantName}</strong>. We weren&apos;t able to approve
              your <strong>{documentLabel}</strong> just yet.
            </Text>

            {reason && (
              <Section style={notice}>
                <Text style={noticeText}>
                  <strong>What needs fixing:</strong> {reason}
                </Text>
              </Section>
            )}

            <Text style={paragraph}>
              Please re-upload this document from your dashboard and we&apos;ll
              review it again right away.
            </Text>

            <Section style={buttonWrap}>
              <Button style={button} href={dashboardUrl}>
                Re-upload Document
              </Button>
            </Section>

            <Text style={paragraph}>
              Need a hand? Reply to this email or contact us at{" "}
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
const content: React.CSSProperties = { padding: "40px 40px 24px" };
const h1: React.CSSProperties = {
  color: "#102C26",
  fontSize: "24px",
  fontWeight: "700",
  marginTop: 0,
  marginBottom: "16px",
};
const paragraph: React.CSSProperties = {
  color: "#444444",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 16px",
};
const notice: React.CSSProperties = {
  backgroundColor: "#FFF8F0",
  borderLeft: "4px solid #F03E9E",
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
const buttonWrap: React.CSSProperties = {
  textAlign: "center",
  margin: "8px 0 20px",
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
