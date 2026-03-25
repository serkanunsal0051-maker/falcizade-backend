const SIGN_KEY = "falcizade_horoscope_sign";
const SW_PATH  = "/sw-notifications.js";

/* ── Save sign to localStorage ── */
export function saveZodiacSign(sign: string): void {
  localStorage.setItem(SIGN_KEY, sign);
}

/* ── Retrieve saved sign ── */
export function getSavedZodiacSign(): string | null {
  return localStorage.getItem(SIGN_KEY);
}

/* ── Request permission + register SW + schedule notification ── */
export async function scheduleHoroscopeNotification(): Promise<void> {
  if (!("Notification" in window)) return;
  if (!("serviceWorker" in navigator)) return;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;

  try {
    await navigator.serviceWorker.register(SW_PATH, { scope: "/" });
    const reg = await navigator.serviceWorker.ready;

    if (reg.active) {
      reg.active.postMessage({ type: "SCHEDULE_HOROSCOPE_NOTIFICATION" });
    }
  } catch (err) {
    console.warn("[horoscope-notification] SW registration failed:", err);
  }
}

/* ── Cancel scheduled notifications ── */
export async function cancelHoroscopeNotification(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.getRegistration(SW_PATH);
    if (reg?.active) {
      reg.active.postMessage({ type: "CANCEL_HOROSCOPE_NOTIFICATION" });
    }
  } catch { /* silent */ }
}
