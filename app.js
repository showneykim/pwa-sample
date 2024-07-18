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

document.getElementById('sign-btn').addEventListener('click', function () {
    // 임시로 고정된 공개키 사용 예제
    const publicKey = '클라이언트의 공개키 예시'; // 실제로는 WebAuthn 등을 통해 생성

    fetch('http://localhost:3000/sign-data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ publicKey: publicKey })
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById('signed-data').textContent = `Signed Data: ${data.signature}`;
        })
        .catch(error => {
            console.error('Error signing data:', error);
            document.getElementById('signed-data').textContent = 'Error signing data.';
        });
});
