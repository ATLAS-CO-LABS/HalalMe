// Central palette for redeemed profile flairs (051_redemption_schema /
// 056_matchable_icons). Single source of truth so the avatar ring, post card
// accents, and profile banner all stay visually consistent for the same flair.
export interface FlairTheme {
  name: string;
  /** Avatar ring background. */
  ring: string;
  /** Solid representative color — text/icon accents. */
  accent: string;
  /** rgba glow used on post-card hover. */
  glow: string;
  /** Post card border tint. */
  cardBorder: string;
  /** Profile banner background. */
  banner: string;
  /**
   * Texture layer painted over `banner`. A flat gradient bar reads as a
   * placeholder rather than something earned, so every flair carries its own
   * repeating pattern. Sits under a fixed sheen + fade in the profile cover.
   */
  pattern: string;
  /** Text/icon color that stays legible on top of `banner`. */
  bannerFg: string;
}

export const FLAIR_THEMES: Record<string, FlairTheme> = {
  "gold-frame": {
    name: "Gold Frame",
    ring: "linear-gradient(135deg, #FFD86B, #B8860B)",
    accent: "#FFD86B",
    glow: "rgba(255, 216, 107, 0.35)",
    cardBorder: "rgba(255, 216, 107, 0.35)",
    banner: "linear-gradient(135deg, #FFD86B, #B8860B)",
    // Fine engraved pinstripe, like a certificate border.
    pattern:
      "repeating-linear-gradient(45deg, rgba(74,44,0,0.22) 0 1px, transparent 1px 8px)",
    bannerFg: "#3B2600",
  },
  "ocean-wave": {
    name: "Ocean Wave",
    ring: "linear-gradient(135deg, #14B8A6, #0EA5E9)",
    accent: "#2DD4BF",
    glow: "rgba(20, 184, 166, 0.35)",
    cardBorder: "rgba(20, 184, 166, 0.35)",
    banner: "linear-gradient(135deg, #14B8A6, #0EA5E9)",
    // Concentric arcs reading as a ripple across the banner.
    pattern:
      "repeating-radial-gradient(circle at 18% 130%, rgba(255,255,255,0.16) 0 2px, transparent 2px 22px)",
    bannerFg: "#FFFFFF",
  },
  sunset: {
    name: "Sunset",
    ring: "linear-gradient(135deg, #F59E0B, #F03E9E 55%, #7C3AED)",
    accent: "#F03E9E",
    glow: "rgba(240, 62, 158, 0.32)",
    cardBorder: "rgba(240, 62, 158, 0.35)",
    banner: "linear-gradient(135deg, #F59E0B, #F03E9E 55%, #7C3AED)",
    // Soft grain so the three-stop gradient doesn't band.
    pattern:
      "repeating-linear-gradient(115deg, rgba(255,255,255,0.10) 0 2px, transparent 2px 9px)",
    bannerFg: "#FFFFFF",
  },
  // Deliberately understated to match its name — a thin neutral ring and a
  // near-invisible hover glow, no color pop like the other three.
  "minimal-mono": {
    name: "Minimal Mono",
    ring: "linear-gradient(135deg, #F7E7CE, #F7E7CE)",
    accent: "#F7E7CE",
    glow: "rgba(247, 231, 206, 0.16)",
    cardBorder: "rgba(247, 231, 206, 0.22)",
    banner: "linear-gradient(135deg, #3F3F3F, #17181A)",
    // Thin horizontal rules - restrained, in keeping with the name.
    pattern:
      "repeating-linear-gradient(0deg, rgba(247,231,206,0.07) 0 1px, transparent 1px 10px)",
    bannerFg: "#F7E7CE",
  },
};

export function getFlairTheme(flair?: string | null): FlairTheme | null {
  return flair ? (FLAIR_THEMES[flair] ?? null) : null;
}
