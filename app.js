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

// // 서버 ping과 오프라인 상태 감지
// setInterval(() => {
//     fetch('https://google.com')
//         .then(response => {
//             // 서버가 응답하면 온라인 상태입니다
//             console.log('Online!');
//         })
//         .catch(error => {
//             // 서버가 응답하지 않으면 오프라인 상태로 간주합니다
//             const offlineTime = new Date().toLocaleString();
//             document.getElementById('offline-time').textContent = `Offline since: ${offlineTime}`;
//             localStorage.setItem('offlineTime', offlineTime);
//             console.log('Offline!');
//         });
// }, 1000);  // 1초 간격으로 서버에 요청을 보냅니다.

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
