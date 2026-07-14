import Link from "next/link";
import Image from "next/image";
import AuthFooter from "./AuthFooter";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#102C26] relative overflow-hidden">
      {/* Subtle texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, #F7E7CE 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Header */}
      <header className="relative z-10 border-b border-[#F7E7CE]/8 bg-[#0A1C19]/60 backdrop-blur-sm">
        <div className="container mx-auto flex h-14 sm:h-16 items-center px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span style={{ position: "relative", display: "inline-flex", width: 26, height: 26, flexShrink: 0 }}>
                <span style={{ position: "absolute", inset: 0, backgroundColor: "rgba(255,255,255,0.92)", borderRadius: "50%" }} />
                <Image src="/logo/logo.png" alt="HalalMe" width={26} height={26} className="object-contain relative z-10" />
              </span>
            <span
              className="text-lg sm:text-xl font-black text-[#F7E7CE] tracking-tight"
              style={{ fontFamily: "var(--font-logo)" }}
            >
              HalalMe
            </span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex flex-1 items-start sm:items-center justify-center px-4 py-8 sm:py-12 overflow-y-auto">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer (hidden on /complete-profile) */}
      <AuthFooter />
    </div>
  );
}
