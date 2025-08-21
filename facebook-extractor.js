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

