import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-sm p-6 sm:p-8 shadow-2xl">
      <div className="mb-6 text-center">
        <h1
          className="text-2xl sm:text-3xl font-extrabold text-white"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-emerald-200/60">
          Sign in to your HalalMe account
        </p>
      </div>

      <LoginForm />
    </div>
  );
}
