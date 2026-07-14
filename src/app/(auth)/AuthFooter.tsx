"use client";

import { usePathname } from "next/navigation";

export default function AuthFooter() {
  const pathname = usePathname();

  // Hidden on the profile-completion step to keep focus on the form.
  if (pathname === "/complete-profile") return null;

  return (
    <footer className="relative z-10 border-t border-[#F7E7CE]/8">
      <div className="container mx-auto px-4 py-4 sm:py-5 text-center text-xs text-[#F7E7CE]/25">
        <p>© {new Date().getFullYear()} HalalMe. All rights reserved.</p>
      </div>
    </footer>
  );
}
