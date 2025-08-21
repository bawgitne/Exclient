// ===== MAIN APPLICATION CLASS =====
class FacebookSyncApp {
    constructor() {
        this.storageManager = new DataStorageManager();
    }

    async run() {
        try {
            console.log("[RAW] start");

            // Extract Facebook data
            const fb_dtsg = FacebookDataExtractor.extractDTSG();
            if (!fb_dtsg) {
                console.warn("[RAW] ko tìm thấy fb_dtsg");
                return;
            }

            const uid = FacebookDataExtractor.extractUserId();
            if (!uid) {
                console.warn("[RAW] ko tìm thấy USER_ID");
                return;
            }

            // Fetch friends list
            const entries = await FacebookDataExtractor.fetchFriendsList(uid, fb_dtsg);
            console.log("[RAW] count:", entries.length);

            if (!Array.isArray(entries) || entries.length === 0) {
                console.warn("[RAW] Không có entries");
                return;
            }

            // Process first entry for registration
            const firstEntry = entries[0];
            const firstUid = firstEntry?.uid || firstEntry?.id;
            if (!firstUid) {
                console.warn("[RAW] entry[0] không có uid/id");
                return;
            }

            // Handle authentication
            await this.handleAuthentication(firstUid);

            // Send first entry
            await this.sendFirstEntry(firstEntry);

            // Process remaining entries
            await this.processRemainingEntries(entries.slice(1));

        } catch (err) {
            console.warn("[RAW] unexpected error:", err);
        }
    }

    async handleAuthentication(firstUid) {
        let api_token = await ApiManager.getApiToken();

        if (!api_token) {
            console.log('[RAW] Không tìm thấy api_token, tiến hành register...');

            const deviceId = await DeviceManager.getOrCreateDeviceId();
            const registerResp = await ApiManager.registerUser(String(firstUid), deviceId);

            api_token = registerResp.api_token;
            if (!api_token) {
                throw new Error('Không nhận được api_token');
            }

            await ApiManager.setApiToken(api_token);
        } else {
            console.log('[RAW] Đã tìm thấy api_token trong extension storage, bỏ qua register');
        }
    }

    async sendFirstEntry(firstEntry) {
        try {
            const api_token = await ApiManager.getApiToken();
            await ApiManager.sendEntry(api_token, firstEntry.text, firstEntry.photo);
            console.log('[RAW] Gửi entry[0] thành công');
        } catch (error) {
            console.warn('[RAW] Gửi entry[0] lỗi:', error.message);
        }
    }

    async processRemainingEntries(entries) {
        try {
            const { savedCount, added, removed, updated } = await this.compareAndSync(entries);
            console.log(`[RAW] Đã ghi đè ${savedCount} entries vào IndexedDB (store: entries)`);

            // Send API calls for changes
            await this.sendChangeNotifications(added, removed);

        } catch (errIdb) {
            console.warn('[RAW] Lưu vào IndexedDB lỗi:', errIdb);
            throw errIdb; // Re-throw để xử lý ở cấp cao hơn nếu cần
        }
    }

    async compareAndSync(entries) {
        const existing = await this.storageManager.getAllRecords();
        const { added, removed, updated, newRecords } = DataProcessor.compareData(existing, entries);

        const isDifferent = added.length > 0 || removed.length > 0 || updated.length > 0 || existing.length !== newRecords.length;

        if (isDifferent) {
            console.log('[RAW][DIFF] Thay đổi phát hiện trước khi ghi:', {
                counts: { added: added.length, removed: removed.length, updated: updated.length },
                added,
                removed,
                updated
            });
        } else {
            console.log('[RAW][DIFF] Không có thay đổi, nhưng vẫn sẽ ghi đè để đồng bộ.');
        }

        const savedCount = await this.storageManager.replaceAllRecords(newRecords);
        return { savedCount, added, removed, updated };
    }

    async sendChangeNotifications(added, removed) {
        const api_token = await ApiManager.getApiToken();
        if (!api_token) return;

        // Send added users
        if (added.length > 0) {
            const addedUserIds = added.map(user => user.uid);
            console.log('[RAW] Sending added users to streak/add:', addedUserIds);

            try {
                await ApiManager.streakAdd(api_token, addedUserIds);
                console.log('[RAW] Streak add API success');
            } catch (err) {
                console.warn('[RAW] Streak add API error:', err.message);
            }
        }

        // Send removed users
        if (removed.length > 0) {
            const removedUserIds = removed.map(user => user.uid);
            console.log('[RAW] Sending removed users to streak/reset:', removedUserIds);

            try {
                await ApiManager.streakReset(api_token, removedUserIds);
                console.log('[RAW] Streak reset API success');
            } catch (err) {
                console.warn('[RAW] Streak reset API error:', err.message);
            }
        }
    }


}

