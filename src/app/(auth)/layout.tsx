import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 relative overflow-hidden">
      {/* Lightweight ambient background - radial gradients instead of blur orbs */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 80% 5%, rgba(16,185,129,0.15) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 10% 95%, rgba(245,158,11,0.08) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-white/5">
        <div className="container mx-auto flex h-14 sm:h-16 items-center px-4 sm:px-6">
          <Link href="/" className="flex items-center space-x-2">
            <span
              className="text-xl sm:text-2xl font-bold text-white"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Halal<span className="text-amber-400">Me</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex flex-1 items-start sm:items-center justify-center px-4 py-6 sm:py-12 overflow-y-auto">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-white/5">
        <div className="container mx-auto px-4 py-4 sm:py-6 text-center text-xs sm:text-sm text-emerald-200/60">
          <p>&copy; 2025 HalalMe. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
