// ===== STORAGE HELPER =====
class StorageHelper {
    static async get(key) {
        try {
            const result = await chrome.storage.local.get(key);
            return result[key];
        } catch (error) {
            console.warn(`[RAW] Lỗi khi lấy ${key} từ extension storage:`, error);
            return null;
        }
    }

    static async set(key, value) {
        try {
            await chrome.storage.local.set({ [key]: value });
            console.log(`[RAW] Đã lưu ${key} vào extension storage`);
        } catch (error) {
            console.warn(`[RAW] Lỗi khi lưu ${key} vào extension storage:`, error);
        }
    }

    static async remove(key) {
        try {
            await chrome.storage.local.remove(key);
            console.log(`[RAW] Đã xóa ${key} khỏi extension storage`);
        } catch (error) {
            console.warn(`[RAW] Lỗi khi xóa ${key} khỏi extension storage:`, error);
        }
    }

    static async clear() {
        try {
            await chrome.storage.local.clear();
            console.log('[RAW] Đã xóa tất cả dữ liệu khỏi extension storage');
        } catch (error) {
            console.warn('[RAW] Lỗi khi xóa extension storage:', error);
        }
    }
}
