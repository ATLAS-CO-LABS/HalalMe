import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

export type CloudinaryResult = {
  url:           string;
  public_id:     string;
  resource_type: string;
  format:        string | null;
};

export function uploadBuffer(
  buffer: Buffer,
  options: {
    folder:      string;
    public_id?:  string;
    overwrite?:  boolean;
    resource_type?: "image" | "video" | "raw" | "auto";
    /** "authenticated" stores the asset privately — delivery requires a signed URL. */
    type?: "upload" | "authenticated";
  }
): Promise<CloudinaryResult> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder:        options.folder,
        public_id:     options.public_id,
        overwrite:     options.overwrite ?? false,
        resource_type: options.resource_type ?? "image",
        type:          options.type ?? "upload",
      },
      (err, result: UploadApiResponse | undefined) => {
        if (err || !result) return reject(err ?? new Error("Upload failed"));
        resolve({
          url:           result.secure_url,
          public_id:     result.public_id,
          resource_type: result.resource_type,
          format:        result.format ?? null,
        });
      }
    );
    stream.end(buffer);
  });
}

/**
 * Short-lived signed URL for a PRIVATE (authenticated) asset — e.g. a merchant
 * compliance document. Generate only on the server behind an auth check; never
 * expose api_secret or these URLs in client bundles. Default expiry: 5 minutes.
 */
export function signedDocUrl(
  publicId: string,
  resourceType: "image" | "raw",
  format?: string | null,
  ttlSeconds = 300
): string {
  return cloudinary.url(publicId, {
    type:          "authenticated",
    resource_type: resourceType,
    // Including the format gives the delivery URL a real extension (.pdf/.jpg),
    // so it opens inline with a proper filename instead of an unnamed download.
    ...(format ? { format } : {}),
    sign_url:      true,
    secure:        true,
    expires_at:    Math.floor(Date.now() / 1000) + ttlSeconds,
  });
}

export async function deleteAssets(
  publicIds: string[],
  options: {
    resource_type?: "image" | "video" | "raw";
    type?: "upload" | "authenticated";
  } = {}
): Promise<void> {
  if (!publicIds.length) return;
  await cloudinary.api.delete_resources(publicIds, {
    resource_type: options.resource_type ?? "image",
    type:          options.type ?? "upload",
  });
}

export { cloudinary };
