/**
 * Data Processor - Infrastructure layer
 * Processes and compares Facebook friends data
 */
window.DataProcessor = class DataProcessor {
    /**
     * Derive a stable key from entry data
     * @param {Object} entry - Facebook entry data
     * @returns {string} Stable key for the entry
     */
    static deriveStableKey(entry) {
        // Try to get UID first
        const uid = entry?.uid ?? entry?.id;
        if (uid !== undefined && uid !== null) {
            return String(uid);
        }

        // Fallback to name and avatar combination
        const nameOrText = entry?.text ?? entry?.name ?? '';
        const avatar = entry?.photo ?? entry?.profile_picture ?? entry?.pic ?? '';
        const fallback = `${nameOrText}|${avatar}`;

        // Last resort: stringify the entire entry
        return fallback || JSON.stringify(entry || {});
    }

    /**
     * Convert Facebook entry to standardized record format
     * @param {Object} entry - Facebook entry data
     * @returns {Object} Standardized record
     */
    static toRecord(entry) {
        const key = window.DataProcessor.deriveStableKey(entry);

        return {
            uid: String(key),
            name: entry?.text ?? entry?.name ?? null,
            avatar_url: entry?.photo ?? entry?.profile_picture ?? entry?.pic ?? null,
            raw: entry,
            processed_at: new Date().toISOString()
        };
    }

    /**
     * Compare existing data with new entries to find changes
     * @param {Array} existing - Existing records from storage
     * @param {Array} newEntries - New Facebook entries
     * @returns {Object} Comparison result with added, removed, updated users and new records
     */
    static compareData(existing, newEntries) {
        // Create maps for efficient lookup
        const existingMap = new Map(existing.map(record => [record.uid, record]));
        const newRecords = (newEntries || []).map(entry => window.DataProcessor.toRecord(entry));
        const newMap = new Map(newRecords.map(record => [record.uid, record]));

        const added = [];
        const removed = [];
        const updated = [];

        // Find removed users (exist in old but not in new)
        for (const [uid, oldRecord] of existingMap.entries()) {
            if (!newMap.has(uid)) {
                removed.push({
                    uid,
                    old: {
                        name: oldRecord.name,
                        avatar_url: oldRecord.avatar_url
                    }
                });
            }
        }

        // Find added and updated users
        for (const [uid, newRecord] of newMap.entries()) {
            const oldRecord = existingMap.get(uid);

            if (!oldRecord) {
                // New user
                added.push({
                    uid,
                    new: {
                        name: newRecord.name,
                        avatar_url: newRecord.avatar_url
                    }
                });
            } else {
                // Check for updates
                const nameChanged = oldRecord.name !== newRecord.name;
                const avatarChanged = oldRecord.avatar_url !== newRecord.avatar_url;

                if (nameChanged || avatarChanged) {
                    updated.push({
                        uid,
                        from: {
                            name: oldRecord.name,
                            avatar_url: oldRecord.avatar_url
                        },
                        to: {
                            name: newRecord.name,
                            avatar_url: newRecord.avatar_url
                        },
                        changes: {
                            name: nameChanged,
                            avatar: avatarChanged
                        }
                    });
                }
            }
        }

        return {
            added,
            removed,
            updated,
            newRecords,
            summary: {
                total_new: newRecords.length,
                total_existing: existing.length,
                added_count: added.length,
                removed_count: removed.length,
                updated_count: updated.length,
                unchanged_count: newRecords.length - added.length - updated.length
            }
        };
    }

    /**
     * Validate Facebook entry data
     * @param {Object} entry - Facebook entry to validate
     * @returns {Object} Validation result
     */
    static validateEntry(entry) {
        const errors = [];
        const warnings = [];

        if (!entry) {
            errors.push('Entry is null or undefined');
            return { valid: false, errors, warnings };
        }

        // Check for required fields
        const uid = entry.uid ?? entry.id;
        if (uid === undefined || uid === null) {
            warnings.push('Entry missing UID/ID field');
        }

        const name = entry.text ?? entry.name;
        if (!name || typeof name !== 'string') {
            warnings.push('Entry missing or invalid name field');
        }

        const avatar = entry.photo ?? entry.profile_picture ?? entry.pic;
        if (!avatar || typeof avatar !== 'string') {
            warnings.push('Entry missing or invalid avatar field');
        }

        // Check for suspicious data
        if (name && name.length > 100) {
            warnings.push('Name field unusually long');
        }

        if (avatar && !avatar.startsWith('http')) {
            warnings.push('Avatar URL does not start with http');
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Filter and clean Facebook entries
     * @param {Array} entries - Raw Facebook entries
     * @returns {Array} Cleaned and filtered entries
     */
    static filterAndCleanEntries(entries) {
        if (!Array.isArray(entries)) {
            console.warn('[Data Processor] Entries is not an array:', typeof entries);
            return [];
        }

        const cleaned = [];
        const rejected = [];

        for (const entry of entries) {
            const validation = window.DataProcessor.validateEntry(entry);

            if (validation.valid || validation.warnings.length === 0) {
                // Clean the entry
                const cleanedEntry = {
                    uid: entry.uid ?? entry.id,
                    text: entry.text ?? entry.name,
                    photo: entry.photo ?? entry.profile_picture ?? entry.pic,
                    // Preserve original data
                    _original: entry
                };

                cleaned.push(cleanedEntry);
            } else {
                rejected.push({
                    entry,
                    reason: validation.errors.join(', ') || validation.warnings.join(', ')
                });
            }
        }

        if (rejected.length > 0) {
            console.warn(`[Data Processor] Rejected ${rejected.length} invalid entries`);
        }

        return cleaned;
    }

    /**
     * Generate statistics for data changes
     * @param {Object} comparison - Result from compareData method
     * @returns {Object} Detailed statistics
     */
    static generateChangeStats(comparison) {
        const { added, removed, updated, summary } = comparison;

        return {
            summary,
            details: {
                new_friends: added.map(item => item.uid),
                removed_friends: removed.map(item => item.uid),
                updated_friends: updated.map(item => ({
                    uid: item.uid,
                    changes: item.changes
                }))
            },
            timestamp: new Date().toISOString()
        };
    }
}