import { fitWithin, IMAGE_MAX_EDGE } from "./socialComposer";

const DECODE_TIMEOUT_MS = 10_000;

function withDeadline<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label} timed out`)), ms);
    p.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
  });
}

async function decode(file: File): Promise<{ source: CanvasImageSource; width: number; height: number; close: () => void }> {
  // createImageBitmap honours EXIF orientation and decodes off the main thread
  // where supported; the <img> path is the fallback for older Safari.
  if (typeof createImageBitmap === "function") {
    const bmp = await withDeadline(createImageBitmap(file, { imageOrientation: "from-image" }), DECODE_TIMEOUT_MS, "Image decode");
    return { source: bmp, width: bmp.width, height: bmp.height, close: () => bmp.close() };
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await withDeadline(new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new window.Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Failed to load image"));
      el.src = url;
    }), DECODE_TIMEOUT_MS, "Image load");
    return { source: img, width: img.naturalWidth, height: img.naturalHeight, close: () => URL.revokeObjectURL(url) };
  } catch (err) {
    URL.revokeObjectURL(url);
    throw err;
  }
}

/**
 * Prepares a photo for a Social post upload: scales it so the long edge is at
 * most 2048px and re-encodes it as JPEG.
 *
 * Re-encoding through a canvas also drops EXIF metadata, which on phone photos
 * includes GPS coordinates of where the picture was taken. That is a privacy
 * win for a public feed, not just a size one.
 *
 * Returns the original file untouched when it can't or shouldn't be re-encoded:
 * GIFs (would lose animation), or formats this browser can't decode (HEIC
 * outside Safari, which Cloudinary converts on delivery instead).
 */
export async function compressImageFile(file: File, maxEdge = IMAGE_MAX_EDGE, quality = 0.85): Promise<File> {
  if (file.type === "image/gif") return file;

  let decoded: Awaited<ReturnType<typeof decode>>;
  try {
    decoded = await decode(file);
  } catch {
    return file;
  }

  try {
    const target = fitWithin(decoded.width, decoded.height, maxEdge);

    const canvas = document.createElement("canvas");
    canvas.width = target.width;
    canvas.height = target.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    // JPEG has no alpha; paint white under transparent PNGs instead of black.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, target.width, target.height);
    ctx.drawImage(decoded.source, 0, 0, target.width, target.height);

    const blob = await withDeadline(
      new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality)),
      DECODE_TIMEOUT_MS,
      "Image encode",
    );
    if (!blob) return file;
    // Kept even when it isn't smaller: it is the copy without location metadata.

    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg", lastModified: Date.now() });
  } finally {
    decoded.close();
  }
}

/**
 * Resize an image to fit within max dimensions, keeping aspect ratio.
 * Returns base64 data URL at JPEG quality 0.8.
 */
export async function resizeImage(
  file: File,
  maxWidth = 1024,
  maxHeight = 1024,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Could not get canvas context"));
      return;
    }

    const reader = new FileReader();
    const timeout = setTimeout(() => {
      reject(new Error("Image resize timed out"));
    }, 10000);

    reader.onload = (e) => {
      const img = new window.Image();

      const imgTimeout = setTimeout(() => {
        clearTimeout(timeout);
        reject(new Error("Image load timed out"));
      }, 10000);

      img.onload = () => {
        clearTimeout(imgTimeout);
        clearTimeout(timeout);
        try {
          let { width, height } = img;
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.8));
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => {
        clearTimeout(imgTimeout);
        clearTimeout(timeout);
        reject(new Error("Failed to load image"));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      clearTimeout(timeout);
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}
