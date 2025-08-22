/**
 * Service Worker - Presentation layer
 * Basic implementation for Chrome extension
 */

// Simple service worker without complex dependencies
class ServiceWorker {
    constructor() {
        console.log('[Service Worker] Initializing...');
    }

    async handleMessage(message, sender, sendResponse) {
        try {
            console.log('[Service Worker] Handling message:', message.type);

            switch (message.type) {
                case 'REGISTER_USER':
                    return await this.handleRegisterUser(message.payload);
                case 'SEND_ENTRY':
                    return await this.handleSendEntry(message.payload);
                case 'STREAK_ADD':
                    return await this.handleStreakAdd(message.payload);
                case 'STREAK_RESET':
                    return await this.handleStreakReset(message.payload);
                case 'SEND_REPOST':
                    return await this.handleSendRepost(message.payload);
                case 'TEST_CONNECTION':
                    return await this.handleTestConnection(message.payload);
                default:
                    return { error: 'Unknown message type: ' + message.type };
            }
        } catch (error) {
            console.error('[Service Worker] Error handling message:', error);
            return { error: error.message };
        }
    }

    async handleRegisterUser(payload) {
        console.log('[Service Worker] Processing user registration:', payload);
        try {
            const { fb_uid_hashed, device_id, app_version } = payload;

            // Make API call to register user
            const response = await fetch('http://localhost:8080/v1/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fb_uid_hashed,
                    device_id,
                    app_version
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                return {
                    api_token: data.data.api_token,
                    salt: data.data.salt
                };
            } else {
                throw new Error(data.error || 'Registration failed');
            }
        } catch (error) {
            console.error('[Service Worker] Registration error:', error);
            return { error: error.message };
        }
    }

    async handleSendEntry(payload) {
        console.log('[Service Worker] 🌐 Processing /update API call:', payload);
        try {
            const { api_token, name, avatar_url } = payload;
            console.log('[Service Worker] 🌐 Making request to: http://localhost:8080/v1/users/update');
            console.log('[Service Worker] 🌐 Using API token:', api_token?.substring(0, 10) + '...');

            const response = await fetch('http://localhost:8080/v1/users/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${api_token}`
                },
                body: JSON.stringify({
                    name,
                    avatar_url
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                console.log('[Service Worker] ✅ /update API call successful:', data);
                return { ok: true, data: data.data };
            } else {
                console.error('[Service Worker] ❌ /update API call failed:', data);
                throw new Error(data.error || 'Update failed');
            }
        } catch (error) {
            console.error('[Service Worker] ❌ /update API error:', error);
            return { error: error.message };
        }
    }

    async handleStreakAdd(payload) {
        console.log('[Service Worker] Processing streak add:', payload);
        try {
            const { api_token, users } = payload;

            const response = await fetch('http://localhost:8080/v1/streak/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${api_token}`
                },
                body: JSON.stringify({
                    users
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                return { ok: true, data: data.data };
            } else {
                throw new Error(data.error || 'Streak add failed');
            }
        } catch (error) {
            console.error('[Service Worker] Streak add error:', error);
            return { error: error.message };
        }
    }

    async handleStreakReset(payload) {
        console.log('[Service Worker] Processing streak reset:', payload);
        try {
            const { api_token, users } = payload;

            const response = await fetch('http://localhost:8080/v1/streak/reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${api_token}`
                },
                body: JSON.stringify({
                    users
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                return { ok: true, data: data.data };
            } else {
                throw new Error(data.error || 'Streak reset failed');
            }
        } catch (error) {
            console.error('[Service Worker] Streak reset error:', error);
            return { error: error.message };
        }
    }

    async handleSendRepost(payload) {
        console.log('[Service Worker] Processing repost:', payload);
        try {
            const { api_token, postId, content, url, userAgent, timestamp } = payload;

            const response = await fetch('http://localhost:8080/v1/repost', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${api_token}`
                },
                body: JSON.stringify({
                    postId,
                    content,
                    url,
                    userAgent,
                    timestamp
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                return { ok: true, data: data.data };
            } else {
                throw new Error(data.error || 'Repost failed');
            }
        } catch (error) {
            console.error('[Service Worker] Repost error:', error);
            return { error: error.message };
        }
    }

    async handleTestConnection(payload) {
        console.log('[Service Worker] Testing connection');
        return { ok: true, connected: true, timestamp: new Date().toISOString() };
    }

    start() {
        // Service worker lifecycle events
        self.addEventListener('install', () => {
            console.log('[Service Worker] Installed');
        });

        self.addEventListener('activate', () => {
            console.log('[Service Worker] Activated');
        });

        // Message handling
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Indicate async response
        });
    }
}

// Initialize and start service worker
const serviceWorker = new ServiceWorker();
serviceWorker.start();


