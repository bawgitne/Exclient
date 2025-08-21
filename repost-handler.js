// ====== Repost Handler ======
class RepostHandler {
    constructor(config = {}) {
        this.LOG_TAG = "[REPOST-HANDLER]";

        // Khởi tạo các module
        this.postIdExtractor = new PostIdExtractor();
        this.contentExtractor = new ContentExtractor();

        console.log(`${this.LOG_TAG} Initialized`);
    }

    // Xử lý khi click vào nút repost
    async handleRepostClick(buttonElement) {
        if (!buttonElement) {
            console.error(`${this.LOG_TAG} No button element provided`);
            return;
        }

        try {
            console.log(`${this.LOG_TAG} Processing repost click...`);

            // Lấy post ID
            const postId = this.postIdExtractor.extractPostId(buttonElement);

            // Lấy nội dung
            const content = this.contentExtractor.extractContent(buttonElement);
            console.log(content, postId);
            // Tạo data để gửi API
            const apiData = {
                postId: postId || null,
                content: content || ''
            };

            console.log(`${this.LOG_TAG} Created API data:`, apiData);

            // Gửi API thông qua ApiManager
            const apiToken = await ApiManager.getApiToken();
            if (!apiToken) {
                console.error(`${this.LOG_TAG} No API token found`);
                return null;
            }

            const result = await ApiManager.sendMessage('SEND_REPOST', {
                api_token: apiToken,
                ...apiData
            });

            if (result && !result.error) {
                console.log(`${this.LOG_TAG} Repost successful:`, result);
                return result;
            } else {
                console.error(`${this.LOG_TAG} Repost failed:`, result?.error);
                return null;
            }

        } catch (error) {
            console.error(`${this.LOG_TAG} Error handling repost:`, error);
            return null;
        }
    }

    // Xử lý với nội dung tùy chỉnh
    async handleRepostWithCustomContent(buttonElement, customClass) {
        if (!buttonElement) {
            console.error(`${this.LOG_TAG} No button element provided`);
            return;
        }

        try {
            console.log(`${this.LOG_TAG} Processing repost with custom content...`);

            // Lấy post ID
            const postId = this.postIdExtractor.extractPostId(buttonElement);

            // Lấy nội dung với class tùy chỉnh
            const content = this.contentExtractor.extractContentByClass(buttonElement, customClass);

            // Gửi API thông qua ApiManager
            const apiToken = await ApiManager.getApiToken();
            if (!apiToken) {
                console.error(`${this.LOG_TAG} No API token found`);
                return null;
            }

            const result = await ApiManager.sendMessage('SEND_REPOST', {
                api_token: apiToken,
                postId: postId || null,
                content: content || '',
            });

            if (result && !result.error) {
                console.log(`${this.LOG_TAG} Repost with custom content successful:`, result);
                return result;
            } else {
                console.error(`${this.LOG_TAG} Repost with custom content failed:`, result?.error);
                return null;
            }

        } catch (error) {
            console.error(`${this.LOG_TAG} Error handling repost with custom content:`, error);
            return null;
        }
    }

    // Xử lý với selector tùy chỉnh
    async handleRepostWithCustomSelector(buttonElement, selector) {
        if (!buttonElement) {
            console.error(`${this.LOG_TAG} No button element provided`);
            return;
        }

        try {
            console.log(`${this.LOG_TAG} Processing repost with custom selector...`);

            // Lấy post ID
            const postId = this.postIdExtractor.extractPostId(buttonElement);

            // Lấy nội dung với selector tùy chỉnh
            const content = this.contentExtractor.extractContentBySelector(buttonElement, selector);

            // Gửi API thông qua ApiManager
            const apiToken = await ApiManager.getApiToken();
            if (!apiToken) {
                console.error(`${this.LOG_TAG} No API token found`);
                return null;
            }

            const result = await ApiManager.sendMessage('SEND_REPOST', {
                api_token: apiToken,
                postId: postId || null,
                content: content || '',
            });

            if (result && !result.error) {
                console.log(`${this.LOG_TAG} Repost with custom selector successful:`, result);
                return result;
            } else {
                console.error(`${this.LOG_TAG} Repost with custom selector failed:`, result?.error);
                return null;
            }

        } catch (error) {
            console.error(`${this.LOG_TAG} Error handling repost with custom selector:`, error);
            return null;
        }
    }

    // Test connection
    async testConnection() {
        try {
            const apiToken = await ApiManager.getApiToken();
            if (!apiToken) {
                console.log(`${this.LOG_TAG} No API token found`);
                return false;
            }

            // Test bằng cách gửi một message đơn giản
            const result = await ApiManager.sendMessage('TEST_CONNECTION', { api_token: apiToken });
            return result && !result.error;
        } catch (error) {
            console.error(`${this.LOG_TAG} Connection test error:`, error);
            return false;
        }
    }
}

// Export để sử dụng ở file khác
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RepostHandler;
} else {
    window.RepostHandler = RepostHandler;
}
