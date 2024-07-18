const CACHE_NAME = 'pwa-sample-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles/styles.css',
    '/app.js',
    '/images/logo.png'
];

// 설치 이벤트 처리
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
    event.waitUntil(self.skipWaiting()); // 설치 후 즉시 활성화
});

// 활성화 이벤트 처리
self.addEventListener('activate', (event) => {
    const activationTime = new Date().toLocaleString();
    event.waitUntil(
        clients.claim().then(() => {
            clients.matchAll({ type: 'window' }).then(clients => {
                clients.forEach(client => {
                    client.postMessage({
                        type: 'ACTIVATED',
                        activationTime
                    });
                });
            });
        })
    );
});

// fetch 이벤트 처리
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                return response || fetch(event.request);
            })
    );
});
