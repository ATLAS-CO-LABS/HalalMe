import {
  Body,
  Column,
  Container,
  Font,
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
 * Shared HalalMe Delivery email theme.
 *
 * Palette: purple, grey and black/white — matching the HalalMe Delivery
 * brand (purple #5E188F, light purple #B96AF0, deep purple #1E0E38).
 * All merchant emails share the header (logo + "HalalMe Delivery" wordmark),
 * footer and base styles defined here so the look stays consistent.
 */

export const colors = {
  // Brand purples
  purple: "#5E188F",
  purpleLight: "#B96AF0",
  purpleDeep: "#1E0E38",
  purpleTint: "#F4EEFB",
  // Brand wordmark accent
  cream: "#F7E7CE",
  // Greyscale / black & white
  ink: "#161616",
  body: "#4B4B55",
  muted: "#8A8A94",
  border: "#E6E6EA",
  pageBg: "#F3F2F5",
  white: "#ffffff",
};

// Brand wordmark font (matches the app's --font-logo: Poppins).
const LOGO_FONT =
  "'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif";
// Shared across every email template so the domain/support address only
// needs to change in one place.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://halalme.co.uk";
export const SUPPORT_EMAIL = "support@halalme.co.uk";

// Absolute base for email image assets. Defaults to production; override with
// EMAIL_ASSET_BASE_URL (e.g. http://localhost:3000) to preview images locally.
const ASSET_BASE = process.env.EMAIL_ASSET_BASE_URL || "https://halalme.co.uk";
// EMAIL_BADGE_URL overrides the full badge URL (e.g. a Cloudinary-hosted copy
// for test sends before the asset is deployed to the production domain).
const BADGE_URL =
  process.env.EMAIL_BADGE_URL || `${ASSET_BASE}/logo/delivery-badge.png`;

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
}

/** Branded shell: HalalMe Delivery header + content card + footer. */
export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head>
        {/* Render the design as-is — don't let clients auto-tint it in dark mode */}
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light only" />
        <Font
          fontFamily="Poppins"
          fallbackFontFamily="Helvetica"
          webFont={{
            url: "https://fonts.gstatic.com/s/poppins/v24/pxiByp8kv8JHgFVrLCz7V15vEv-L.woff2",
            format: "woff2",
          }}
          fontWeight={700}
          fontStyle="normal"
        />
        <Font
          fontFamily="Poppins"
          fallbackFontFamily="Helvetica"
          webFont={{
            url: "https://fonts.gstatic.com/s/poppins/v24/pxiByp8kv8JHgFVrLDD4V15vEv-L.woff2",
            format: "woff2",
          }}
          fontWeight={800}
          fontStyle="normal"
        />
      </Head>
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Row>
              <Column style={logoCol}>
                <Img
                  src={BADGE_URL}
                  width="40"
                  height="40"
                  alt="HalalMe Delivery"
                  style={badgeImg}
                />
              </Column>
              <Column style={brandCol}>
                <Text style={brand}>
                  HalalMe <span style={brandAccent}>Delivery</span>
                </Text>
              </Column>
            </Row>
          </Section>

          <Section style={content}>{children}</Section>

          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} HalalMe Delivery · United Kingdom
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ── Layout styles ──────────────────────────────────────────────
const main: React.CSSProperties = {
  backgroundColor: colors.pageBg,
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

const container: React.CSSProperties = {
  maxWidth: "580px",
  margin: "40px auto",
  backgroundColor: colors.white,
  borderRadius: "10px",
  overflow: "hidden",
  boxShadow: "0 2px 12px rgba(30,14,56,0.10)",
};

const header: React.CSSProperties = {
  backgroundColor: colors.purpleDeep,
  padding: "22px 40px",
  borderBottom: `3px solid ${colors.purple}`,
};

const logoCol: React.CSSProperties = {
  width: "52px",
  verticalAlign: "middle",
};

const badgeImg: React.CSSProperties = {
  display: "block",
  // Fixed px radius (not 50%) — Gmail renders percentage border-radius
  // inconsistently, so a circle needs an explicit half-of-dimension value.
  borderRadius: "20px",
};

const brandCol: React.CSSProperties = {
  verticalAlign: "middle",
};

const brand: React.CSSProperties = {
  fontFamily: LOGO_FONT,
  color: colors.cream,
  fontSize: "25px",
  fontWeight: 800,
  // Poppins is stripped by Gmail/Outlook, which fall back to bold Arial —
  // its wider glyphs read cramped under Poppins-tuned tight tracking, so
  // keep this close to neutral rather than matching the webfont exactly.
  letterSpacing: "-0.1px",
  lineHeight: "40px",
  margin: 0,
};

const brandAccent: React.CSSProperties = {
  color: colors.purpleLight,
  fontWeight: 800,
};

const content: React.CSSProperties = {
  padding: "40px 40px 24px",
};

const footer: React.CSSProperties = {
  backgroundColor: "#FAF9FB",
  padding: "16px 40px",
  borderTop: `1px solid ${colors.border}`,
};

const footerText: React.CSSProperties = {
  color: colors.muted,
  fontSize: "12px",
  margin: 0,
  textAlign: "center",
};

// ── Shared content styles ──────────────────────────────────────
export const styles = {
  h1: {
    fontFamily: LOGO_FONT,
    color: colors.ink,
    fontSize: "25px",
    fontWeight: 800,
    // See brand style above: kept close to neutral so the bold-Arial
    // fallback (Gmail/Outlook) doesn't read cramped.
    letterSpacing: "-0.1px",
    marginTop: 0,
    marginBottom: "16px",
  } as React.CSSProperties,

  h2: {
    fontFamily: LOGO_FONT,
    color: colors.ink,
    fontSize: "18px",
    fontWeight: 700,
    marginBottom: "12px",
  } as React.CSSProperties,

  paragraph: {
    color: colors.body,
    fontSize: "15px",
    lineHeight: "1.6",
    margin: "0 0 16px",
  } as React.CSSProperties,

  small: {
    color: colors.muted,
    fontSize: "13px",
    lineHeight: "1.6",
    margin: "0 0 16px",
  } as React.CSSProperties,

  divider: {
    borderColor: colors.border,
    margin: "24px 0",
  } as React.CSSProperties,

  stepList: {
    margin: "0 0 8px",
  } as React.CSSProperties,

  step: {
    display: "flex",
    alignItems: "flex-start",
    color: colors.body,
    fontSize: "15px",
    lineHeight: "1.6",
    margin: "0 0 14px",
  } as React.CSSProperties,

  stepNumber: {
    display: "inline-block",
    backgroundColor: colors.purple,
    color: colors.white,
    // Fixed px radius (not 50%) — Gmail renders percentage border-radius
    // inconsistently, so a circle needs an explicit half-of-dimension value.
    borderRadius: "12px",
    width: "24px",
    height: "24px",
    lineHeight: "24px",
    textAlign: "center",
    fontSize: "13px",
    fontWeight: 700,
    flexShrink: 0,
    marginRight: "12px",
    marginTop: "1px",
  } as React.CSSProperties,

  stepText: {
    flex: 1,
  } as React.CSSProperties,

  buttonWrap: {
    textAlign: "center",
    margin: "8px 0 20px",
  } as React.CSSProperties,

  button: {
    backgroundColor: colors.purple,
    color: colors.white,
    fontSize: "15px",
    fontWeight: 700,
    textDecoration: "none",
    padding: "13px 30px",
    borderRadius: "8px",
    display: "inline-block",
  } as React.CSSProperties,

  // Default notice — purple tint, purple accent bar
  notice: {
    backgroundColor: colors.purpleTint,
    borderLeft: `4px solid ${colors.purple}`,
    borderRadius: "4px",
    padding: "16px 20px",
    margin: "0 0 16px",
  } as React.CSSProperties,

  noticeText: {
    color: colors.body,
    fontSize: "14px",
    lineHeight: "1.6",
    margin: 0,
  } as React.CSSProperties,

  // Secondary/info notice — neutral grey
  infoNotice: {
    backgroundColor: "#F4F4F6",
    borderLeft: `4px solid ${colors.muted}`,
    borderRadius: "4px",
    padding: "16px 20px",
    margin: "0 0 16px",
  } as React.CSSProperties,

  link: {
    color: colors.purple,
    textDecoration: "underline",
  } as React.CSSProperties,

  signature: {
    color: colors.ink,
    fontSize: "15px",
    fontWeight: 700,
    margin: "24px 0 0",
  } as React.CSSProperties,

  // Summary / highlight box
  summaryBox: {
    backgroundColor: colors.purpleTint,
    border: `1px solid ${colors.border}`,
    borderRadius: "8px",
    padding: "16px 20px",
    margin: "0 0 8px",
  } as React.CSSProperties,

  summaryRow: {
    color: colors.ink,
    fontSize: "14px",
    lineHeight: "1.7",
    margin: 0,
  } as React.CSSProperties,

  // Rate emphasis box
  rateBox: {
    backgroundColor: colors.purpleTint,
    border: `1px solid ${colors.border}`,
    borderRadius: "8px",
    padding: "20px",
    textAlign: "center",
    margin: "0 0 16px",
  } as React.CSSProperties,

  rateLabel: {
    color: colors.muted,
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "1px",
    margin: "0 0 4px",
  } as React.CSSProperties,

  rateValue: {
    color: colors.purple,
    fontSize: "34px",
    fontWeight: 800,
    margin: 0,
  } as React.CSSProperties,

  clauseHeading: {
    color: colors.ink,
    fontSize: "14px",
    fontWeight: 700,
    margin: "0 0 2px",
  } as React.CSSProperties,

  clauseBody: {
    color: colors.body,
    fontSize: "13px",
    lineHeight: "1.6",
    margin: 0,
  } as React.CSSProperties,

  celebrate: {
    textAlign: "center",
    marginBottom: "8px",
  } as React.CSSProperties,

  celebrateEmoji: {
    fontSize: "40px",
    margin: "0 0 8px",
    lineHeight: 1,
  } as React.CSSProperties,

  h1Center: {
    fontFamily: LOGO_FONT,
    color: colors.ink,
    fontSize: "25px",
    fontWeight: 800,
    // See brand style above: kept close to neutral so the bold-Arial
    // fallback (Gmail/Outlook) doesn't read cramped.
    letterSpacing: "-0.1px",
    margin: 0,
    textAlign: "center",
  } as React.CSSProperties,
};
