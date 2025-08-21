// ===== API MANAGER =====
class ApiManager {
    static async getApiToken() {
        try {
            const result = await chrome.storage.local.get(CONFIG.STORAGE_KEYS.API_TOKEN);
            const token = result[CONFIG.STORAGE_KEYS.API_TOKEN];
            if (!token) {
                console.warn('[RAW] Không tìm thấy api_token trong extension storage');
                return null;
            }
            return token;
        } catch (error) {
            console.warn('[RAW] Lỗi khi lấy api_token từ extension storage:', error);
            return null;
        }
    }

    static async setApiToken(token) {
        try {
            await chrome.storage.local.set({ [CONFIG.STORAGE_KEYS.API_TOKEN]: token });
            console.log('[RAW] Đã lưu api_token vào extension storage');
        } catch (error) {
            console.warn('[RAW] Lỗi khi lưu api_token vào extension storage:', error);
        }
    }

    static async sendMessage(type, payload) {
        return await new Promise((resolve) => {
            chrome.runtime.sendMessage({ type, payload }, (response) => {
                if (chrome.runtime && chrome.runtime.lastError) {
                    resolve({ error: chrome.runtime.lastError.message });
                    return;
                }
                resolve(response);
            });
        });
    }

    static async registerUser(fb_uid_hashed, device_id) {
        const response = await this.sendMessage('REGISTER_USER', {
            fb_uid_hashed,
            device_id,
            app_version: "1.0.0"
        });

        if (!response || response.error) {
            throw new Error(response?.error || 'unknown');
        }

        return response;
    }

    static async sendEntry(api_token, name, avatar_url) {
        const response = await this.sendMessage('SEND_ENTRY', {
            api_token,
            name,
            avatar_url
        });

        if (response?.error) {
            throw new Error(response.error);
        }

        return response;
    }

    static async streakAdd(api_token, users) {
        const response = await this.sendMessage('STREAK_ADD', {
            api_token,
            users
        });

        if (response?.error) {
            throw new Error(response.error);
        }

        return response;
    }

    static async streakReset(api_token, users) {
        const response = await this.sendMessage('STREAK_RESET', {
            api_token,
            users
        });

        if (response?.error) {
            throw new Error(response.error);
        }

        return response;
    }
}


