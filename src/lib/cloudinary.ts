import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

export type CloudinaryResult = {
  url:       string;
  public_id: string;
};

export function uploadBuffer(
  buffer: Buffer,
  options: {
    folder:      string;
    public_id?:  string;
    overwrite?:  boolean;
    resource_type?: "image" | "video" | "raw" | "auto";
  }
): Promise<CloudinaryResult> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder:        options.folder,
        public_id:     options.public_id,
        overwrite:     options.overwrite ?? false,
        resource_type: options.resource_type ?? "image",
      },
      (err, result: UploadApiResponse | undefined) => {
        if (err || !result) return reject(err ?? new Error("Upload failed"));
        resolve({ url: result.secure_url, public_id: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

export async function deleteAssets(publicIds: string[]): Promise<void> {
  if (!publicIds.length) return;
  await cloudinary.api.delete_resources(publicIds, { resource_type: "image" });
}

export { cloudinary };
