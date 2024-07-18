const CACHE_NAME = 'pwa-sample-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles/styles.css',
    '/app.js'
    // '/images/logo.png'  // Uncomment if you use the image
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache);
        })
    );
    const installTime = new Date().toLocaleString();
    self.skipWaiting();
    event.waitUntil(
        self.clients.claim().then(() => {
            return clients.matchAll({ type: 'window' }).then((clients) => {
                clients.forEach((client) => {
                    client.postMessage({ type: 'INSTALL', installTime });
                });
            });
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener('message', (event) => {
    if (event.data.type === 'OFFLINE_TIME') {
        const offlineTime = new Date().toLocaleString();
        event.waitUntil(
            self.clients.claim().then(() => {
                return clients.matchAll({ type: 'window' }).then((clients) => {
                    clients.forEach((client) => {
                        client.postMessage({ type: 'OFFLINE', offlineTime });
                    });
                });
            })
        );
    }
});
