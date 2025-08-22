/**
 * Facebook Sync App - Application layer
 * Converted to window object for Chrome extension compatibility
 */
window.FacebookSyncApp = class FacebookSyncApp {
    constructor() {
        // Initialize only essential services for data extraction and storage
        this.facebookExtractor = new window.FacebookDataExtractor();
        this.storageManager = new window.StorageManager();
        this.deviceManager = new window.DeviceManager();

        console.log('[Facebook Sync App] Initialized with messaging pattern');
    }

    async run() {
        try {
            console.log("[Facebook Sync App] Starting sync process...");
            console.log("[Facebook Sync App] Flow: 1. Register user → get access token → auto /update → 2. Fetch friends data → 3. Compare with IndexedDB → 4. Send differences via API");

            // Test Chrome storage functionality first
            const storageWorking = await this.testChromeStorage();
            if (!storageWorking) {
                console.error('[Facebook Sync App] ❌ Chrome storage not working properly!');
                return;
            }

            // Debug storage state
            await this.debugStorage();

            // Extract Facebook data
            const fb_dtsg = this.facebookExtractor.extractDTSG();
            console.log(fb_dtsg)
            if (!fb_dtsg) {
                console.warn("[Facebook Sync App] DTSG not found");
                return;
            }

            const uid = this.facebookExtractor.extractUserId();
            console.log(uid)
            if (!uid) {
                console.warn("[Facebook Sync App] User ID not found");
                return;
            }

            // Fetch friends list
            const entries = await this.facebookExtractor.fetchFriendsList(uid, fb_dtsg);
            console.log("[Facebook Sync App] Friends count:", entries.length);

            if (!Array.isArray(entries) || entries.length === 0) {
                console.warn("[Facebook Sync App] No entries found");
                return;
            }

            // Filter and clean entries
            const cleanedEntries = window.DataProcessor.filterAndCleanEntries(entries);
            if (cleanedEntries.length === 0) {
                console.warn("[Facebook Sync App] No valid entries after filtering");
                return;
            }

            // Process entries
            await this.processEntries(cleanedEntries);

        } catch (error) {
            console.error("[Facebook Sync App] Unexpected error:", error);
        }
    }

    async processEntries(entries) {
        try {
            // Process first entry for registration
            const firstEntry = entries[0];
            if (firstEntry) {
                await this.processFirstEntry(firstEntry);
            }

            // Process remaining entries for sync
            if (entries.length > 1) {
                await this.processRemainingEntries(entries.slice(1));
            } else {
                // If only one entry, still sync it
                await this.processRemainingEntries([firstEntry]);
            }
        } catch (error) {
            console.error("[Facebook Sync App] Error processing entries:", error);
        }
    }

    async processFirstEntry(entry) {
        try {
            const firstUid = entry?.uid || entry?.id;
            if (!firstUid) {
                console.warn("[Facebook Sync App] First entry missing UID");
                return;
            }

            // Step 1: Handle authentication (register and get access token)
            // This will also automatically call /update
            await this.handleAuthentication(firstUid);

            console.log('[Facebook Sync App] First entry processed - registration and update completed');
        } catch (error) {
            console.error("[Facebook Sync App] Error processing first entry:", error);
        }
    }

    async handleAuthentication(uid) {
        try {
            let apiToken = await this.getApiToken();

            if (!apiToken) {
                console.log('[Facebook Sync App] No API token found, proceeding with registration...');

                const deviceId = await this.deviceManager.getOrCreateDeviceId();
                const registerResult = await this.registerUser(String(uid), deviceId);

                apiToken = registerResult.api_token;
                if (!apiToken) {
                    throw new Error('Failed to receive API token from registration');
                }

                console.log('[Facebook Sync App] 🔑 Received API token from registration:', apiToken.substring(0, 15) + '...');

                const saveSuccess = await this.setApiToken(apiToken);
                if (saveSuccess) {
                    console.log('[Facebook Sync App] ✅ Registration successful, API token saved to Chrome local storage');
                    console.log('[Facebook Sync App] ✅ Token will be reused in future sessions');
                } else {
                    console.error('[Facebook Sync App] ❌ Failed to save API token to storage');
                    // Continue anyway, token is still in memory
                }

                // Automatically call /update with the new access token  
                console.log('[Facebook Sync App] 🔄 Automatically calling /update API after registration...');
                await this.updateUserProfile(apiToken);
            } else {
                console.log('[Facebook Sync App] ✅ Found existing API token in storage, skipping registration');
                console.log('[Facebook Sync App] 🔄 Automatically calling /update API with existing token...');
                await this.updateUserProfile(apiToken);
            }
        } catch (error) {
            console.error('[Facebook Sync App] Authentication error:', error);
            throw error;
        }
    }

    async updateUserProfile(apiToken, userData = null) {
        try {
            console.log('[Facebook Sync App] 🌐 Calling /update API endpoint with access token...');
            console.log('[Facebook Sync App] 🌐 API endpoint: http://localhost:8080/v1/users/update');

            // Use provided userData or default values
            const profileData = userData || {
                name: 'Facebook User',
                avatar_url: null
            };

            const result = await this.sendMessage('SEND_ENTRY', {
                api_token: apiToken,
                name: profileData.name,
                avatar_url: profileData.avatar_url
            });

            if (result && !result.error) {
                console.log('[Facebook Sync App] ✅ /update API call successful - user profile updated');
                console.log('[Facebook Sync App] ✅ Automatic /update execution completed');
            } else {
                console.warn('[Facebook Sync App] ❌ /update API call failed:', result?.error);
            }
        } catch (error) {
            console.error('[Facebook Sync App] Error calling /update API:', error);
        }
    }

    async sendFirstEntry(entry) {
        try {
            const apiToken = await this.getApiToken();
            if (!apiToken) {
                console.warn('[Facebook Sync App] No API token available for sending first entry');
                return;
            }

            // Send user profile update
            const result = await this.sendMessage('SEND_ENTRY', {
                api_token: apiToken,
                name: entry.text || entry.name,
                avatar_url: entry.photo || entry.profile_picture || entry.pic
            });

            if (result && !result.error) {
                console.log('[Facebook Sync App] First entry sent successfully');
            } else {
                console.warn('[Facebook Sync App] Failed to send first entry:', result?.error);
            }
        } catch (error) {
            console.error('[Facebook Sync App] Error sending first entry:', error);
        }
    }

    async processRemainingEntries(entries) {
        try {
            // Step 2: Compare fetched friends data with IndexedDB to find differences
            const { savedCount, added, removed } = await this.compareAndSync(entries);
            console.log(`[Facebook Sync App] Saved ${savedCount} entries to IndexedDB`);

            // Step 3: Send differences to server via API endpoints
            await this.sendChangeNotifications(added, removed);

        } catch (error) {
            console.error('[Facebook Sync App] Error processing remaining entries:', error);
            throw error;
        }
    }

    async compareAndSync(entries) {
        const existing = await this.storageManager.getAllRecords();
        const comparison = window.DataProcessor.compareData(existing, entries);
        const { added, removed, updated, newRecords } = comparison;

        const isDifferent = added.length > 0 || removed.length > 0 || updated.length > 0 || existing.length !== newRecords.length;

        if (isDifferent) {
            console.log('[Facebook Sync App] Changes detected:', {
                counts: {
                    added: added.length,
                    removed: removed.length,
                    updated: updated.length
                },
                added: added.slice(0, 5), // Show first 5 for debugging
                removed: removed.slice(0, 5),
                updated: updated.slice(0, 5)
            });
        } else {
            console.log('[Facebook Sync App] No changes detected, but will sync for consistency.');
        }

        const savedCount = await this.storageManager.replaceAllRecords(newRecords);
        return { savedCount, added, removed, updated };
    }

    async sendChangeNotifications(added, removed) {
        const apiToken = await this.getApiToken();
        if (!apiToken) {
            console.warn('[Facebook Sync App] No API token for change notifications');
            return;
        }

        // Send added users
        if (added.length > 0) {
            const addedUserIds = added.map(user => user.uid);
            console.log('[Facebook Sync App] Sending added users to streak/add:', addedUserIds.slice(0, 10));

            try {
                const result = await this.sendMessage('STREAK_ADD', {
                    api_token: apiToken,
                    users: addedUserIds
                });

                if (result && !result.error) {
                    console.log('[Facebook Sync App] Streak add API success');
                } else {
                    console.warn('[Facebook Sync App] Streak add API error:', result?.error);
                }
            } catch (error) {
                console.error('[Facebook Sync App] Streak add API error:', error);
            }
        }

        // Send removed users
        if (removed.length > 0) {
            const removedUserIds = removed.map(user => user.uid);
            console.log('[Facebook Sync App] Sending removed users to streak/reset:', removedUserIds.slice(0, 10));

            try {
                const result = await this.sendMessage('STREAK_RESET', {
                    api_token: apiToken,
                    users: removedUserIds
                });

                if (result && !result.error) {
                    console.log('[Facebook Sync App] Streak reset API success');
                } else {
                    console.warn('[Facebook Sync App] Streak reset API error:', result?.error);
                }
            } catch (error) {
                console.error('[Facebook Sync App] Streak reset API error:', error);
            }
        }
    }

    // Helper methods for API communication
    async sendMessage(type, payload) {
        return await new Promise((resolve) => {
            chrome.runtime.sendMessage({ type, payload }, (response) => {
                if (chrome.runtime && chrome.runtime.lastError) {
                    resolve({ error: chrome.runtime.lastError.message });
                    return;
                }
                resolve(response);
            });
        });
    }

    async registerUser(fbUidHashed, deviceId) {
        const response = await this.sendMessage('REGISTER_USER', {
            fb_uid_hashed: fbUidHashed,
            device_id: deviceId,
            app_version: "1.0.0"
        });

        if (!response || response.error) {
            throw new Error(response?.error || 'Registration failed');
        }

        return response;
    }

    async getApiToken() {
        try {
            // Ensure AppConfig is loaded
            if (!window.AppConfig || !window.AppConfig.STORAGE_KEYS) {
                console.warn('[Facebook Sync App] ⚠️ AppConfig not loaded, using fallback key');
                const fallbackKey = 'jwt_access_token';
                const result = await chrome.storage.local.get(fallbackKey);
                const token = result[fallbackKey] || null;
                console.log('[Facebook Sync App] 📂 Using fallback key:', fallbackKey);
                return token;
            }

            const tokenKey = window.AppConfig.STORAGE_KEYS.API_TOKEN;
            console.log('[Facebook Sync App] 📂 Using storage key from config:', tokenKey);

            // Check chrome.storage permissions
            if (!chrome.storage || !chrome.storage.local) {
                throw new Error('Chrome storage API not available');
            }

            const result = await chrome.storage.local.get(tokenKey);
            const token = result[tokenKey] || null;

            if (token) {
                console.log('[Facebook Sync App] 📂 Retrieved JWT token from Chrome local storage:', token.substring(0, 10) + '...');
                console.log('[Facebook Sync App] 📂 JWT token is available for reuse');
            } else {
                console.log('[Facebook Sync App] 📂 No JWT token found in Chrome local storage');
                console.log('[Facebook Sync App] 📂 Storage key used:', tokenKey);
            }
            return token;
        } catch (error) {
            console.error('[Facebook Sync App] ❌ Critical error getting JWT token:', error);
            console.error('[Facebook Sync App] ❌ Error details:', error.message);
            return null;
        }
    }

    async setApiToken(token) {
        try {
            // Validate token
            if (!token || typeof token !== 'string') {
                throw new Error('Invalid token provided: ' + typeof token);
            }

            // Ensure AppConfig is loaded
            let tokenKey;
            if (!window.AppConfig || !window.AppConfig.STORAGE_KEYS) {
                console.warn('[Facebook Sync App] ⚠️ AppConfig not loaded, using fallback key');
                tokenKey = 'jwt_access_token';
            } else {
                tokenKey = window.AppConfig.STORAGE_KEYS.API_TOKEN;
            }

            console.log('[Facebook Sync App] 💾 Using storage key:', tokenKey);
            console.log('[Facebook Sync App] 💾 Token to save:', token.substring(0, 15) + '...');

            // Check chrome.storage permissions
            if (!chrome.storage || !chrome.storage.local) {
                throw new Error('Chrome storage API not available');
            }

            // Save token
            const saveData = { [tokenKey]: token };
            await chrome.storage.local.set(saveData);
            console.log('[Facebook Sync App] 💾 JWT token saved to Chrome local storage');
            console.log('[Facebook Sync App] 💾 Save data:', { [tokenKey]: token.substring(0, 15) + '...' });

            // Immediate verification
            const verification = await chrome.storage.local.get(tokenKey);
            console.log('[Facebook Sync App] 🔍 Verification result:', verification);

            if (verification[tokenKey] === token) {
                console.log('[Facebook Sync App] ✅ JWT token save verification successful');
                console.log('[Facebook Sync App] ✅ Token stored with key:', tokenKey);
                return true;
            } else {
                console.error('[Facebook Sync App] ❌ JWT token save verification failed');
                console.error('[Facebook Sync App] ❌ Expected:', token.substring(0, 15) + '...');
                console.error('[Facebook Sync App] ❌ Got:', verification[tokenKey]?.substring(0, 15) + '...');
                return false;
            }
        } catch (error) {
            console.error('[Facebook Sync App] ❌ Critical error saving JWT token:', error);
            console.error('[Facebook Sync App] ❌ Error details:', error.message);
            console.error('[Facebook Sync App] ❌ Stack trace:', error.stack);
            return false;
        }
    }

    // Debug method to check all storage keys
    async debugStorage() {
        try {
            console.log('[Facebook Sync App] 🔍 Debugging Chrome storage state...');

            // Get all stored data
            const allData = await chrome.storage.local.get(null);
            console.log('[Facebook Sync App] 🔍 All Chrome storage data:', allData);

            // Check specific keys from config
            const tokenKey = window.AppConfig?.STORAGE_KEYS?.API_TOKEN || 'jwt_access_token';
            const deviceKey = window.AppConfig?.STORAGE_KEYS?.DEVICE_ID || 'device_id';

            console.log('[Facebook Sync App] 🔍 Expected JWT token key:', tokenKey);
            console.log('[Facebook Sync App] 🔍 Expected device ID key:', deviceKey);

            console.log('[Facebook Sync App] 🔍 JWT token value:', allData[tokenKey] ? allData[tokenKey].substring(0, 15) + '...' : 'NOT FOUND');
            console.log('[Facebook Sync App] 🔍 Device ID value:', allData[deviceKey] || 'NOT FOUND');

            return allData;
        } catch (error) {
            console.error('[Facebook Sync App] Error debugging storage:', error);
            return null;
        }
    }

    // Test Chrome storage functionality
    async testChromeStorage() {
        try {
            console.log('[Facebook Sync App] 🗺 Testing Chrome storage functionality...');

            // Test basic storage
            const testKey = 'test_storage_' + Date.now();
            const testValue = 'test_value_' + Math.random();

            console.log('[Facebook Sync App] 🗺 Saving test data:', { [testKey]: testValue });
            await chrome.storage.local.set({ [testKey]: testValue });

            // Retrieve test data
            const result = await chrome.storage.local.get(testKey);
            console.log('[Facebook Sync App] 🗺 Retrieved test data:', result);

            if (result[testKey] === testValue) {
                console.log('[Facebook Sync App] ✅ Chrome storage test PASSED');

                // Clean up
                await chrome.storage.local.remove(testKey);
                console.log('[Facebook Sync App] 🗺 Test data cleaned up');
                return true;
            } else {
                console.error('[Facebook Sync App] ❌ Chrome storage test FAILED');
                console.error('[Facebook Sync App] ❌ Expected:', testValue);
                console.error('[Facebook Sync App] ❌ Got:', result[testKey]);
                return false;
            }
        } catch (error) {
            console.error('[Facebook Sync App] ❌ Chrome storage test ERROR:', error);
            return false;
        }
    }
}


