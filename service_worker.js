importScripts('config.js', 'sw-api.js');

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
                const data = await apiFetch('/v1/users/register', {
                    method: 'POST',
                    body: { device_id, fb_uid_hashed, app_version }
                });
                // Expecting { salt, api_token }
                sendResponse({ salt: data.salt, api_token: data.api_token });
                return;
            }

            if (message?.type === 'SEND_ENTRY') {
                const { api_token, avatar_url, name } = message.payload || {};
                const data = await apiFetch('/v1/users/update', {
                    method: 'PUT',
                    token: api_token,
                    body: { avatar_url, name }
                });
                sendResponse({ ok: true, data });
                return;
            }

            if (message?.type === 'STREAK_ADD') {
                const { api_token, users } = message.payload || {};
                const data = await apiFetch('/v1/streak/add', {
                    method: 'POST',
                    token: api_token,
                    body: { users }
                });
                sendResponse({ ok: true, data });
                return;
            }

            if (message?.type === 'STREAK_RESET') {
                const { api_token, users } = message.payload || {};
                const data = await apiFetch('/v1/streak/reset', {
                    method: 'POST',
                    token: api_token,
                    body: { users }
                });
                sendResponse({ ok: true, data });
                return;
            }

            if (message?.type === 'SEND_REPOST') {
                const { api_token, postId, content, timestamp, url, userAgent } = message.payload || {};
                const data = await apiFetch('/v1/repost', {
                    method: 'POST',
                    token: api_token,
                    body: { postId, content, timestamp, url, userAgent }
                });
                sendResponse({ ok: true, data });
                return;
            }

            if (message?.type === 'TEST_CONNECTION') {
                const { api_token } = message.payload || {};
                await apiFetch('/v1/health', { token: api_token });
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


