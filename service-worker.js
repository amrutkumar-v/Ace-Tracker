const CACHE_NAME = "ace-tracker-v1";

const filesToCache = [
    "index.html",
    "style.css",
    "script.js",
    "manifest.json"
];


// Install Service Worker
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            return cache.addAll(filesToCache);
        })
    );
});


// Activate Service Worker
self.addEventListener("activate", event => {
    console.log("Ace Tracker Service Worker Activated");
});


// Fetch from cache
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request)
        .then(response => {
            return response || fetch(event.request);
        })
    );
});