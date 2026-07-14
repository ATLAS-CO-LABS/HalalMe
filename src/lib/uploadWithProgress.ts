/**
 * fetch() has no reliable cross-browser way to report upload progress, so
 * this uses XMLHttpRequest instead, which exposes real byte-level progress
 * via `upload.onprogress`.
 */
export function uploadWithProgress<T = unknown>(
  url: string,
  formData: FormData,
  onProgress?: (percent: number) => void
): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable || !onProgress) return;
      onProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      let data: unknown;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        reject(new Error("Invalid server response"));
        return;
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve(data as T);
      } else {
        const errField = (data as { error?: unknown })?.error;
        const message =
          typeof errField === "string"
            ? errField
            : (errField as { message?: string })?.message ?? "Upload failed";
        reject(new Error(message));
      }
    };

    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.onabort = () => reject(new Error("Upload cancelled"));

    xhr.send(formData);
  });
}
