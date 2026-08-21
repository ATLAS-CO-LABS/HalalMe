"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const linkClass =
  "inline-flex items-center gap-1.5 text-xs text-[#F7E7CE]/25 hover:text-[#F7E7CE]/50 transition-colors";

type BackLinkProps = { children: React.ReactNode } & (
  | { href: string; onClick?: never }
  | { href?: never; onClick: () => void }
);

export default function BackLink({ children, href, onClick }: BackLinkProps) {
  if (href) {
    return (
      <Link href={href} className={linkClass}>
        <ArrowLeft className="w-3 h-3" />
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={linkClass}>
      <ArrowLeft className="w-3 h-3" />
      {children}
    </button>
  );
}
