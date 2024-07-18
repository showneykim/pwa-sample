// client.js

document.getElementById('register').addEventListener('click', async () => {
    const resp = await fetch('http://localhost:3030/generate-registration-options');
    const opts = await resp.json();

    try {
        const attResp = await SimpleWebAuthnBrowser.startRegistration(opts);
        const verificationResp = await fetch('http://localhost:3030/verify-registration', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ attResp, opts }),
        });
        const verificationJSON = await verificationResp.json();
        if (verificationJSON.verified) {
            alert('Registration successful!');
        } else {
            alert('Registration failed!');
        }
    } catch (error) {
        console.error(error);
    }
});

document.getElementById('authenticate').addEventListener('click', async () => {
    const resp = await fetch('http://localhost:3030/generate-authentication-options');
    const opts = await resp.json();

    try {
        const authResp = await SimpleWebAuthnBrowser.startAuthentication(opts);
        const verificationResp = await fetch('http://localhost:3030/verify-authentication', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ authResp, opts }),
        });
        const verificationJSON = await verificationResp.json();
        if (verificationJSON.verified) {
            alert('Authentication successful!');
        } else {
            alert('Authentication failed!');
        }
    } catch (error) {
        console.error(error);
    }
});
