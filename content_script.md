(() => {
    if (window.__fbRawScriptRan) return;
    window.__fbRawScriptRan = true;

    // ===== CONFIGURATION =====
    const CONFIG = {
        API_BASE_URL: 'http://localhost:8080',
        DB_NAME: 'fb_entries_db',
        DB_VERSION: 1,
        STORE_NAME: 'entries',
        LOCAL_STORAGE_KEYS: {
            API_TOKEN: 'fb_api_token'
        },
        COOKIE_KEYS: {
            DEVICE_ID: 'deviceid',
            ENTRIES_REST: 'fb_entries_rest'
        }
    };

    // ===== UTILITY FUNCTIONS =====
    class Utils {
        static generateDeviceId() {
            const arr = new Uint8Array(16);
            (self.crypto || window.crypto).getRandomValues(arr);
            const toHex = (n) => n.toString(16).padStart(2, '0');
            const hex = Array.from(arr, toHex).join('');
            return [
                hex.slice(0, 8),
                hex.slice(8, 12),
                hex.slice(12, 16),
                hex.slice(16, 20),
                hex.slice(20)
            ].join('-');
        }

        static getCookie(name) {
            return ((document.cookie || "").match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`)) || [])[1];
        }

        static setCookie(name, value, maxAge = 60 * 60 * 24 * 365) {
            document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`;
        }

        static cleanFacebookResponse(text) {
            return text
                .replace(/^[^{\[]*for\s*\(.*?\);\s*/i, "")    // "for (;;);"
                .replace(/^\)\]\}'\s*/i, "")                  // ")]}'"
                .replace(/^[^\[{]*/, "");                     // junk đầu dòng
        }
    }

    // ===== FACEBOOK DATA EXTRACTOR =====
    class FacebookDataExtractor {
        static extractDTSG() {
            const DTSG_capture = /"([A-Z][-_a-z0-9A-Z]{11,65}:[\d:]{11,19})"/;
            const DTSG_RE = RegExp('DTSGInitData",.{0,150}async_get_token":' + DTSG_capture.source);

            for (const s of document.querySelectorAll("script")) {
                if (/dtsg/i.test(s.textContent || "")) {
                    const m = (s.textContent || "").match(DTSG_RE);
                    if (m) return m[1];
                }
            }
            return null;
        }

        static extractUserId() {
            const cuser = Utils.getCookie('c_user');
            const bodyUID = ((/"USER_ID":"(\d+)"/.exec(document.documentElement.innerHTML) || [])[1]);
            return cuser || bodyUID;
        }

        static async fetchFriendsList(uid, fb_dtsg) {
            const url = `https://www.facebook.com/ajax/typeahead/first_degree.php?viewer=${uid}&__user=${uid}&filter[0]=user&options[0]=friends_only&__a=1&lazy=0&fb_dtsg_ag=${encodeURIComponent(fb_dtsg)}&_=${Date.now()}`;
            const res = await fetch(url, { credentials: "include" });
            let text = await res.text();
            text = Utils.cleanFacebookResponse(text);

            try {
                const json = JSON.parse(text);
                return json?.payload?.entries || [];
            } catch (e) {
                console.warn("[RAW] JSON.parse lỗi:", e);
                return [];
            }
        }
    }

    // ===== DATA STORAGE MANAGER =====
    class DataStorageManager {
        constructor() {
            this.db = null;
        }

        async openDatabase() {
            if (this.db) return this.db;

            return await new Promise((resolve, reject) => {
                const request = indexedDB.open(CONFIG.DB_NAME, CONFIG.DB_VERSION);
                request.onupgradeneeded = (event) => {
                    const db = request.result;
                    if (!db.objectStoreNames.contains(CONFIG.STORE_NAME)) {
                        db.createObjectStore(CONFIG.STORE_NAME, { keyPath: 'uid' });
                    }
                };
                request.onsuccess = () => {
                    this.db = request.result;
                    resolve(this.db);
                };
                request.onerror = () => reject(request.error || new Error('indexedDB open error'));
            });
        }

        async getAllRecords() {
            const db = await this.openDatabase();
            return await new Promise((resolve, reject) => {
                const tx = db.transaction(CONFIG.STORE_NAME, 'readonly');
                const store = tx.objectStore(CONFIG.STORE_NAME);
                const req = store.getAll();
                req.onsuccess = () => resolve(req.result || []);
                req.onerror = () => reject(req.error || new Error('indexedDB getAll error'));
            });
        }

        async replaceAllRecords(newRecords) {
            const db = await this.openDatabase();
            return await new Promise((resolve, reject) => {
                const tx = db.transaction(CONFIG.STORE_NAME, 'readwrite');
                const store = tx.objectStore(CONFIG.STORE_NAME);
                const clearReq = store.clear();
                clearReq.onerror = () => reject(clearReq.error || new Error('indexedDB clear error'));
                clearReq.onsuccess = () => {
                    let savedCount = 0;
                    for (const rec of newRecords) {
                        const putReq = store.put(rec);
                        putReq.onsuccess = () => { savedCount += 1; };
                        putReq.onerror = () => { /* ignore single item failures */ };
                    }
                    tx.oncomplete = () => resolve(savedCount);
                    tx.onerror = () => reject(tx.error || new Error('indexedDB tx error'));
                    tx.onabort = () => reject(tx.error || new Error('indexedDB tx aborted'));
                };
            });
        }
    }

    // ===== DATA PROCESSOR =====
    class DataProcessor {
        static deriveStableKey(entry) {
            const uid = entry?.uid ?? entry?.id;
            if (uid !== undefined && uid !== null) return String(uid);
            const nameOrText = entry?.text ?? entry?.name ?? '';
            const avatar = entry?.photo ?? entry?.profile_picture ?? entry?.pic ?? '';
            const fallback = `${nameOrText}|${avatar}`;
            return fallback || JSON.stringify(entry || {});
        }

        static toRecord(entry) {
            const key = this.deriveStableKey(entry);
            return {
                uid: String(key),
                name: entry?.text ?? entry?.name ?? null,
                avatar_url: entry?.photo ?? entry?.profile_picture ?? entry?.pic ?? null,
                raw: entry
            };
        }

        static compareData(existing, newEntries) {
            const existingMap = new Map(existing.map(r => [r.uid, r]));
            const newRecords = (newEntries || []).map(this.toRecord);
            const newMap = new Map(newRecords.map(r => [r.uid, r]));

            const added = [];
            const removed = [];
            const updated = [];

            // Find removed users
            for (const [uid, oldRec] of existingMap.entries()) {
                if (!newMap.has(uid)) {
                    removed.push({ uid, old: { name: oldRec.name, avatar_url: oldRec.avatar_url } });
                }
            }

            // Find added and updated users
            for (const [uid, newRec] of newMap.entries()) {
                const oldRec = existingMap.get(uid);
                if (!oldRec) {
                    added.push({ uid, new: { name: newRec.name, avatar_url: newRec.avatar_url } });
                } else if (oldRec.name !== newRec.name || oldRec.avatar_url !== newRec.avatar_url) {
                    updated.push({
                        uid,
                        from: { name: oldRec.name, avatar_url: oldRec.avatar_url },
                        to: { name: newRec.name, avatar_url: newRec.avatar_url }
                    });
                }
            }

            return { added, removed, updated, newRecords };
        }
    }

    // ===== API MANAGER =====
    class ApiManager {
        static getApiToken() {
            const token = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEYS.API_TOKEN);
            if (!token) {
                console.warn('[RAW] Không tìm thấy api_token trong localStorage');
                return null;
            }
            return token;
        }

        static setApiToken(token) {
            localStorage.setItem(CONFIG.LOCAL_STORAGE_KEYS.API_TOKEN, token);
            console.log('[RAW] Đã lưu api_token vào localStorage');
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

    // ===== DEVICE MANAGER =====
    class DeviceManager {
        static getOrCreateDeviceId() {
            let deviceId = Utils.getCookie(CONFIG.COOKIE_KEYS.DEVICE_ID);
            if (!deviceId) {
                deviceId = Utils.generateDeviceId();
                Utils.setCookie(CONFIG.COOKIE_KEYS.DEVICE_ID, deviceId);
            }
            return deviceId;
        }
    }

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
            let api_token = ApiManager.getApiToken();

            if (!api_token) {
                console.log('[RAW] Không tìm thấy api_token, tiến hành register...');

                const deviceId = DeviceManager.getOrCreateDeviceId();
                const registerResp = await ApiManager.registerUser(String(firstUid), deviceId);

                api_token = registerResp.api_token;
                if (!api_token) {
                    throw new Error('Không nhận được api_token');
                }

                ApiManager.setApiToken(api_token);
            } else {
                console.log('[RAW] Đã tìm thấy api_token trong localStorage, bỏ qua register');
            }
        }

        async sendFirstEntry(firstEntry) {
            try {
                const api_token = ApiManager.getApiToken();
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
                console.warn('[RAW] Lưu vào IndexedDB lỗi, fallback cookie:', errIdb);
                this.fallbackToCookie(entries);
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
            const api_token = ApiManager.getApiToken();
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

        fallbackToCookie(entries) {
            try {
                const entriesStr = encodeURIComponent(JSON.stringify(entries));
                Utils.setCookie(CONFIG.COOKIE_KEYS.ENTRIES_REST, entriesStr, 60 * 60 * 24 * 7);
                console.log('[RAW] Đã lưu entries còn lại vào cookie (fb_entries_rest)');
            } catch (errCookie) {
                console.warn('[RAW] Lưu entries còn lại vào cookie lỗi:', errCookie);
            }
        }
    }

    // ===== START APPLICATION =====
    (async () => {
        const app = new FacebookSyncApp();
        await app.run();
    })();
})();


