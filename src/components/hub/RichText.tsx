"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { tokenizeText } from "@/lib/socialLinks";
import ProfileLink from "./ProfileLink";

const subscribe = () => () => {};
const getHost = () => window.location.host;
const getServerHost = () => undefined;

interface RichTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  as?: "p" | "div";
}

const LINK_CLASS =
  "font-semibold underline decoration-1 underline-offset-[3px] decoration-[color-mix(in_oklab,var(--hm-amber)_55%,transparent)] " +
  "text-(--hm-amber) hover:decoration-(--hm-amber) hover:decoration-2 transition-[text-decoration-color] " +
  "rounded-[2px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--hm-amber) " +
  "wrap-anywhere";

/**
 * Post / comment text with working links, @mentions and preserved line breaks.
 *
 * This is the fix for links in posts not being hoverable or clickable: text was
 * previously rendered as a single string, so a URL was never an element at all.
 * Parsing and URL safety live in lib/socialLinks; this only renders.
 *
 *   - Internal HalalMe URLs (any subdomain) become <Link>, navigating in-app.
 *   - External URLs open in a new tab with rel="noopener noreferrer nofollow ugc"
 *     (no window.opener access, no referrer leak, no SEO credit for user links)
 *     and are marked with an icon so they read as leaving the site.
 *   - Long URLs show a shortened label and wrap anywhere instead of being
 *     clipped by the card's overflow.
 */
export default function RichText({ text, className = "", style, as: Tag = "p" }: RichTextProps) {
  // Same-host links (localhost, preview deploys) count as internal on the
  // client. The server render treats them as external until hydration, which
  // only differs for non-production hosts.
  const host = useSyncExternalStore(subscribe, getHost, getServerHost);
  const segments = useMemo(() => tokenizeText(text, host), [text, host]);

  if (!text) return null;

  return (
    <Tag className={`whitespace-pre-line wrap-anywhere ${className}`} style={style}>
      {segments.map((seg, i) => {
        if (seg.type === "text") return <span key={i}>{seg.value}</span>;
        if (seg.type === "mention") {
          // Same sign-in gate as every other profile link.
          return (
            <ProfileLink key={i} userId="" username={seg.username} className={LINK_CLASS}>
              {seg.value}
            </ProfileLink>
          );
        }
        if (seg.internal) {
          return (
            <Link key={i} href={seg.href} className={LINK_CLASS} title={seg.value}>
              {seg.display}
            </Link>
          );
        }
        return (
          <a
            key={i}
            href={seg.href}
            target="_blank"
            rel="noopener noreferrer nofollow ugc"
            className={LINK_CLASS}
            title={seg.value}
          >
            {seg.display}
            <ExternalLink aria-hidden className="inline-block w-3 h-3 ml-0.5 -mt-0.5 align-middle" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        );
      })}
    </Tag>
  );
}
