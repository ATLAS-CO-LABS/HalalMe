import {
  Body,
  Column,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

/**
 * HalalMe core-brand email theme — matches the OTP / verification email:
 * dark forest green (#0B1E1A), card (#112520), champagne text (#F7E7CE),
 * gold accent (#F59E0B), Georgia serif. Gold top + bottom rules, logo header.
 * Use for platform-wide emails (charity onboarding, rewards, account).
 */

export const colors = {
  forest: "#0B1E1A",
  card: "#112520",
  champagne: "#F7E7CE",
  gold: "#F59E0B",
  // champagne alphas
  c60: "rgba(247,231,206,0.6)",
  c45: "rgba(247,231,206,0.45)",
  c28: "rgba(247,231,206,0.28)",
  c25: "rgba(247,231,206,0.25)",
  c18: "rgba(247,231,206,0.18)",
  c10: "rgba(247,231,206,0.10)",
  c07: "rgba(247,231,206,0.07)",
};

const SERIF = "Georgia, 'Times New Roman', serif";
const ASSET_BASE = process.env.EMAIL_ASSET_BASE_URL || "https://halalme.co.uk";
const LOGO_URL = process.env.EMAIL_LOGO_URL || `${ASSET_BASE}/logo/logo.png`;

interface EmailLayoutProps {
  preview: string;
  /** Small uppercase label shown top-right in the header (e.g. "Charity payouts"). */
  sectionLabel?: string;
  children: React.ReactNode;
}

export function EmailLayout({ preview, sectionLabel = "HalalMe", children }: EmailLayoutProps) {
  return (
    <Html>
      <Head>
        <meta name="color-scheme" content="dark" />
        <meta name="supported-color-schemes" content="dark" />
      </Head>
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Gold top bar */}
          <Section style={goldBarTop}>
            <Text style={barText}>&nbsp;</Text>
          </Section>

          {/* Header: logo + wordmark, section label */}
          <Section style={header}>
            <Row>
              <Column style={{ verticalAlign: "middle" }}>
                <table cellPadding={0} cellSpacing={0}>
                  <tbody>
                    <tr>
                      <td style={{ verticalAlign: "middle", paddingRight: "8px" }}>
                        <Img src={LOGO_URL} width="26" height="26" alt="HalalMe" style={{ display: "block", opacity: 0.9 }} />
                      </td>
                      <td style={{ verticalAlign: "middle" }}>
                        <span style={brand}>HalalMe</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Column>
              <Column style={{ verticalAlign: "middle", textAlign: "right" }}>
                <span style={sectionLabelStyle}>{sectionLabel}</span>
              </Column>
            </Row>
          </Section>

          {/* Main card */}
          <Section style={card}>{children}</Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>© {new Date().getFullYear()} HalalMe. All rights reserved.</Text>
          </Section>

          {/* Gold bottom bar */}
          <Section style={goldBarBottom}>
            <Text style={barText}>&nbsp;</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ── Layout styles ──────────────────────────────────────────────
const main: React.CSSProperties = {
  margin: 0,
  padding: 0,
  backgroundColor: colors.forest,
  fontFamily: SERIF,
};

const container: React.CSSProperties = {
  maxWidth: "560px",
  width: "100%",
  margin: "40px auto",
};

const goldBarTop: React.CSSProperties = { backgroundColor: colors.gold };
const goldBarBottom: React.CSSProperties = { backgroundColor: colors.gold };
const barText: React.CSSProperties = { margin: 0, fontSize: "0px", lineHeight: "3px" };

const header: React.CSSProperties = {
  backgroundColor: colors.forest,
  padding: "28px 40px 24px",
};

const brand: React.CSSProperties = {
  fontFamily: SERIF,
  fontSize: "17px",
  fontWeight: 700,
  color: colors.champagne,
  letterSpacing: "-0.3px",
};

const sectionLabelStyle: React.CSSProperties = {
  fontSize: "9px",
  color: colors.c25,
  letterSpacing: "0.25em",
  textTransform: "uppercase",
  fontFamily: SERIF,
};

const card: React.CSSProperties = {
  backgroundColor: colors.card,
  padding: "48px 40px 44px",
};

const footer: React.CSSProperties = {
  backgroundColor: colors.forest,
  padding: "20px 40px",
  borderTop: `1px solid ${colors.c07}`,
};

const footerText: React.CSSProperties = {
  margin: 0,
  fontFamily: SERIF,
  fontSize: "11px",
  color: colors.c18,
};

// ── Shared content styles ──────────────────────────────────────
export const styles = {
  eyebrowText: {
    fontSize: "9px",
    fontFamily: SERIF,
    color: colors.gold,
    letterSpacing: "0.3em",
    textTransform: "uppercase",
  } as React.CSSProperties,

  h1: {
    margin: "14px 0 16px",
    fontFamily: SERIF,
    fontSize: "30px",
    fontWeight: 700,
    color: colors.champagne,
    lineHeight: "1.25",
    letterSpacing: "-0.5px",
  } as React.CSSProperties,

  subhead: {
    margin: "0 0 40px",
    fontFamily: SERIF,
    fontSize: "14px",
    color: colors.c45,
    lineHeight: "1.7",
  } as React.CSSProperties,

  paragraph: {
    margin: "0 0 14px",
    fontFamily: SERIF,
    fontSize: "14px",
    color: colors.c60,
    lineHeight: "1.75",
  } as React.CSSProperties,

  rule: {
    height: "1px",
    backgroundColor: colors.c07,
    fontSize: "0px",
    lineHeight: "1px",
    margin: "0 0 32px",
  } as React.CSSProperties,

  buttonWrap: { textAlign: "center", margin: "0 0 36px" } as React.CSSProperties,

  button: {
    backgroundColor: colors.gold,
    color: colors.forest,
    fontFamily: SERIF,
    fontSize: "14px",
    fontWeight: 700,
    textDecoration: "none",
    padding: "14px 34px",
    display: "inline-block",
    letterSpacing: "0.02em",
  } as React.CSSProperties,

  listHeading: {
    margin: "0 0 14px",
    fontFamily: SERIF,
    fontSize: "10px",
    color: colors.gold,
    letterSpacing: "0.3em",
    textTransform: "uppercase",
  } as React.CSSProperties,

  step: {
    display: "flex",
    alignItems: "flex-start",
    margin: "0 0 12px",
    fontFamily: SERIF,
    fontSize: "14px",
    color: colors.c60,
    lineHeight: "1.6",
  } as React.CSSProperties,

  stepNumber: {
    display: "inline-block",
    color: colors.gold,
    fontFamily: SERIF,
    fontSize: "13px",
    fontWeight: 700,
    flexShrink: 0,
    marginRight: "12px",
  } as React.CSSProperties,

  stepText: { flex: 1 } as React.CSSProperties,

  noticeBox: {
    backgroundColor: colors.forest,
    border: `1px solid ${colors.c10}`,
    padding: "16px 20px",
    margin: "0 0 16px",
  } as React.CSSProperties,

  noticeText: {
    margin: 0,
    fontFamily: SERIF,
    fontSize: "12px",
    color: colors.c45,
    lineHeight: "1.65",
  } as React.CSSProperties,

  link: { color: colors.gold, textDecoration: "underline" } as React.CSSProperties,

  fineprint: {
    margin: "0 0 4px",
    fontFamily: SERIF,
    fontSize: "12px",
    color: colors.c25,
    lineHeight: "1.65",
  } as React.CSSProperties,

  signature: {
    margin: "28px 0 0",
    fontFamily: SERIF,
    fontSize: "14px",
    fontWeight: 700,
    color: colors.champagne,
  } as React.CSSProperties,
};
