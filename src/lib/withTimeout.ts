/**
 * Thrown when withTimeout's deadline elapses before the wrapped promise settles.
 * Catching it by name lets callers distinguish a timeout from other errors.
 */
export class TimeoutError extends Error {
  constructor(ms: number) {
    super(`Request timed out after ${ms} ms`);
    this.name = "TimeoutError";
  }
}

/**
 * Races `promise` against a hard deadline.
 *
 * - If the promise settles before `ms` elapses → value is returned / error is re-thrown.
 * - If the deadline fires first → rejects with {@link TimeoutError}.
 *
 * The underlying network request is NOT cancelled by this helper — pass an
 * AbortSignal to the service call if you also need to release the connection.
 *
 * ```ts
 * const data = await withTimeout(
 *   hubService.getFeed(userId, 1, 20, "latest", signal),
 *   10_000,
 * );
 * ```
 */
export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const id = setTimeout(() => reject(new TimeoutError(ms)), ms);
    // Using .then/.catch rather than Promise.race avoids an unhandled-rejection
    // warning on the original promise if it rejects after the timeout already won.
    promise.then(
      (value) => { clearTimeout(id); resolve(value); },
      (error) => { clearTimeout(id); reject(error); },
    );
  });
}
