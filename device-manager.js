// ===== DEVICE MANAGER =====
class DeviceManager {
    static async getOrCreateDeviceId() {
        try {
            const result = await chrome.storage.local.get(CONFIG.STORAGE_KEYS.DEVICE_ID);
            let deviceId = result[CONFIG.STORAGE_KEYS.DEVICE_ID];

            if (!deviceId) {
                deviceId = Utils.generateDeviceId();
                await chrome.storage.local.set({ [CONFIG.STORAGE_KEYS.DEVICE_ID]: deviceId });
                console.log('[RAW] Đã tạo và lưu device_id vào extension storage');
            } else {
                console.log('[RAW] Đã tìm thấy device_id trong extension storage');
            }
            return deviceId;
        } catch (error) {
            console.warn('[RAW] Lỗi khi xử lý device_id:', error);
            // Fallback: tạo device_id mới nếu có lỗi
            const deviceId = Utils.generateDeviceId();
            console.log('[RAW] Fallback: tạo device_id mới:', deviceId);
            return deviceId;
        }
    }
}


