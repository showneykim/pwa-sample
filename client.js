// client.js

const server_url = 'https://1665-183-100-197-18.ngrok-free.app'

document.getElementById('register').addEventListener('click', async () => {
    const resp = await fetch(`${server_url}/generate-registration-options`);
    const opts = await resp.json();

    try {
        const attResp = await SimpleWebAuthnBrowser.startRegistration(opts);
        const verificationResp = await fetch(`${server_url}/verify-registration`, {
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
    const resp = await fetch(`${server_url}/generate-authentication-options`);
    const opts = await resp.json();

    try {
        const authResp = await SimpleWebAuthnBrowser.startAuthentication(opts);
        const verificationResp = await fetch(`${server_url}/verify-authentication`, {
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
