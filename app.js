const server_url = 'https://1665-183-100-197-18.ngrok-free.app'

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

    fetch(`${server_url}/sign-data`, {
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

document.getElementById('register-btn').addEventListener('click', function () {
    if (!window.PublicKeyCredential) {
        alert("WebAuthn is not supported in this browser.");
        return;
    }

    // 서버로부터 challenge와 사용자 정보 등을 받아와야 함
    fetch(`${server_url}/webauthn/register`, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(options => {
            // options를 ArrayBuffer로 변환
            options.challenge = bufferDecode(options.challenge);
            options.user.id = bufferDecode(options.user.id);

            // WebAuthn API 호출
            return navigator.credentials.create({
                publicKey: options
            });
        })
        .then(credential => {
            // 서버에 공개키 등록
            const publicKeyCredential = {
                id: credential.id,
                type: credential.type,
                rawId: bufferEncode(credential.rawId),
                response: {
                    attestationObject: bufferEncode(credential.response.attestationObject),
                    clientDataJSON: bufferEncode(credential.response.clientDataJSON)
                }
            };

            return fetch(`${server_url}/webauthn/response`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(publicKeyCredential)
            });
        })
        .then(response => response.json())
        .then(result => {
            if (result.status === 'ok') {
                console.log('Registration successful!');
            } else {
                console.log('Registration failed:', result.message);
            }
        })
        .catch(error => {
            console.error('Error during registration:', error);
        });
});

// ArrayBuffer를 Base64 문자열로 인코딩
function bufferEncode(value) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(value)));
}

// Base64 문자열을 ArrayBuffer로 디코딩
function bufferDecode(data) {
    return Uint8Array.from(atob(data), c => c.charCodeAt(0)).buffer;
}
