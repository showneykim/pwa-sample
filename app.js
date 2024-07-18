// 서비스 워커 등록 및 메시지 리스너 설정
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
        if (event.data.type === 'ACTIVATED') {
            localStorage.setItem('installTime', event.data.activationTime);
            document.getElementById('install-time').textContent = `Service Worker Activated at: ${event.data.activationTime}`;
        } else if (event.data.type === 'OFFLINE') {
            localStorage.setItem('offlineTime', event.data.offlineTime);
            document.getElementById('offline-time').textContent = `Offline since: ${event.data.offlineTime}`;
        }
    });
}

// 페이지 로드 시 저장된 시간 표시
document.addEventListener('DOMContentLoaded', () => {
    const installTime = localStorage.getItem('installTime');
    const offlineTime = localStorage.getItem('offlineTime');
    if (installTime) {
        document.getElementById('install-time').textContent = `Service Worker Activated at: ${installTime}`;
    }
    if (offlineTime) {
        document.getElementById('offline-time').textContent = `Offline since: ${offlineTime}`;
    }
});
