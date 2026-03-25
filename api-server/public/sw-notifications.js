/* Falcızade — Daily Horoscope Notification Service Worker */

const MESSAGES = [
  "Bugün yıldızlar senin için önemli bir mesaj veriyor.",
  "Bugünkü burç yorumun seni şaşırtabilir.",
  "Bugün aşk ve para konusunda dikkat etmen gereken bir şey var.",
];

let scheduledTimer = null;

function msUntilNextNineAM() {
  const now = new Date();
  const next = new Date();
  next.setHours(9, 0, 0, 0);
  if (now >= next) {
    next.setDate(next.getDate() + 1);
  }
  return next.getTime() - now.getTime();
}

function scheduleNext() {
  if (scheduledTimer !== null) {
    clearTimeout(scheduledTimer);
    scheduledTimer = null;
  }

  const delay = msUntilNextNineAM();

  scheduledTimer = setTimeout(() => {
    scheduledTimer = null;
    const body = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];

    self.registration
      .showNotification("Günlük Burcun Hazır 🔮", {
        body,
        icon: "/favicon.svg",
        badge: "/favicon.svg",
        tag: "daily-horoscope",
        requireInteraction: false,
        data: { url: "/burc" },
      })
      .catch(() => {});

    scheduleNext();
  }, delay);
}

/* ── Message from main thread ── */
self.addEventListener("message", (event) => {
  if (event.data?.type === "SCHEDULE_HOROSCOPE_NOTIFICATION") {
    scheduleNext();
  }
  if (event.data?.type === "CANCEL_HOROSCOPE_NOTIFICATION") {
    if (scheduledTimer !== null) {
      clearTimeout(scheduledTimer);
      scheduledTimer = null;
    }
  }
});

/* ── Notification tap → open /burc ── */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/burc";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

/* ── Activate immediately, skip waiting ── */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});
