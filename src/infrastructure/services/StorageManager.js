/**
 * Storage Manager - Infrastructure layer
 * Manages IndexedDB storage for Facebook data
 */

window.StorageManager = class StorageManager {
    constructor() {
        this.db = null;
        this.dbName = 'FacebookExtensionDB';
        this.dbVersion = 1;
        this.storeName = 'entries';
    }

    /**
     * Open IndexedDB connection
     * @returns {Promise<IDBDatabase>} Database instance
     */
    async openDatabase() {
        if (this.db) return this.db;

        return await new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onupgradeneeded = (event) => {
                const db = request.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: 'uid' });
                    // Create indexes for better querying
                    store.createIndex('name', 'name', { unique: false });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onerror = () => {
                reject(request.error || new Error('IndexedDB open error'));
            };
        });
    }

    /**
     * Get all records from storage
     * @returns {Promise<Array>} All stored records
     */
    async getAllRecords() {
        const db = await this.openDatabase();
        return await new Promise((resolve, reject) => {
            const transaction = db.transaction(this.storeName, 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result || []);
            };

            request.onerror = () => {
                reject(request.error || new Error('IndexedDB getAll error'));
            };
        });
    }

    /**
     * Replace all records with new data
     * @param {Array} newRecords - New records to store
     * @returns {Promise<number>} Number of records saved
     */
    async replaceAllRecords(newRecords) {
        const db = await this.openDatabase();
        return await new Promise((resolve, reject) => {
            const transaction = db.transaction(this.storeName, 'readwrite');
            const store = transaction.objectStore(this.storeName);

            // Clear existing data
            const clearRequest = store.clear();

            clearRequest.onerror = () => {
                reject(clearRequest.error || new Error('IndexedDB clear error'));
            };

            clearRequest.onsuccess = () => {
                let savedCount = 0;
                let errorCount = 0;

                // Add new records
                for (const record of newRecords) {
                    const putRequest = store.put({
                        ...record,
                        timestamp: new Date().toISOString()
                    });

                    putRequest.onsuccess = () => {
                        savedCount += 1;
                    };

                    putRequest.onerror = () => {
                        errorCount += 1;
                        console.warn('[Storage Manager] Failed to save record:', record);
                    };
                }

                transaction.oncomplete = () => {
                    if (errorCount > 0) {
                        console.warn(`[Storage Manager] ${errorCount} records failed to save`);
                    }
                    resolve(savedCount);
                };

                transaction.onerror = () => {
                    reject(transaction.error || new Error('IndexedDB transaction error'));
                };

                transaction.onabort = () => {
                    reject(transaction.error || new Error('IndexedDB transaction aborted'));
                };
            };
        });
    }

    /**
     * Add a single record
     * @param {Object} record - Record to add
     * @returns {Promise<boolean>} Success status
     */
    async addRecord(record) {
        const db = await this.openDatabase();
        return await new Promise((resolve, reject) => {
            const transaction = db.transaction(this.storeName, 'readwrite');
            const store = transaction.objectStore(this.storeName);

            const request = store.put({
                ...record,
                timestamp: new Date().toISOString()
            });

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get record by UID
     * @param {string} uid - User ID
     * @returns {Promise<Object|null>} Record or null if not found
     */
    async getRecord(uid) {
        const db = await this.openDatabase();
        return await new Promise((resolve, reject) => {
            const transaction = db.transaction(this.storeName, 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(uid);

            request.onsuccess = () => {
                resolve(request.result || null);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Delete record by UID
     * @param {string} uid - User ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteRecord(uid) {
        const db = await this.openDatabase();
        return await new Promise((resolve, reject) => {
            const transaction = db.transaction(this.storeName, 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(uid);

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Clear all records
     * @returns {Promise<boolean>} Success status
     */
    async clearAllRecords() {
        const db = await this.openDatabase();
        return await new Promise((resolve, reject) => {
            const transaction = db.transaction(this.storeName, 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.clear();

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get storage statistics
     * @returns {Promise<Object>} Storage statistics
     */
    async getStats() {
        try {
            const records = await this.getAllRecords();
            return {
                totalRecords: records.length,
                lastUpdated: records.length > 0 ?
                    Math.max(...records.map(r => new Date(r.timestamp || 0).getTime())) : null,
                oldestRecord: records.length > 0 ?
                    Math.min(...records.map(r => new Date(r.timestamp || 0).getTime())) : null
            };
        } catch (error) {
            console.error('[Storage Manager] Error getting stats:', error);
            return {
                totalRecords: 0,
                lastUpdated: null,
                oldestRecord: null,
                error: error.message
            };
        }
    }

    /**
     * Close database connection
     */
    close() {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }
}