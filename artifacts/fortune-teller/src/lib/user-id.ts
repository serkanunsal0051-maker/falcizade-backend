const GUEST_ID_KEY = "falcizade_guest_id";
const AUTH_KEY = "falcizade_auth";

export function getOrCreateUserId(): string {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) {
      const user = JSON.parse(raw) as { type: string; id?: string };
      if (user.type === "google" && user.id) {
        return `google_${user.id}`;
      }
    }
  } catch {
    // ignore parse errors
  }

  let guestId = localStorage.getItem(GUEST_ID_KEY);
  if (!guestId) {
    guestId = `guest_${crypto.randomUUID()}`;
    localStorage.setItem(GUEST_ID_KEY, guestId);
  }
  return guestId;
}
