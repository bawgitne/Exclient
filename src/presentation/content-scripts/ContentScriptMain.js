/**
 * Main Content Script - Presentation layer
 * Simplified version without ES modules for Chrome extension compatibility
 */

(function () {
    'use strict';

    // Prevent multiple execution
    if (window.__fbRawScriptRan) {
        return;
    }
    window.__fbRawScriptRan = true;

    console.log('[Content Script Main] Initializing Facebook extension...');

    // Initialize core components when they become available
    function initializeWhenReady() {
        // Check if all required classes are available
        if (typeof window.FacebookRepostInjector === 'undefined' ||
            typeof window.FacebookContentScript === 'undefined' ||
            typeof window.FacebookSyncApp === 'undefined') {
            console.log('[Content Script Main] Waiting for dependencies...');
            setTimeout(initializeWhenReady, 100);
            return;
        }

        try {
            // Initialize Facebook content script
            const facebookContentScript = new window.FacebookContentScript();
            console.log('[Content Script Main] Facebook content script initialized');

            // Initialize repost injector
            const repostInjector = new window.FacebookRepostInjector();
            console.log('[Content Script Main] Repost injector initialized');

            // Initialize Facebook sync app
            const syncApp = new window.FacebookSyncApp();
            console.log('[Content Script Main] Facebook sync app initialized');

            // Start sync app automatically after a delay to let page load
            setTimeout(async () => {
                try {
                    console.log('[Content Script Main] Starting Facebook sync...');
                    await syncApp.run();
                    console.log('[Content Script Main] Facebook sync completed');
                } catch (error) {
                    console.error('[Content Script Main] Facebook sync error:', error);
                }
            }, 3000); // Wait 3 seconds for page to fully load

            console.log('[Content Script Main] All components initialized successfully');

            // Store references globally for debugging
            if (window.AppConfig && window.AppConfig.ENV && window.AppConfig.ENV.enableDebug) {
                window.FacebookExtension = {
                    facebookContentScript,
                    repostInjector,
                    syncApp,
                    runSync: () => syncApp.run(),
                    testStorage: () => syncApp.testChromeStorage(),
                    debugStorage: () => syncApp.debugStorage(),
                    testTokenSave: async (token = 'test_token_' + Date.now()) => {
                        console.log('🗺 Testing token save with:', token);
                        const success = await syncApp.setApiToken(token);
                        console.log('🗺 Token save result:', success);
                        const retrieved = await syncApp.getApiToken();
                        console.log('🗺 Retrieved token:', retrieved);
                        return { saved: success, retrieved: retrieved === token };
                    },
                    restart: () => {
                        if (repostInjector && typeof repostInjector.destroy === 'function') {
                            repostInjector.destroy();
                        }
                        setTimeout(() => {
                            location.reload();
                        }, 1000);
                    }
                };
                console.log('[Content Script Main] Debug interface enabled. Use window.FacebookExtension');
                console.log('[Content Script Main] Available methods: runSync(), testStorage(), debugStorage(), testTokenSave()');
            }

        } catch (error) {
            console.error('[Content Script Main] Error initializing components:', error);
        }
    }

    // Wait for page to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeWhenReady);
    } else {
        initializeWhenReady();
    }

})();
