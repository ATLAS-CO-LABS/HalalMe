import { Button, Heading, Section, Text } from "@react-email/components";
import { EmailLayout, styles } from "./halalTheme";

interface CharityConnectInviteEmailProps {
  charityName: string;
  onboardingUrl: string;
}

export default function CharityConnectInviteEmail({
  charityName,
  onboardingUrl,
}: CharityConnectInviteEmailProps) {
  return (
    <EmailLayout
      preview={`Set up donation payouts for ${charityName}`}
      sectionLabel="Charity payouts"
    >
      {/* Eyebrow */}
      <Section style={{ paddingBottom: "4px" }}>
        <table cellPadding={0} cellSpacing={0}>
          <tbody>
            <tr>
              <td style={{ width: "20px", height: "1px", backgroundColor: "#F59E0B", verticalAlign: "middle", fontSize: "0px" }}>&nbsp;</td>
              <td style={{ paddingLeft: "8px", verticalAlign: "middle" }}>
                <span style={styles.eyebrowText}>Almost ready to receive</span>
              </td>
            </tr>
          </tbody>
        </table>
      </Section>

      {/* Headline */}
      <Heading style={styles.h1}>
        Set up donation
        <br />
        payouts for your charity.
      </Heading>

      {/* Subheadline */}
      <Text style={styles.subhead}>
        <strong style={{ color: "#F7E7CE" }}>{charityName}</strong> is being added
        to HalalMe. Complete a short, secure setup with our payments partner{" "}
        <strong style={{ color: "#F7E7CE" }}>Stripe</strong> and donations will
        reach your bank account directly &mdash; HalalMe never holds your funds.
      </Text>

      {/* Full-width rule */}
      <div style={styles.rule}>&nbsp;</div>

      {/* CTA */}
      <Section style={styles.buttonWrap}>
        <Button style={styles.button} href={onboardingUrl}>
          Complete Payout Setup
        </Button>
      </Section>

      {/* What you'll need */}
      <Text style={styles.listHeading}>What you&apos;ll need</Text>
      <Section>
        <Text style={styles.step}>
          <span style={styles.stepNumber}>1</span>
          <span style={styles.stepText}>
            Your charity&apos;s <strong style={{ color: "#F7E7CE" }}>bank account</strong> for receiving payouts.
          </span>
        </Text>
        <Text style={styles.step}>
          <span style={styles.stepNumber}>2</span>
          <span style={styles.stepText}>
            Your <strong style={{ color: "#F7E7CE" }}>charity registration</strong> details (e.g. registered number).
          </span>
        </Text>
        <Text style={styles.step}>
          <span style={styles.stepNumber}>3</span>
          <span style={styles.stepText}>
            <strong style={{ color: "#F7E7CE" }}>ID for a trustee or director</strong> to verify the account.
          </span>
        </Text>
      </Section>

      {/* Notice: data stays with Stripe */}
      <Section style={{ ...styles.noticeBox, marginTop: "20px" }}>
        <Text style={styles.noticeText}>
          Your bank and ID details go straight to Stripe, a regulated global
          payments provider. HalalMe never sees or stores them.
        </Text>
      </Section>

      {/* Expiry + support */}
      <Text style={styles.fineprint}>
        This link expires in about <span style={{ color: "#F59E0B", fontWeight: 700 }}>24 hours</span>.
        If it stops working, reply to this email and we&apos;ll send a fresh one.
      </Text>
      <Text style={styles.fineprint}>
        Questions? Contact us at{" "}
        <a href="mailto:support@halalme.co.uk" style={styles.link}>support@halalme.co.uk</a>.
      </Text>

      <Text style={styles.signature}>The HalalMe Team</Text>
    </EmailLayout>
  );
}
