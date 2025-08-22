/**
 * Repost Entity - Core business object
 */
window.Repost = class Repost {
    constructor(postId, content, timestamp, url, userAgent, userId = null) {
        this.postId = postId;
        this.content = content;
        this.timestamp = timestamp;
        this.url = url;
        this.userAgent = userAgent;
        this.userId = userId;
        this.createdAt = new Date();
    }

    isValid() {
        return this.postId && this.url && this.timestamp;
    }

    toJSON() {
        return {
            postId: this.postId,
            content: this.content,
            timestamp: this.timestamp,
            url: this.url,
            userAgent: this.userAgent,
            userId: this.userId,
            createdAt: this.createdAt.toISOString()
        };
    }
};

