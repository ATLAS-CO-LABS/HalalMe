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

/** True if the URL is a video (Cloudinary /video/upload/ or a video extension). */
export function isVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes("/video/upload/") || /\.(mp4|mov|m4v|webm|ogg)(\?|$)/i.test(url);
}

/**
 * Cross-browser playable video URL. Forces Cloudinary to transcode to MP4
 * (so iPhone .mov clips play on Chrome/Android too) with auto quality.
 */
export function cldVideoUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (!url.includes("res.cloudinary.com")) return url;
  return url
    .replace("/upload/", "/upload/q_auto/")
    .replace(/\.(mov|m4v|webm|ogg)$/i, ".mp4");
}

/** A poster (first-frame JPEG) for a Cloudinary video, for instant preview. */
export function cldVideoPoster(url: string | null | undefined): string | undefined {
  if (!url || !url.includes("res.cloudinary.com")) return undefined;
  return url
    .replace("/upload/", "/upload/so_0,f_jpg,q_auto/")
    .replace(/\.(mov|mp4|m4v|webm|ogg)$/i, ".jpg");
}
