/**
 * Ensures a promise takes at least `ms` milliseconds to resolve.
 * Prevents loading spinners from flashing in and out too quickly
 * when an operation completes faster than the eye can register.
 */
export function minDelay<T>(promise: Promise<T>, ms = 400): Promise<T> {
  return Promise.all([
    promise,
    new Promise<void>((resolve) => setTimeout(resolve, ms)),
  ]).then(([result]) => result);
}
