"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import {
  cldUrl, isVideoUrl, cldVideoUrl, cldVideoPoster,
  CLD_POST_FEED, CLD_POST_TILE, CLD_POST_FULL,
} from "@/lib/cldUrl";

interface PostMediaProps {
  urls: string[];
  /** Feed cards link photos to the post; the detail page shows them full size. */
  href?: string;
  variant?: "feed" | "full";
  alt: string;
}

/**
 * A photo shown at its natural aspect ratio. The size isn't known until it
 * loads, so a placeholder holds the space meanwhile: without it the card is
 * 0px tall, then jumps open and shoves the feed down under the reader.
 */
function NaturalImage({ src, alt, maxH }: { src: string; alt: string; maxH: string }) {
  const [state, setState] = useState<"loading" | "loaded" | "error">("loading");
  return (
    <div
      className={`relative w-full flex items-center justify-center ${state === "loading" ? "min-h-64 animate-pulse" : ""}`}
      style={{ backgroundColor: state === "loading" ? "color-mix(in oklab, var(--hm-text) 5%, var(--hub-bg))" : "var(--hub-bg)" }}
    >
      {state === "error" ? (
        <div className="flex items-center gap-2 py-12 text-sm" style={{ color: "var(--hm-text-subtle)" }}>
          <ImageOff className="w-4 h-4" aria-hidden /> This photo couldn&apos;t be loaded.
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          width={0}
          height={0}
          sizes="(min-width: 896px) 896px, 100vw"
          unoptimized
          onLoad={() => setState("loaded")}
          onError={() => setState("error")}
          className={`w-full h-auto object-contain ${maxH} transition-opacity duration-200 ${state === "loaded" ? "opacity-100" : "opacity-0 absolute inset-0"}`}
        />
      )}
    </div>
  );
}

/**
 * Post photos and video.
 *
 *  - 1 photo: natural aspect ratio, capped height, never cropped.
 *  - 2-4 photos: square tiles (Cloudinary g_auto keeps the food in frame),
 *    in a grid that stays balanced at every count.
 *  - Video: inline player with a first-frame poster.
 * Images are served through Cloudinary at the size they're shown, not at the
 * original upload resolution.
 */
export default function PostMedia({ urls, href, variant = "feed", alt }: PostMediaProps) {
  if (!urls.length) return null;

  if (isVideoUrl(urls[0])) {
    return (
      <div className="w-full bg-black flex items-center justify-center">
        <video
          src={cldVideoUrl(urls[0])}
          poster={cldVideoPoster(urls[0])}
          controls
          playsInline
          preload="metadata"
          className={`w-full object-contain bg-black ${variant === "full" ? "max-h-[80vh]" : "max-h-[75vh]"}`}
        />
      </div>
    );
  }

  // `cell` lands on the grid child itself, which is where row-span has to be.
  const wrap = (node: React.ReactNode, i: number, cell = "") =>
    href ? (
      <Link
        key={i}
        href={href}
        className={`block relative ${cell} focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--hm-amber)`}
        aria-label={urls.length > 1 ? `Open post, photo ${i + 1} of ${urls.length}` : "Open post"}
      >
        {node}
      </Link>
    ) : (
      <div key={i} className={`relative ${cell}`}>{node}</div>
    );

  if (urls.length === 1 || variant === "full") {
    return (
      <div className={variant === "full" ? "space-y-1" : ""}>
        {(variant === "full" ? urls : urls.slice(0, 1)).map((u, i) =>
          wrap(
            <NaturalImage
              src={cldUrl(u, variant === "full" ? CLD_POST_FULL : CLD_POST_FEED) ?? u}
              alt={urls.length > 1 ? `${alt}, photo ${i + 1} of ${urls.length}` : alt}
              maxH={variant === "full" ? "max-h-[85vh]" : "max-h-[75vh]"}
            />,
            i,
          ),
        )}
      </div>
    );
  }

  // 2 → side by side, 3 → one tall + two stacked, 4 → 2x2.
  const grid = urls.length === 3 ? "grid-cols-2 grid-rows-2" : "grid-cols-2";
  return (
    <div className={`grid ${grid} gap-0.5`} style={{ backgroundColor: "var(--hub-bg)" }}>
      {urls.slice(0, 4).map((u, i) => {
        const tall = urls.length === 3 && i === 0;
        return wrap(
          <div className={`relative w-full ${tall ? "h-full" : "aspect-square"}`}>
            <Image
              src={cldUrl(u, CLD_POST_TILE) ?? u}
              alt={`${alt}, photo ${i + 1} of ${urls.length}`}
              fill
              unoptimized
              sizes="(min-width: 896px) 448px, 50vw"
              className="object-cover"
            />
          </div>,
          i,
          tall ? "row-span-2" : "",
        );
      })}
    </div>
  );
}
