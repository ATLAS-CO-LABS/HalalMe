/**
 * Inserts Cloudinary URL transformations before the asset path.
 * Passes non-Cloudinary URLs through unchanged — safe to call on any image src.
 *
 * Example:
 *   cldUrl("https://res.cloudinary.com/.../upload/halalme/avatars/x.jpg", "f_auto,q_auto,c_fill,w_150,h_150")
 *   → "https://res.cloudinary.com/.../upload/f_auto,q_auto,c_fill,w_150,h_150/halalme/avatars/x.jpg"
 */
export function cldUrl(
  url: string | null | undefined,
  transforms = "f_auto,q_auto"
): string | undefined {
  if (!url) return undefined;
  if (!url.includes("res.cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/${transforms}/`);
}

export const CLD_AVATAR   = "f_auto,q_auto,c_fill,w_150,h_150";
export const CLD_RECIPE   = "f_auto,q_auto,c_fill,ar_16:9";
export const CLD_POST_IMG = "f_auto,q_auto";
