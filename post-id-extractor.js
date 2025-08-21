// ====== Post ID Extractor ======
class PostIdExtractor {
    constructor() {
        this.LOG_TAG = "[POST-ID-EXTRACTOR]";
    }

    // Parse JSON an toàn
    safeJSON(str) {
        try {
            return JSON.parse(str);
        } catch {
            return null;
        }
    }

    // Lấy ID từ URL
    getIdFromUrl(href) {
        if (!href) return null;

        try {
            href = new URL(href, location.href).toString();
        } catch {
            return null;
        }

        const u = new URL(href, location.href);

        // Kiểm tra permalink.php
        if (u.pathname.includes("/permalink.php")) {
            const fbid = u.searchParams.get("story_fbid") || u.searchParams.get("fbid");
            if (fbid && /^\d+$/.test(fbid)) return fbid;
        }

        // Kiểm tra /posts/
        const m = href.match(/\/posts\/(\d+)/);
        if (m) return m[1];

        // Kiểm tra multi_permalinks
        const mp = u.searchParams.get("multi_permalinks");
        if (mp && /^\d+$/.test(mp)) return mp;

        // Kiểm tra story_fbid hoặc fbid
        const fbid2 = u.searchParams.get("story_fbid") || u.searchParams.get("fbid");
        if (fbid2 && /^\d+$/.test(fbid2)) return fbid2;

        return null;
    }

    // Lấy ID từ data-ft và các thuộc tính khác
    getIdFromDataFt(el) {
        if (!el) return null;

        // Kiểm tra data-ft
        const raw = el.getAttribute?.("data-ft");
        if (raw) {
            const obj = this.safeJSON(raw);
            if (obj?.top_level_post_id && /^\d+$/.test(obj.top_level_post_id)) {
                return obj.top_level_post_id;
            }
            if (obj?.mf_story_key && /^\d+$/.test(obj.mf_story_key)) {
                return obj.mf_story_key;
            }
        }

        // Kiểm tra các thuộc tính khác
        const attrs = ["data-testid", "data-store", "data-gt"];
        for (const attr of attrs) {
            const v = el.getAttribute?.(attr);
            if (!v) continue;

            const obj = this.safeJSON(v);
            if (obj?.top_level_post_id && /^\d+$/.test(obj.top_level_post_id)) {
                return obj.top_level_post_id;
            }
            if (obj?.mf_story_key && /^\d+$/.test(obj.mf_story_key)) {
                return obj.mf_story_key;
            }
        }

        return null;
    }

    // Tìm post ID trong node
    findPostIdInNode(root) {
        if (!root) return null;

        // Thử lấy từ data-ft của root
        let id = this.getIdFromDataFt(root);
        if (id) return id;

        // Tìm trong các link
        const links = root.querySelectorAll?.(
            'a[href*="/permalink.php"], a[href*="/posts/"], a[href*="multi_permalinks="], a[href*="story_fbid="], a[href*="fbid="]'
        ) || [];

        for (const a of links) {
            const id2 = this.getIdFromUrl(a.getAttribute("href"));
            if (id2) return id2;
        }

        // Tìm trong các node có data-ft
        const ftNodes = root.querySelectorAll?.("[data-ft]") || [];
        for (const el of ftNodes) {
            const id3 = this.getIdFromDataFt(el);
            if (id3) return id3;
        }

        // Tìm trong các article
        const articles = root.querySelectorAll?.('[role="article"]') || [];
        for (const art of articles) {
            const id4 = this.getIdFromDataFt(art) || this.findPostIdInNode(art);
            if (id4) return id4;
        }

        return null;
    }

    // Lấy post ID từ button được click
    extractPostId(buttonElement) {
        if (!buttonElement) return null;

        const container = buttonElement.closest?.('[role="article"], [data-ft], [data-testid*="post"]') || document;
        const postId = this.findPostIdInNode(container);

        if (postId) {
            console.log(`${this.LOG_TAG} Found Post ID:`, postId);
        } else {
            console.log(`${this.LOG_TAG} No Post ID found`);
        }

        return postId;
    }
}

// Export để sử dụng ở file khác
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PostIdExtractor;
} else {
    window.PostIdExtractor = PostIdExtractor;
}
