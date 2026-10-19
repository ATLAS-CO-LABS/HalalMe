/**
 * What each Social post type needs, as one source of truth for the composer.
 *
 * The same rules are enforced server-side by validate_post()
 * (supabase/migrations/076_social_post_validation.sql). These exist so the user
 * sees the problem before a round trip, with copy written for people rather
 * than for Postgres. If you change a limit here, change it there too.
 *
 * Pure module (no React, no path aliases) so it can be unit tested with node.
 */

export type ComposerPostType = "general" | "recipe" | "question" | "review";

export const LIMITS = {
  contentMax: 5000,
  questionMin: 10,
  questionMax: 200,
  subjectMin: 2,
  subjectMax: 120,
  reviewTextMin: 10,
  mediaMax: 4,
} as const;

export interface ComposerDraft {
  type: ComposerPostType;
  content: string;
  title: string;
  reviewSubject: string;
  rating: number;
  recipeId: string | null;
  mediaCount: number;
}

export type DraftField = "content" | "title" | "reviewSubject" | "rating" | "recipe" | "media";
export type DraftErrors = Partial<Record<DraftField, string>>;

export function validateDraft(d: ComposerDraft): DraftErrors {
  const errors: DraftErrors = {};
  const content = d.content.trim();
  const title = d.title.trim();
  const subject = d.reviewSubject.trim();

  if (d.content.length > LIMITS.contentMax) {
    errors.content = `Keep it under ${LIMITS.contentMax.toLocaleString("en-GB")} characters.`;
  }
  if (d.mediaCount > LIMITS.mediaMax) {
    errors.media = `You can add up to ${LIMITS.mediaMax} photos.`;
  }

  switch (d.type) {
    case "general":
      if (!content && d.mediaCount === 0) errors.content ??= "Write something or add a photo.";
      break;
    case "recipe":
      if (!d.recipeId) errors.recipe = "Choose a recipe to share.";
      break;
    case "question":
      if (title.length < LIMITS.questionMin) errors.title = `Your question needs at least ${LIMITS.questionMin} characters.`;
      else if (title.length > LIMITS.questionMax) errors.title = `Keep the question under ${LIMITS.questionMax} characters. Put the rest in the details.`;
      break;
    case "review":
      if (subject.length < LIMITS.subjectMin) errors.reviewSubject = "Say what you're reviewing.";
      else if (subject.length > LIMITS.subjectMax) errors.reviewSubject = `Keep this under ${LIMITS.subjectMax} characters.`;
      if (!(d.rating >= 1 && d.rating <= 5)) errors.rating = "Choose a star rating.";
      if (content.length < LIMITS.reviewTextMin) errors.content ??= `Tell people a bit more (at least ${LIMITS.reviewTextMin} characters).`;
      break;
  }
  return errors;
}

// ---------------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------------

export type MediaKind = "image" | "video";

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"] as const;
export const VIDEO_TYPES = ["video/mp4", "video/quicktime"] as const;

/** Before client-side compression. Big phone photos shrink well below this. */
export const IMAGE_SOURCE_MAX_BYTES = 25 * 1024 * 1024;
/** What actually gets uploaded. Cloudinary's per-image cap on this plan. */
export const IMAGE_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;
export const VIDEO_MAX_BYTES = 50 * 1024 * 1024;

/**
 * Some browsers (Chrome on Windows, notably) report an empty MIME type for
 * iPhone HEIC photos and sometimes for .mov clips. Fall back to the extension so
 * those aren't refused as "unsupported" when they're the most common phone
 * formats there are.
 */
export function inferMimeType(name: string, type: string): string {
  if (type) return type;
  const ext = name.toLowerCase().split(".").pop() ?? "";
  const byExt: Record<string, string> = {
    heic: "image/heic", heif: "image/heif", jpg: "image/jpeg", jpeg: "image/jpeg",
    png: "image/png", webp: "image/webp", gif: "image/gif", mov: "video/quicktime", mp4: "video/mp4",
  };
  return byExt[ext] ?? "";
}

export function mediaKindOf(type: string): MediaKind | null {
  if ((IMAGE_TYPES as readonly string[]).includes(type)) return "image";
  if ((VIDEO_TYPES as readonly string[]).includes(type)) return "video";
  return null;
}

/** Why `file` can't be attached, or null if it can. */
export function mediaFileError(file: { type: string; size: number; name?: string }): string | null {
  const kind = mediaKindOf(file.type);
  if (!kind) return `${file.name ?? "That file"} isn't supported. Use a JPEG, PNG, WebP, GIF or HEIC photo, or an MP4 or MOV video.`;
  if (file.size === 0) return `${file.name ?? "That file"} is empty.`;
  if (kind === "image" && file.size > IMAGE_SOURCE_MAX_BYTES) return `${file.name ?? "That photo"} is over 25 MB.`;
  if (kind === "video" && file.size > VIDEO_MAX_BYTES) return `${file.name ?? "That video"} is over 50 MB.`;
  return null;
}

/**
 * Whether one more item of `kind` fits alongside `existing`: up to 4 photos, or
 * a single video on its own (validate_post enforces the same).
 */
export function canAddMedia(existing: MediaKind[], kind: MediaKind): string | null {
  if (kind === "video") {
    return existing.length === 0 ? null : "A video has to be the only attachment on a post.";
  }
  if (existing.includes("video")) return "Remove the video to add photos instead.";
  if (existing.length >= LIMITS.mediaMax) return `You can add up to ${LIMITS.mediaMax} photos.`;
  return null;
}

/** Longest edge after compression. Plenty for a feed at 2x DPR. */
export const IMAGE_MAX_EDGE = 2048;

/** Target size after compression, keeping aspect ratio. */
export function fitWithin(width: number, height: number, maxEdge = IMAGE_MAX_EDGE): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= maxEdge) return { width, height };
  const ratio = maxEdge / longest;
  return { width: Math.round(width * ratio), height: Math.round(height * ratio) };
}

// ---------------------------------------------------------------------------
// Recipe share points: the copy for each get_recipe_share_status result
// ---------------------------------------------------------------------------

export type ShareStatus =
  | "eligible" | "needs_photo" | "already_rewarded" | "daily_cap"
  | "not_owner" | "unavailable" | "inactive" | "signed_out";

export interface SharePointsHint {
  tone: "earn" | "info" | "none";
  text: string;
}

export function sharePointsHint(
  status: { points: number; without_photo: ShareStatus; with_photo: ShareStatus } | null,
  hasPhoto: boolean,
): SharePointsHint {
  if (!status || status.points <= 0) return { tone: "none", text: "" };
  const s = hasPhoto ? status.with_photo : status.without_photo;
  switch (s) {
    case "eligible":
      return { tone: "earn", text: `Sharing this earns you ${status.points} points.` };
    case "needs_photo":
      return { tone: "info", text: `Add a photo of your dish to earn ${status.points} points for this AI recipe.` };
    case "already_rewarded":
      return { tone: "info", text: "You've already earned points for sharing this recipe." };
    case "daily_cap":
      return { tone: "info", text: "You've hit today's limit for recipe share points. You can still share it." };
    case "not_owner":
      return { tone: "info", text: "Points are for sharing your own recipes, but sharing this one is always welcome." };
    default:
      return { tone: "none", text: "" };
  }
}
