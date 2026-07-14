import Link from "next/link";
import { CheckCircle2, AlertCircle } from "lucide-react";

// Public landing page Stripe redirects the charity back to after (or during)
// onboarding. We don't know their final status here — the account.updated
// webhook is the source of truth — so we just acknowledge and reassure.
export default async function CharityOnboardingReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const hasError = Boolean(error);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F7E7CE]/30 px-4">
      <div className="max-w-md w-full bg-white border border-[#102C26]/12 rounded-none px-8 py-10 text-center">
        {hasError ? (
          <>
            <AlertCircle size={44} className="mx-auto text-amber-500" />
            <h1 className="mt-4 text-xl font-bold text-[#102C26]">
              Something went wrong
            </h1>
            <p className="mt-3 text-sm text-[#102C26]/70 leading-relaxed">
              We couldn&apos;t open your payout setup. The link may have expired.
              Please reply to the email we sent you and we&apos;ll send a fresh
              one, or contact us at{" "}
              <a href="mailto:support@halalme.co.uk" className="underline font-medium">
                support@halalme.co.uk
              </a>
              .
            </p>
          </>
        ) : (
          <>
            <CheckCircle2 size={44} className="mx-auto text-[#102C26]" />
            <h1 className="mt-4 text-xl font-bold text-[#102C26]">
              Thank you — details received
            </h1>
            <p className="mt-3 text-sm text-[#102C26]/70 leading-relaxed">
              We&apos;ve received your payout setup. Stripe is verifying your
              details now — this usually takes a few minutes but can take longer.
              Once approved, your charity will start receiving donations on
              HalalMe automatically. We&apos;ll be in touch if anything else is
              needed.
            </p>
          </>
        )}

        <Link
          href="/"
          className="inline-block mt-7 px-6 py-3 text-sm font-bold uppercase tracking-wide text-[#F7E7CE] bg-[#102C26] rounded-none hover:bg-[#102C26]/90 transition-colors"
        >
          Back to HalalMe
        </Link>
      </div>
    </main>
  );
}
