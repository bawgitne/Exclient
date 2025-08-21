// Minimal service worker to satisfy manifest. Extend as needed.
self.addEventListener('install', () => {
    // no-op
});

self.addEventListener('activate', () => {
    // no-op
});

// Handle messages from content scripts for network requests
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    (async () => {
        try {
            if (message?.type === 'REGISTER_USER') {
                console.log("ahihihihihih");
                const { device_id, fb_uid_hashed, app_version } = message.payload || {};
                const resp = await fetch('http://localhost:8080/v1/users/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ device_id, fb_uid_hashed, app_version })
                });
                const data = await resp.json().catch(() => ({}));
                if (!resp.ok) {
                    sendResponse({ error: data?.message || `HTTP ${resp.status}` });
                    return;
                }
                // Expecting { salt, api_token }
                sendResponse({ salt: data.salt, api_token: data.api_token });
                return;
            }

            if (message?.type === 'SEND_ENTRY') {
                const { api_token, avatar_url, name } = message.payload || {};
                const resp = await fetch('http://localhost:8080/v1/users/update', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${api_token}`
                    },
                    body: JSON.stringify({ avatar_url, name })
                });
                const data = await resp.json().catch(() => ({}));
                if (!resp.ok) {
                    sendResponse({ error: data?.message || `HTTP ${resp.status}` });
                    return;
                }
                sendResponse({ ok: true, data });
                return;
            }

            if (message?.type === 'STREAK_ADD') {
                const { api_token, users } = message.payload || {};
                const resp = await fetch('http://localhost:8080/v1/streak/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${api_token}`
                    },
                    body: JSON.stringify({ users })
                });
                const data = await resp.json().catch(() => ({}));
                if (!resp.ok) {
                    sendResponse({ error: data?.message || `HTTP ${resp.status}` });
                    return;
                }
                sendResponse({ ok: true, data });
                return;
            }

            if (message?.type === 'STREAK_RESET') {
                const { api_token, users } = message.payload || {};
                const resp = await fetch('http://localhost:8080/v1/streak/reset', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${api_token}`
                    },
                    body: JSON.stringify({ users })
                });
                const data = await resp.json().catch(() => ({}));
                if (!resp.ok) {
                    sendResponse({ error: data?.message || `HTTP ${resp.status}` });
                    return;
                }
                sendResponse({ ok: true, data });
                return;
            }

            if (message?.type === 'SEND_REPOST') {
                const { api_token, postId, content, timestamp, url, userAgent } = message.payload || {};
                const resp = await fetch('http://localhost:8080/v1/repost', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${api_token}`
                    },
                    body: JSON.stringify({ postId, content, timestamp, url, userAgent })
                });
                const data = await resp.json().catch(() => ({}));
                if (!resp.ok) {
                    sendResponse({ error: data?.message || `HTTP ${resp.status}` });
                    return;
                }
                sendResponse({ ok: true, data });
                return;
            }

            if (message?.type === 'TEST_CONNECTION') {
                const { api_token } = message.payload || {};
                const resp = await fetch('http://localhost:8080/v1/health', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${api_token}`
                    }
                });
                if (!resp.ok) {
                    sendResponse({ error: `HTTP ${resp.status}` });
                    return;
                }
                sendResponse({ ok: true });
                return;
            }

            // Unknown type
            sendResponse({ error: 'unknown message type' });
        } catch (err) {
            sendResponse({ error: String(err && err.message || err) });
        }
    })();

    // Indicate async response
    return true;
});


