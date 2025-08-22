/**
 * Facebook Data Extractor - Infrastructure layer
 */
window.FacebookDataExtractor = class FacebookDataExtractor {
    extractDTSG() {
        const DTSG_capture = /"([A-Z][-_a-z0-9A-Z]{11,65}:[\d:]{11,19})"/;
        const DTSG_RE = RegExp('DTSGInitData",.{0,150}async_get_token":' + DTSG_capture.source);

        for (const script of document.querySelectorAll("script")) {
            if (/dtsg/i.test(script.textContent || "")) {
                const match = (script.textContent || "").match(DTSG_RE);
                if (match) return match[1];
            }
        }
        return null;
    }

    extractUserId() {
        const cuser = window.Utils.getCookie('c_user');
        const bodyUID = ((/"USER_ID":"(\d+)"/.exec(document.documentElement.innerHTML) || [])[1]);
        return cuser || bodyUID;
    }

    async fetchFriendsList(uid, fb_dtsg) {
        const url = `https://www.facebook.com/ajax/typeahead/first_degree.php?viewer=${uid}&__user=${uid}&filter[0]=user&options[0]=friends_only&__a=1&lazy=0&fb_dtsg_ag=${encodeURIComponent(fb_dtsg)}&_=${Date.now()}`;

        try {
            const response = await fetch(url, { credentials: "include" });
            let text = await response.text();
            text = window.Utils.cleanFacebookResponse(text);

            const json = JSON.parse(text);
            return json?.payload?.entries || [];
        } catch (error) {
            console.warn("[Facebook Extractor] JSON.parse error:", error);
            return [];
        }
    }

    // Parse JSON safely
    safeJSON(str) {
        try {
            return JSON.parse(str);
        } catch {
            return null;
        }
    }

    // Extract ID from URL
    extractPostIdFromUrl(href) {
        if (!href) return null;

        try {
            href = new URL(href, location.href).toString();
        } catch {
            return null;
        }

        const u = new URL(href, location.href);

        // Check permalink.php
        if (u.pathname.includes("/permalink.php")) {
            const fbid = u.searchParams.get("story_fbid") || u.searchParams.get("fbid");
            if (fbid && /^\d+$/.test(fbid)) return fbid;
        }

        // Check /posts/
        const m = href.match(/\/posts\/(\d+)/);
        if (m) return m[1];

        // Check multi_permalinks
        const mp = u.searchParams.get("multi_permalinks");
        if (mp && /^\d+$/.test(mp)) return mp;

        // Check story_fbid or fbid
        const fbid2 = u.searchParams.get("story_fbid") || u.searchParams.get("fbid");
        if (fbid2 && /^\d+$/.test(fbid2)) return fbid2;

        return null;
    }

    // Extract ID from data-ft and other attributes
    extractPostIdFromDataFt(el) {
        if (!el) return null;

        // Check data-ft
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

        // Check other attributes
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

    // Find post ID in node recursively
    findPostIdInNode(root) {
        if (!root) return null;

        // Try to get from data-ft of root
        let id = this.extractPostIdFromDataFt(root);
        if (id) return id;

        // Find in links
        const links = root.querySelectorAll?.(
            'a[href*="/permalink.php"], a[href*="/posts/"], a[href*="multi_permalinks="], a[href*="story_fbid="], a[href*="fbid="]'
        ) || [];

        for (const a of links) {
            const id2 = this.extractPostIdFromUrl(a.getAttribute("href"));
            if (id2) return id2;
        }

        // Find in nodes with data-ft
        const ftNodes = root.querySelectorAll?.("[data-ft]") || [];
        for (const el of ftNodes) {
            const id3 = this.extractPostIdFromDataFt(el);
            if (id3) return id3;
        }

        // Find in articles
        const articles = root.querySelectorAll?.('[role="article"]') || [];
        for (const art of articles) {
            const id4 = this.extractPostIdFromDataFt(art) || this.findPostIdInNode(art);
            if (id4) return id4;
        }

        return null;
    }

    // Extract post ID from button element
    extractPostId(buttonElement) {
        if (!buttonElement) return null;

        const container = buttonElement.closest?.('[role="article"], [data-ft], [data-testid*="post"]') || document;
        const postId = this.findPostIdInNode(container);

        if (postId) {
            console.log("[Facebook Data Extractor] Found Post ID:", postId);
        } else {
            console.log("[Facebook Data Extractor] No Post ID found");
            // Retry after a short delay in case Facebook loads content dynamically
            setTimeout(() => {
                const retryId = this.findPostIdInNode(container) || this.findPostIdInNode(document);
                if (retryId) {
                    console.log("[Facebook Data Extractor] Found Post ID on retry:", retryId);
                } else {
                    console.log("[Facebook Data Extractor] No Post ID found on retry");
                }
            }, 100);
        }

        return postId;
    }
};


