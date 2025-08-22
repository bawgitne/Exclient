/**
 * API Client - Infrastructure layer
 */
window.ApiClient = class ApiClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (options.body) {
            config.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            throw new Error(`API request failed: ${error.message}`);
        }
    }

    async get(endpoint, token = null) {
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return this.request(endpoint, { method: 'GET', headers });
    }

    async post(endpoint, body, token = null) {
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return this.request(endpoint, { method: 'POST', body, headers });
    }

    async put(endpoint, body, token = null) {
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return this.request(endpoint, { method: 'PUT', body, headers });
    }

    async delete(endpoint, token = null) {
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return this.request(endpoint, { method: 'DELETE', headers });
    }
};


