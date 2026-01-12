import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-purple-50 via-white to-amber-50">
      {/* Simple header with logo */}
      <header className="border-b bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto flex h-14 sm:h-16 items-center px-4 sm:px-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="bg-gradient-to-r from-purple-600 to-amber-600 bg-clip-text text-xl sm:text-2xl font-bold text-transparent">
              HalalMe
            </span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Simple footer */}
      <footer className="border-t bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 sm:py-6 text-center text-xs sm:text-sm text-gray-600">
          <p>&copy; 2025 HalalMe. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
