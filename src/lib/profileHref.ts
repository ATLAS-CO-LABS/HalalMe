/**
 * Builds the URL for a user's public profile page (`/social/u/[handle]`).
 *
 * The route accepts either a username or a raw user id as `[handle]` — the
 * username is preferred (cleaner, shareable URL) but not every caller has it
 * on hand (e.g. a comment author whose `profiles.username` came back null),
 * so this always falls back to the id rather than being unable to link at
 * all. `validateUsername` (see complete-profile) only allows lowercase
 * letters/numbers/underscores, so a username can never collide with a UUID.
 */
export function profileHref(userId: string, username?: string | null): string {
  return `/social/u/${username || userId}`;
}
