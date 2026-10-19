/**
 * fetch() has no reliable cross-browser way to report upload progress, so
 * this uses XMLHttpRequest instead, which exposes real byte-level progress
 * via `upload.onprogress`.
 *
 * `signal` cancels the upload mid-flight (closing the composer, removing a
 * photo). A cancelled upload rejects with an AbortError so callers can tell it
 * apart from a real failure.
 */
export function uploadWithProgress<T = unknown>(
  url: string,
  formData: FormData,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal,
): Promise<T> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Upload cancelled", "AbortError"));
      return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    const onAbort = () => xhr.abort();
    signal?.addEventListener("abort", onAbort, { once: true });
    const cleanup = () => signal?.removeEventListener("abort", onAbort);

    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable || !onProgress) return;
      // Hold at 99 until the server has answered: bytes sent is not "done",
      // Cloudinary still has to process and respond.
      onProgress(Math.min(99, Math.round((e.loaded / e.total) * 100)));
    };

    xhr.onload = () => {
      cleanup();
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

    xhr.onerror = () => { cleanup(); reject(new Error("Upload failed")); };
    xhr.onabort = () => { cleanup(); reject(new DOMException("Upload cancelled", "AbortError")); };

    xhr.send(formData);
  });
}
