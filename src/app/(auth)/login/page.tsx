import Image from "next/image";
import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="bg-[#0A1C19] border border-[#F7E7CE]/10 p-6 sm:p-8">
      {/* Logo + heading */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-6">
          <Image src="/logo/logo.png" alt="HalalMe" width={28} height={28} className="object-contain" />
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

      <LoginForm />

      <div className="mt-6 pt-5 border-t border-[#F7E7CE]/8">
        <p className="text-center text-xs text-[#F7E7CE]/30">
          New here?{" "}
          <Link href="/select-role" className="text-[#F7E7CE]/60 hover:text-[#F7E7CE] font-semibold transition-colors">
            Create a free account
          </Link>
        </p>
      </div>
    </div>
  );
}
