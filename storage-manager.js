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

