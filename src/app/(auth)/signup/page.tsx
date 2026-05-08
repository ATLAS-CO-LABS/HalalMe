import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import SignupForm from "@/components/auth/SignupForm";

function SignupFormFallback() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-12 bg-[#F7E7CE]/5 border border-[#F7E7CE]/8" />
      <div className="h-12 bg-[#F7E7CE]/5 border border-[#F7E7CE]/8" />
      <div className="h-12 bg-[#F7E7CE]/5 border border-[#F7E7CE]/8" />
      <div className="h-12 bg-[#F7E7CE]/5 border border-[#F7E7CE]/8" />
      <div className="h-12 bg-[#F7E7CE]/8 border border-[#F7E7CE]/15" />
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="bg-[#0A1C19] border border-[#F7E7CE]/10 p-6 sm:p-8">
      {/* Logo + heading */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-6">
          <span style={{ position: "relative", display: "inline-flex", width: 26, height: 26, flexShrink: 0 }}>
              <span style={{ position: "absolute", inset: 0, backgroundColor: "rgba(255,255,255,0.92)", borderRadius: "50%" }} />
              <Image src="/logo/logo.png" alt="HalalMe" width={26} height={26} className="object-contain relative z-10" priority />
            </span>
          <div className="w-px h-5 bg-[#F7E7CE]/15" />
          <span className="text-[10px] font-bold text-[#F59E0B] uppercase tracking-[0.3em]">
            Create Account
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tighter leading-[0.9] text-[#F7E7CE] mb-2">
          Join
          <br />
          <span className="text-[#F7E7CE]/40">HalalMe</span>
        </h1>
        <p className="text-[#F7E7CE]/45 text-sm mt-3">
          Start your halal lifestyle journey today.
        </p>
      </div>

      <div className="h-px w-full bg-[#F7E7CE]/8 mb-7" />

      <Suspense fallback={<SignupFormFallback />}>
        <SignupForm />
      </Suspense>

      <div className="mt-6 pt-5 border-t border-[#F7E7CE]/8">
        <p className="text-center text-xs text-[#F7E7CE]/30">
          Already have an account?{" "}
          <Link href="/login" className="text-[#F7E7CE]/60 hover:text-[#F7E7CE] font-semibold transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
