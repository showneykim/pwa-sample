if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch((error) => {
                console.error('Service Worker registration failed:', error);
            });
    });

    navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'INSTALL') {
            localStorage.setItem('installTime', event.data.installTime);
            document.getElementById('install-time').textContent = `Service Worker Installed at: ${event.data.installTime}`;
        } else if (event.data.type === 'OFFLINE') {
            localStorage.setItem('offlineTime', event.data.offlineTime);
            document.getElementById('offline-time').textContent = `Offline since: ${event.data.offlineTime}`;
        }
    });
}

window.addEventListener('offline', () => {
    if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'OFFLINE_TIME' });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const installTime = localStorage.getItem('installTime');
    const offlineTime = localStorage.getItem('offlineTime');
    if (installTime) {
        document.getElementById('install-time').textContent = `Service Worker Installed at: ${installTime}`;
    }
    if (offlineTime) {
        document.getElementById('offline-time').textContent = `Offline since: ${offlineTime}`;
    }
});
