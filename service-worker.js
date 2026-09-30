const CACHE_NAME = "ace-tracker-v13";
const APP_SHELL = ["/", "/index.html", "/style.css", "/script.js", "/manifest.json", "/api-config.js"];
const OPTIONAL_ASSETS = ["/assets/av-logo.png", "/assets/av-banner.png"];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(async cache => {
                // A single missing file must never abort installation.
                await Promise.allSettled(APP_SHELL.map(url => cache.add(url)));
                await Promise.allSettled(OPTIONAL_ASSETS.map(url => cache.add(url)));
            })
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys()
            .then(names => Promise.all(
                names
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    const url = new URL(event.request.url);

    // Push API calls must always reach the Node server; never cache them.
    if (
        event.request.method !== "GET" ||
        url.origin !== self.location.origin ||
        url.pathname.startsWith("/api/")
    ) {
        return;
    }

    // Network-first prevents an old cached app shell from hiding new releases.
    event.respondWith(
        fetch(event.request)
            .then(response => {
                if (response.ok) {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
                }
                return response;
            })
            .catch(async () => {
                const cached = await caches.match(event.request);
                if (cached) return cached;
                if (event.request.mode === "navigate") {
                    return caches.match("/");
                }
                return Response.error();
            })
    );
});

// =====================================================
// BACKGROUND WEB PUSH
// =====================================================
self.addEventListener("push", event => {
    event.waitUntil((async () => {
        let data = {};
        try {
            data = event.data ? event.data.json() : {};
        } catch {
            data = { message: event.data ? event.data.text() : "Don't break your streak!" };
        }

        await self.registration.showNotification(data.title || "Ace Reminder", {
            body: data.message || data.body || "Don't forget your Ace Tracker tasks.",
            icon: "/icon.png",
            badge: "/icon.png",
            tag: data.tag || "ace-tracker",
            renotify: true,
            requireInteraction: false,
            data: data.data || { url: "/" }
        });
    })());
});

self.addEventListener("notificationclick", event => {
    event.notification.close();
    const targetUrl = new URL(event.notification.data?.url || "/", self.registration.scope).href;

    event.waitUntil((async () => {
        const clientList = await clients.matchAll({
            type: "window",
            includeUncontrolled: true
        });

        for (const client of clientList) {
            if (client.url.startsWith(self.registration.scope) && "focus" in client) {
                return client.focus();
            }
        }

        return clients.openWindow(targetUrl);
    })());
});
