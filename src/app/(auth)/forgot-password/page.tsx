import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-sm p-6 sm:p-8 shadow-2xl">
      <div className="mb-6 text-center">
        <h1
          className="text-2xl sm:text-3xl font-extrabold text-white"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          Reset password
        </h1>
        <p className="mt-2 text-sm text-emerald-200/60">
          Enter your email to receive a reset link
        </p>
      </div>

      <ForgotPasswordForm />
    </div>
  );
}
