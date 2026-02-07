import { Suspense } from "react";
import SignupForm from "@/components/auth/SignupForm";

function SignupFormFallback() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 bg-white/10 rounded-xl" />
      <div className="h-10 bg-white/10 rounded-xl" />
      <div className="h-10 bg-white/10 rounded-xl" />
      <div className="h-10 bg-white/10 rounded-xl" />
      <div className="h-12 bg-white/10 rounded-xl" />
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-sm p-6 sm:p-8 shadow-2xl">
      <div className="mb-6 text-center">
        <h1
          className="text-2xl sm:text-3xl font-extrabold text-white"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          Create an account
        </h1>
        <p className="mt-2 text-sm text-emerald-200/60">
          Join HalalMe and start your halal lifestyle journey
        </p>
      </div>

      <Suspense fallback={<SignupFormFallback />}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
