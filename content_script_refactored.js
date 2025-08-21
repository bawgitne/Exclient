(() => {
    if (window.__fbRawScriptRan) return;
    window.__fbRawScriptRan = true;

    // ===== START APPLICATION =====
    (async () => {
        const app = new FacebookSyncApp();
        await app.run();
    })();
})();


