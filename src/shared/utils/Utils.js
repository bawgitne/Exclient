/**
 * Utility Functions - Shared layer
 */
window.Utils = class Utils {
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

    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    static isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function () {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    static sanitizeText(text) {
        if (typeof text !== 'string') return '';
        return text
            .replace(/[<>"']/g, '') // Remove potentially dangerous characters
            .trim();
    }

    static formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static isObject(item) {
        return (item && typeof item === 'object' && !Array.isArray(item));
    }

    static deepMerge(target, ...sources) {
        if (!sources.length) return target;
        const source = sources.shift();

        if (Utils.isObject(target) && Utils.isObject(source)) {
            for (const key in source) {
                if (Utils.isObject(source[key])) {
                    if (!target[key]) Object.assign(target, { [key]: {} });
                    Utils.deepMerge(target[key], source[key]);
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }

        return Utils.deepMerge(target, ...sources);
    }

    static hash(str) {
        let hash = 0;
        if (str.length === 0) return hash;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }
};


