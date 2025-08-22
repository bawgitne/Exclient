/**
 * Application Configuration - Shared layer
 */
window.AppConfig = class AppConfig {
    static get API_BASE_URL() {
        return 'http://localhost:8080';
    }

    static get DB_NAME() {
        return 'fb_entries_db';
    }

    static get DB_VERSION() {
        return 1;
    }

    static get STORE_NAME() {
        return 'entries';
    }

    static get LOCAL_STORAGE_KEYS() {
        return {
            API_TOKEN: 'fb_api_token',
            DEVICE_ID: 'device_id',
            USER_ID: 'user_id'
        };
    }

    static get COOKIE_KEYS() {
        return {
            DEVICE_ID: 'deviceid',
            ENTRIES_REST: 'fb_entries_rest'
        };
    }

    static get APP_VERSION() {
        return '1.0.0';
    }

    static get API_ENDPOINTS() {
        return {
            REGISTER: '/v1/users/register',
            LOGIN: '/v1/users/login',
            UPDATE_PROFILE: '/v1/users/update',
            GET_USER: '/v1/users/me',
            REPOST: '/v1/repost',
            STREAK_ADD: '/v1/streak/add',
            STREAK_RESET: '/v1/streak/reset',
            HEALTH: '/v1/health'
        };
    }

    static get STORAGE_KEYS() {
        return {
            API_TOKEN: 'jwt_access_token',
            DEVICE_ID: 'device_id',
            USER_ID: 'user_id',
            LAST_SYNC: 'last_sync',
            SETTINGS: 'app_settings'
        };
    }

    static get FACEBOOK_SELECTORS() {
        return {
            POST_CONTAINER: '[role="article"]',
            POST_CONTENT: '.xdj266r.x14z9mp.x1lziwak.xzsf02u.x1a2a7pz',
            POST_ACTIONS: '.x9f619.x1ja2u2z.x78zum5.x2lah0s.x1n2onr6.x1qughib',
            MODAL_WRAPPER: '.__my_modal_wrapper__'
        };
    }

    static get TIMEOUTS() {
        return {
            API_REQUEST: 30000,
            RETRY_DELAY: 1000,
            NOTIFICATION_DURATION: 3000,
            SYNC_INTERVAL: 60000
        };
    }

    static get LIMITS() {
        return {
            MAX_CONTENT_LENGTH: 5000,
            MAX_RETRIES: 3,
            BATCH_SIZE: 50,
            MAX_FRIENDS: 5000
        };
    }

    static get ENV() {
        return {
            isDevelopment: true,
            isProduction: false,
            enableLogging: true,
            enableDebug: true
        };
    }
};

// Initialize and log config loading
console.log('[AppConfig] 🛠️ Configuration loaded successfully');
console.log('[AppConfig] 🛠️ Storage keys:', window.AppConfig.STORAGE_KEYS);
console.log('[AppConfig] 🛠️ JWT token key:', window.AppConfig.STORAGE_KEYS.API_TOKEN);
console.log('[AppConfig] 🛠️ Device ID key:', window.AppConfig.STORAGE_KEYS.DEVICE_ID);


