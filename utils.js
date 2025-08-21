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


