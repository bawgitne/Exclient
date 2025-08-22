/**
 * User Entity - Core business object
 */
window.User = class User {
    constructor(id, deviceId, fbUidHashed, appVersion, apiToken = null, salt = null) {
        this.id = id;
        this.deviceId = deviceId;
        this.fbUidHashed = fbUidHashed;
        this.appVersion = appVersion;
        this.apiToken = apiToken;
        this.salt = salt;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    updateApiCredentials(apiToken, salt) {
        this.apiToken = apiToken;
        this.salt = salt;
        this.updatedAt = new Date();
    }

    isValid() {
        return this.deviceId && this.fbUidHashed && this.appVersion;
    }

    toJSON() {
        return {
            id: this.id,
            deviceId: this.deviceId,
            fbUidHashed: this.fbUidHashed,
            appVersion: this.appVersion,
            apiToken: this.apiToken,
            salt: this.salt,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString()
        };
    }
};

