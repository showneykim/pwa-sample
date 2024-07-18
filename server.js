const express = require('express');
const fs = require('fs-extra');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');

const {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse
} = require('@simplewebauthn/server');
const { isoUint8Array } = require('@simplewebauthn/server/helpers');

const client_url = 'https://silly-beans-move.loca.lt'


const app = express();
const port = 3030;

// CORS 설정
app.use(cors({
    origin: client_url,
    credentials: true
}));

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

function generateRandomChallenge() {
    return 'Yi8LqGoDean_vud7p3bYh-POsUaP4x2sRLWG-60O3G0'
    // return crypto.randomBytes(32).toString('base64url');
}

app.get('/webauthn/register', (req, res) => {
    // 사용자 등록을 위한 challenge 생성 및 사용자 정보 설정
    const options = {
        challenge: generateRandomChallenge(),
        rp: { name: "Maskit Inc" },
        user: {
            id: "unique-user-id",  // 사용자를 식별하는 고유 ID
            name: "user@example.com",
            displayName: "User Example"
        },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
        timeout: 60000,
        attestation: 'direct'
    };
    console.log(JSON.stringify(options, null, 2));
    res.json(options);
});

app.post('/webauthn/response', (req, res) => {
    // 공개키 등록 로직 구현
    console.log(req.body);
    res.json({ status: 'ok', message: 'Registration successful' });
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


// --------------------------------------------------------------------------------

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// In-memory store for simplicity
let user = {
    id: 'unique-user-id',
    username: 'user@example.com',
    devices: []
};

// Registration Options Endpoint
app.get('/generate-registration-options', async (req, res) => {
    const options = await generateRegistrationOptions({
        rpName: 'Example RP',
        rpID: 'localhost',
        userID: isoUint8Array.fromUTF8String(user.id),
        userName: user.username,
    });
    req.session.challenge = options.challenge;
    console.log(`🚀 User ${JSON.stringify(user, null, 2)} is generate-registration`)
    res.json(options);
});

// Registration Verification Endpoint
app.post('/verify-registration', async (req, res) => {
    const { body } = req;
    const expectedChallenge = body.opts.challenge;

    const verification = await verifyRegistrationResponse({
        response: body.attResp,
        expectedChallenge,
        expectedOrigin: client_url,
        expectedRPID: 'localhost',
    });

    if (verification.verified) {
        // user.devices.push(verification.registrationInfo);
        user.devices.push({
            credentialID: verification.registrationInfo.credentialID,
            credentialPublicKey: verification.registrationInfo.credentialPublicKey,
            counter: verification.registrationInfo.counter,
            transports: verification.registrationInfo.transports
        });
        console.log(`🚀 User ${JSON.stringify(user, null, 2)} registered a device.`);
        res.json({ verified: true });
    } else {
        res.status(400).json({ verified: false });
    }
});

// Authentication Options Endpoint
app.get('/generate-authentication-options', async (req, res) => {
    const options = await generateAuthenticationOptions({
        rpID: 'localhost',
        userVerification: 'preferred',
    });
    req.session.challenge = options.challenge;
    console.log(`🚀 User ${JSON.stringify(user, null, 2)} is generate-authentication`)
    res.json(options);
});

// Authentication Verification Endpoint
app.post('/verify-authentication', async (req, res) => {
    const { body } = req;
    // const expectedChallenge = req.session.challenge;
    // const expectedChallenge = 'Yi8LqGoDean_vud7p3bYh-POsUaP4x2sRLWG-60O3G0'
    const expectedChallenge = body.opts.challenge;

    const verification = await verifyAuthenticationResponse({
        response: body.authResp,
        expectedChallenge,
        expectedOrigin: client_url,
        expectedRPID: 'localhost',
        authenticator: user.devices[0], // In a real scenario, match the credentialId with stored devices
    });

    if (verification.verified) {
        console.log(`🚀 User ${JSON.stringify(user, null, 2)} authenticated successfully`);
        // user.devices[0].counter = body.authenticatorData.counter || 0;
        res.json({ verified: true });
    } else {
        res.status(400).json({ verified: false });
    }
});