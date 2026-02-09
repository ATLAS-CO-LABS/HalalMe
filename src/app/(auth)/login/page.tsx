import Image from "next/image";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="rounded-3xl border border-white/15 bg-white/[0.08] backdrop-blur-md p-6 sm:p-8 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.75)]">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#0B7A5A] to-[#065F46] ring-1 ring-white/25 shadow-lg shadow-black/20">
          <Image
            src="/logo/logo.png"
            alt="HalalMe logo"
            width={30}
            height={30}
            className="object-contain"
            priority
          />
        </div>
        <h1
          className="text-2xl sm:text-3xl font-extrabold text-white"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-white/65">
          Sign in to your HalalMe account
        </p>
      </div>
      <div className="mb-6 h-px w-full bg-white/10" />

      <LoginForm />
    </div>
  );
}
