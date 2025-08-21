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
        const key = DataProcessor.deriveStableKey(entry);
        return {
            uid: String(key),
            name: entry?.text ?? entry?.name ?? null,
            avatar_url: entry?.photo ?? entry?.profile_picture ?? entry?.pic ?? null,
            raw: entry
        };
    }

    static compareData(existing, newEntries) {
        const existingMap = new Map(existing.map(r => [r.uid, r]));
        const newRecords = (newEntries || []).map(entry => DataProcessor.toRecord(entry));
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


