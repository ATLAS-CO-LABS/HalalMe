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
