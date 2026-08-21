import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";
import BackLink from "@/components/ui/BackLink";

export default function LoginPage() {
  // "Continue browsing without signing in" always lands on home. The
  // `redirect` query param (read client-side by LoginForm for the
  // post-login destination) is only ever set to a page that itself requires
  // auth — that's why the user got sent here — so reusing it for this link
  // would just bounce them straight back to /login.
  const backHref = "/";

  return (
    <div className="bg-[#0A1C19] border border-[#F7E7CE]/10 p-6 sm:p-8">
      {/* Logo + heading */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-6">
          <span style={{ position: "relative", display: "inline-flex", width: 26, height: 26, flexShrink: 0 }}>
              <span style={{ position: "absolute", inset: 0, backgroundColor: "rgba(255,255,255,0.92)", borderRadius: "50%" }} />
              <Image src="/logo/logo.png" alt="HalalMe" width={26} height={26} className="object-contain relative z-10" />
            </span>
          <div className="w-px h-5 bg-[#F7E7CE]/15" />
          <span className="text-[10px] font-bold text-[#F59E0B] uppercase tracking-[0.3em]">
            Sign In
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tighter leading-[0.9] text-[#F7E7CE] mb-2">
          Welcome
          <br />
          <span className="text-[#F7E7CE]/40">Back</span>
        </h1>
        <p className="text-[#F7E7CE]/45 text-sm mt-3">
          Sign in to your HalalMe account to continue.
        </p>
      </div>

      <div className="h-px w-full bg-[#F7E7CE]/8 mb-7" />

      <Suspense fallback={
        <div className="h-48 flex items-center justify-center">
          <span className="w-5 h-5 border-2 border-[#F7E7CE]/20 border-t-[#F7E7CE]/60 rounded-full animate-spin" />
        </div>
      }>
        <LoginForm />
      </Suspense>

      <div className="mt-6 pt-5 border-t border-[#F7E7CE]/8 space-y-3">
        <p className="text-center text-xs text-[#F7E7CE]/30">
          New here?{" "}
          <Link href="/select-role" className="text-[#F7E7CE]/60 hover:text-[#F7E7CE] font-semibold transition-colors">
            Create a free account
          </Link>
        </p>
        <p className="text-center text-xs">
          <BackLink href={backHref}>Continue browsing without signing in</BackLink>
        </p>
      </div>
    </div>
  );
}
