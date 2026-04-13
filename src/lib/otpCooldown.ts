const COOLDOWN_SECONDS = 60;

function key(email: string, type: string) {
  return `otp-cooldown:${email}:${type}`;
}

export function startCooldown(email: string, type: string) {
  try {
    sessionStorage.setItem(key(email, type), String(Date.now()));
  } catch {
    // sessionStorage unavailable — degrade gracefully
  }
}

export function getCooldownRemaining(email: string, type: string): number {
  try {
    const stored = sessionStorage.getItem(key(email, type));
    if (!stored) return 0;
    const elapsed = (Date.now() - Number(stored)) / 1000;
    return Math.max(0, Math.ceil(COOLDOWN_SECONDS - elapsed));
  } catch {
    return 0;
  }
}

export { COOLDOWN_SECONDS };
