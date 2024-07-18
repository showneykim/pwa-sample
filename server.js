const express = require('express');
const fs = require('fs-extra');
const crypto = require('crypto');
const bodyParser = require('body-parser');


const app = express();
const port = 3000;

// bodyParser를 사용하여 JSON 요청을 파싱
app.use(bodyParser.json());

// 저장된 개인키를 불러옵니다.
const privateKey = fs.readFileSync('privateKey.pem', 'utf8');

// 클라이언트 공개키로 데이터를 서명하고 반환하는 API
app.post('/sign-data', (req, res) => {
    const clientPublicKey = req.body.publicKey;
    const data = 'This is the data to sign'; // 실제 애플리케이션에서는 클라이언트로부터 받을 수 있습니다.

    // 서버의 비밀키로 데이터를 서명합니다.
    const signer = crypto.createSign('sha256');
    signer.update(data);
    signer.end();
    const signature = signer.sign({
        key: privateKey,
        passphrase: 'top secret' // 개인키 암호화 시 사용했던 패스프레이즈
    }, 'base64');

    // 서명된 데이터와 함께 공개키를 반환
    res.json({
        data: data,
        signature: signature,
        publicKey: clientPublicKey // 클라이언트 공개키를 그대로 반환 (예시)
    });
});

// RSA 비대칭 키 쌍 생성
function generateAsymmetricKeys() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,  // 2048 비트 길이의 키
        publicKeyEncoding: {
            type: 'spki',      // 공개 키 표준 형식
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',     // 개인 키 표준 형식
            format: 'pem',
            cipher: 'aes-256-cbc',   // 개인 키 암호화 알고리즘
            passphrase: 'top secret' // 개인 키 암호화를 위한 패스프레이즈
        }
    });

    // 파일에 키 저장
    fs.writeFileSync('publicKey.pem', publicKey);
    fs.writeFileSync('privateKey.pem', privateKey);
    console.log('Asymmetric keys generated and saved.');
}

app.get('/generate-keys', (req, res) => {
    generateAsymmetricKeys();
    res.send('Asymmetric keys generated and saved.');
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});