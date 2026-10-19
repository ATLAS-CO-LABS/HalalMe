"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { hubService } from "@/services/hubService";
import { compressImageFile } from "@/lib/resizeImage";
import { friendlyError } from "@/lib/friendlyError";
import {
  canAddMedia, inferMimeType, mediaFileError, mediaKindOf, IMAGE_UPLOAD_MAX_BYTES, type MediaKind,
} from "@/lib/socialComposer";

export type UploadStatus = "processing" | "uploading" | "done" | "error";

export interface MediaItem {
  key: string;
  kind: MediaKind;
  name: string;
  previewUrl: string;
  status: UploadStatus;
  progress: number;
  error: string | null;
  uploaded: { url: string; public_id: string } | null;
}

interface Internal {
  source: File;
  controller: AbortController | null;
}

const isAbort = (err: unknown) => err instanceof DOMException && err.name === "AbortError";

/**
 * Owns the attachments for one compose session (one post id).
 *
 * Uploads start as soon as a file is picked, so by the time someone has written
 * their caption the photos are usually already there. The post itself is only
 * inserted once every attachment has finished (see CreatePostModal), which is
 * what makes "a post with a broken or missing photo" impossible.
 *
 * Anything uploaded but never posted (removed, composer closed, page left) is
 * deleted from Cloudinary, so abandoned drafts don't pile up as orphans.
 */
export function usePostMediaUploads(postId: string) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const internals = useRef(new Map<string, Internal>());
  const itemsRef = useRef<MediaItem[]>([]);

  const patch = useCallback((key: string, changes: Partial<MediaItem>) => {
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, ...changes } : it)));
  }, []);

  useEffect(() => { itemsRef.current = items; }, [items]);

  const run = useCallback(async (key: string, kind: MediaKind) => {
    const internal = internals.current.get(key);
    if (!internal) return;
    const controller = new AbortController();
    internal.controller = controller;

    try {
      patch(key, { status: "processing", progress: 0, error: null });
      const file = kind === "image" ? await compressImageFile(internal.source) : internal.source;
      if (controller.signal.aborted) return;
      if (kind === "image" && file.size > IMAGE_UPLOAD_MAX_BYTES) {
        throw new Error("This photo is still over 10 MB after compression. Please choose a smaller one.");
      }

      patch(key, { status: "uploading" });
      const result = await hubService.uploadPostMedia(postId, file, {
        signal: controller.signal,
        onProgress: (progress) => patch(key, { progress }),
      });
      if (!internals.current.has(key)) {
        // Removed while the last bytes were in flight: don't leave it behind.
        hubService.deleteUploadedMedia([result.public_id], [result.url]);
        return;
      }
      patch(key, { status: "done", progress: 100, uploaded: { url: result.url, public_id: result.public_id } });
    } catch (err) {
      if (isAbort(err) || controller.signal.aborted) return;
      patch(key, { status: "error", error: friendlyError(err, "Upload failed. Tap retry.") });
    } finally {
      if (internal.controller === controller) internal.controller = null;
    }
  }, [patch, postId]);

  /** Validates and starts uploading. Returns a message for each refused file. */
  const addFiles = useCallback((files: FileList | File[]): string[] => {
    const rejected: string[] = [];
    const kinds = itemsRef.current.filter((i) => i.status !== "error").map((i) => i.kind);
    const added: MediaItem[] = [];

    for (const picked of Array.from(files)) {
      const type = inferMimeType(picked.name, picked.type);
      const file = type === picked.type ? picked : new File([picked], picked.name, { type, lastModified: picked.lastModified });
      const fileErr = mediaFileError(file);
      const kind = mediaKindOf(file.type);
      if (fileErr || !kind) { rejected.push(fileErr ?? "Unsupported file."); continue; }
      const fitErr = canAddMedia(kinds, kind);
      if (fitErr) { rejected.push(fitErr); continue; }

      const key = crypto.randomUUID();
      kinds.push(kind);
      internals.current.set(key, { source: file, controller: null });
      added.push({
        key, kind, name: file.name, previewUrl: URL.createObjectURL(file),
        status: "processing", progress: 0, error: null, uploaded: null,
      });
    }

    if (added.length) {
      itemsRef.current = [...itemsRef.current, ...added];
      setItems((prev) => [...prev, ...added]);
      added.forEach((it) => run(it.key, it.kind));
    }
    return [...new Set(rejected)];
  }, [run]);

  const retry = useCallback((key: string) => {
    const it = itemsRef.current.find((i) => i.key === key);
    if (it && it.status === "error") run(key, it.kind);
  }, [run]);

  // Only items still tracked in `internals` are owned by this hook. commit()
  // hands every file over to the saved post by clearing that map, so nothing
  // after it (close, unmount, a new session) can delete a published photo.
  const discard = useCallback((list: MediaItem[]) => {
    const ids: string[] = [];
    const urls: string[] = [];
    for (const it of list) {
      const internal = internals.current.get(it.key);
      if (!internal) continue;
      internal.controller?.abort();
      internals.current.delete(it.key);
      if (it.uploaded) { ids.push(it.uploaded.public_id); urls.push(it.uploaded.url); }
    }
    hubService.deleteUploadedMedia(ids, urls);
  }, []);

  const remove = useCallback((key: string) => {
    const it = itemsRef.current.find((i) => i.key === key);
    if (!it) return;
    discard([it]);
    URL.revokeObjectURL(it.previewUrl);
    itemsRef.current = itemsRef.current.filter((i) => i.key !== key);
    setItems((prev) => prev.filter((i) => i.key !== key));
  }, [discard]);

  /** Close the session: cancel and delete anything not committed to a post. */
  const discardAll = useCallback(() => {
    discard(itemsRef.current);
    itemsRef.current.forEach((it) => URL.revokeObjectURL(it.previewUrl));
    itemsRef.current = [];
    setItems([]);
  }, [discard]);

  /** The post was saved: these files now belong to it and must not be deleted. */
  const commit = useCallback(() => { internals.current.clear(); }, []);

  // Unmount (navigated away mid-compose): same as closing.
  useEffect(() => () => {
    discard(itemsRef.current);
    itemsRef.current.forEach((it) => URL.revokeObjectURL(it.previewUrl));
  }, [postId, discard]);

  const busy = items.some((i) => i.status === "processing" || i.status === "uploading");
  const failed = items.some((i) => i.status === "error");
  const uploaded = items.filter((i) => i.status === "done" && i.uploaded).map((i) => i.uploaded!);

  return { items, addFiles, retry, remove, discardAll, commit, busy, failed, uploaded };
}
