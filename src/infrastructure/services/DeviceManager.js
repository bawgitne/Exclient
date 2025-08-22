/**
 * Device Manager - Infrastructure layer
 * Manages device ID for user identification
 */

window.DeviceManager = class DeviceManager {
    constructor() {
        this.STORAGE_KEY = window.AppConfig.STORAGE_KEYS.DEVICE_ID;
        console.log('[Device Manager] Using storage key from config:', this.STORAGE_KEY);
    }

    /**
     * Get existing device ID or create a new one
     * @returns {Promise<string>} Device ID
     */
    async getOrCreateDeviceId() {
        try {
            const result = await chrome.storage.local.get(this.STORAGE_KEY);
            let deviceId = result[this.STORAGE_KEY];

            if (!deviceId) {
                deviceId = this.generateDeviceId();
                await chrome.storage.local.set({ [this.STORAGE_KEY]: deviceId });
                console.log('[Device Manager] Created and saved new device ID to extension storage');
            } else {
                console.log('[Device Manager] Found existing device ID in extension storage');
            }

            return deviceId;
        } catch (error) {
            console.warn('[Device Manager] Error handling device ID:', error);
            // Fallback: create new device ID if there's an error
            const deviceId = this.generateDeviceId();
            console.log('[Device Manager] Fallback: created new device ID:', deviceId);
            return deviceId;
        }
    }

    /**
     * Generate a new unique device ID
     * @returns {string} Generated device ID
     */
    generateDeviceId() {
        // Generate UUID-like device ID
        const timestamp = Date.now().toString(36);
        const randomPart = Math.random().toString(36).substring(2, 15);
        const deviceId = `${timestamp}-${randomPart}`;

        console.log('[Device Manager] Generated new device ID:', deviceId);
        return deviceId;
    }

    /**
     * Get current device ID without creating a new one
     * @returns {Promise<string|null>} Device ID or null if not found
     */
    async getDeviceId() {
        try {
            const result = await chrome.storage.local.get(this.STORAGE_KEY);
            return result[this.STORAGE_KEY] || null;
        } catch (error) {
            console.warn('[Device Manager] Error getting device ID:', error);
            return null;
        }
    }

    /**
     * Set device ID manually
     * @param {string} deviceId - Device ID to set
     * @returns {Promise<boolean>} Success status
     */
    async setDeviceId(deviceId) {
        try {
            if (!deviceId) {
                throw new Error('Device ID cannot be empty');
            }

            await chrome.storage.local.set({ [this.STORAGE_KEY]: deviceId });
            console.log('[Device Manager] Device ID set successfully');
            return true;
        } catch (error) {
            console.warn('[Device Manager] Error setting device ID:', error);
            return false;
        }
    }

    /**
     * Clear device ID from storage
     * @returns {Promise<boolean>} Success status
     */
    async clearDeviceId() {
        try {
            await chrome.storage.local.remove(this.STORAGE_KEY);
            console.log('[Device Manager] Device ID cleared from storage');
            return true;
        } catch (error) {
            console.warn('[Device Manager] Error clearing device ID:', error);
            return false;
        }
    }

    /**
     * Get device info for debugging
     * @returns {Promise<object>} Device information
     */
    async getDeviceInfo() {
        try {
            const deviceId = await this.getDeviceId();
            const userAgent = navigator.userAgent;
            const platform = navigator.platform;
            const language = navigator.language;

            return {
                deviceId,
                userAgent,
                platform,
                language,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.warn('[Device Manager] Error getting device info:', error);
            return {
                deviceId: null,
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language,
                timestamp: new Date().toISOString(),
                error: error.message
            };
        }
    };
}