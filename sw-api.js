async function apiFetch(endpoint, { method = 'GET', token, body } = {}) {
    const url = `${CONFIG.API_BASE_URL}${endpoint}`;
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const options = { method, headers };
    if (body !== undefined) {
        options.body = JSON.stringify(body);
    }
    const resp = await fetch(url, options);
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
        throw new Error(data?.message || `HTTP ${resp.status}`);
    }
    return data;
}
