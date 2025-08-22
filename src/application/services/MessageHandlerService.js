/**
 * Message Handler Service - Application layer
 */
export class MessageHandlerService {
    constructor(registerUserUseCase, createRepostUseCase, userRepository, authenticationService) {
        this.registerUserUseCase = registerUserUseCase;
        this.createRepostUseCase = createRepostUseCase;
        this.userRepository = userRepository;
        this.authenticationService = authenticationService;
    }

    async handleMessage(message) {
        try {
            switch (message.type) {
                case 'REGISTER_USER':
                    return await this.handleRegisterUser(message.payload);

                case 'SEND_ENTRY':
                    return await this.handleSendEntry(message.payload);

                case 'SEND_REPOST':
                    return await this.handleSendRepost(message.payload);

                case 'STREAK_ADD':
                    return await this.handleStreakAdd(message.payload);

                case 'STREAK_RESET':
                    return await this.handleStreakReset(message.payload);

                case 'TEST_CONNECTION':
                    return await this.handleTestConnection(message.payload);

                case 'GET_USER_INFO':
                    return await this.handleGetUserInfo(message.payload);

                case 'UPDATE_USER_PROFILE':
                    return await this.handleUpdateUserProfile(message.payload);

                default:
                    return { error: 'Unknown message type: ' + message.type };
            }
        } catch (error) {
            console.error('[Message Handler] Error handling message:', error);
            return { error: error.message };
        }
    }

    async handleRegisterUser(payload) {
        const { device_id, fb_uid_hashed, app_version } = payload;
        const result = await this.registerUserUseCase.execute(
            device_id,
            fb_uid_hashed,
            app_version
        );

        if (result.success) {
            return {
                salt: result.salt,
                api_token: result.apiToken
            };
        } else {
            throw new Error(result.error);
        }
    }

    async handleSendEntry(payload) {
        try {
            const { api_token, name, avatar_url } = payload;

            if (!api_token) {
                throw new Error('API token is required');
            }

            // Validate user token
            const user = await this.userRepository.findByApiToken(api_token);
            if (!user) {
                throw new Error('Invalid API token');
            }

            // Update user profile
            const updateResult = await this.userRepository.updateProfile(user.id, {
                name: name || user.name,
                avatar_url: avatar_url || user.avatar_url
            });

            return { ok: true, data: updateResult };
        } catch (error) {
            console.error('[Message Handler] Send entry error:', error);
            throw error;
        }
    }

    async handleSendRepost(payload) {
        try {
            const { api_token, postId, content, url, userAgent, timestamp } = payload;

            const currentUrl = url || 'https://facebook.com';
            const currentUserAgent = userAgent || 'Unknown';
            const currentTimestamp = timestamp || new Date().toISOString();

            const result = await this.createRepostUseCase.execute(
                postId,
                content,
                currentUrl,
                currentUserAgent,
                api_token
            );

            if (result.success) {
                return { ok: true, data: result.repost };
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('[Message Handler] Send repost error:', error);
            throw error;
        }
    }

    async handleStreakAdd(payload) {
        try {
            const { api_token, users } = payload;

            if (!api_token) {
                throw new Error('API token is required');
            }

            if (!Array.isArray(users) || users.length === 0) {
                throw new Error('Users array is required and cannot be empty');
            }

            // Validate user token
            const user = await this.userRepository.findByApiToken(api_token);
            if (!user) {
                throw new Error('Invalid API token');
            }

            // Process streak add for each user
            const results = [];
            for (const userId of users) {
                try {
                    const result = await this.userRepository.addToStreak(user.id, userId);
                    results.push({ userId, success: true, result });
                } catch (error) {
                    results.push({ userId, success: false, error: error.message });
                }
            }

            const successCount = results.filter(r => r.success).length;
            console.log(`[Message Handler] Streak add: ${successCount}/${users.length} successful`);

            return { ok: true, data: { results, successCount, totalCount: users.length } };
        } catch (error) {
            console.error('[Message Handler] Streak add error:', error);
            throw error;
        }
    }

    async handleStreakReset(payload) {
        try {
            const { api_token, users } = payload;

            if (!api_token) {
                throw new Error('API token is required');
            }

            if (!Array.isArray(users) || users.length === 0) {
                throw new Error('Users array is required and cannot be empty');
            }

            // Validate user token
            const user = await this.userRepository.findByApiToken(api_token);
            if (!user) {
                throw new Error('Invalid API token');
            }

            // Process streak reset for each user
            const results = [];
            for (const userId of users) {
                try {
                    const result = await this.userRepository.resetStreak(user.id, userId);
                    results.push({ userId, success: true, result });
                } catch (error) {
                    results.push({ userId, success: false, error: error.message });
                }
            }

            const successCount = results.filter(r => r.success).length;
            console.log(`[Message Handler] Streak reset: ${successCount}/${users.length} successful`);

            return { ok: true, data: { results, successCount, totalCount: users.length } };
        } catch (error) {
            console.error('[Message Handler] Streak reset error:', error);
            throw error;
        }
    }

    async handleTestConnection(payload) {
        try {
            const { api_token } = payload;

            if (!api_token) {
                throw new Error('API token is required for connection test');
            }

            // Validate user token
            const user = await this.userRepository.findByApiToken(api_token);
            if (!user) {
                throw new Error('Invalid API token');
            }

            // Test authentication service
            const authTest = await this.authenticationService.validateToken(api_token);
            if (!authTest.valid) {
                throw new Error('Token validation failed');
            }

            return {
                ok: true,
                data: {
                    connected: true,
                    user: {
                        id: user.id,
                        deviceId: user.deviceId,
                        isAuthenticated: true
                    },
                    timestamp: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error('[Message Handler] Connection test error:', error);
            // Don't throw error for connection test, return failure status
            return {
                ok: false,
                data: {
                    connected: false,
                    error: error.message,
                    timestamp: new Date().toISOString()
                }
            };
        }
    }

    async handleGetUserInfo(payload) {
        try {
            const { api_token } = payload;

            if (!api_token) {
                throw new Error('API token is required');
            }

            // Get user info
            const user = await this.userRepository.findByApiToken(api_token);
            if (!user) {
                throw new Error('Invalid API token');
            }

            return {
                ok: true,
                data: {
                    id: user.id,
                    deviceId: user.deviceId,
                    fbUidHashed: user.fbUidHashed,
                    name: user.name,
                    avatar_url: user.avatar_url,
                    appVersion: user.appVersion,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            };
        } catch (error) {
            console.error('[Message Handler] Get user info error:', error);
            throw error;
        }
    }

    async handleUpdateUserProfile(payload) {
        try {
            const { api_token, name, avatar_url, ...otherFields } = payload;

            if (!api_token) {
                throw new Error('API token is required');
            }

            // Validate user token
            const user = await this.userRepository.findByApiToken(api_token);
            if (!user) {
                throw new Error('Invalid API token');
            }

            // Update user profile
            const updateData = {
                ...(name && { name }),
                ...(avatar_url && { avatar_url }),
                ...otherFields
            };

            const updatedUser = await this.userRepository.updateProfile(user.id, updateData);

            return {
                ok: true,
                data: {
                    id: updatedUser.id,
                    name: updatedUser.name,
                    avatar_url: updatedUser.avatar_url,
                    updatedAt: updatedUser.updatedAt
                }
            };
        } catch (error) {
            console.error('[Message Handler] Update user profile error:', error);
            throw error;
        }
    }
}


