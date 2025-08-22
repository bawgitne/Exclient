/**
 * API User Repository Implementation - Infrastructure layer
 */
import { User } from '../../core/entities/User.js';
import { IUserRepository } from '../../core/repositories/IUserRepository.js';

export class ApiUserRepository extends IUserRepository {
    constructor(apiClient) {
        super();
        this.apiClient = apiClient;
    }

    async register(user) {
        try {
            const response = await this.apiClient.post('/v1/users/register', {
                device_id: user.deviceId,
                fb_uid_hashed: user.fbUidHashed,
                app_version: user.appVersion
            });

            if (response.success) {
                const registeredUser = new User(
                    response.data.id,
                    user.deviceId,
                    user.fbUidHashed,
                    user.appVersion,
                    response.data.api_token,
                    response.data.salt
                );
                return registeredUser;
            } else {
                throw new Error(response.error || 'Registration failed');
            }
        } catch (error) {
            throw new Error(`Registration failed: ${error.message}`);
        }
    }

    async update(user) {
        try {
            const response = await this.apiClient.put('/v1/users/update', {
                avatar_url: user.avatarUrl,
                name: user.name
            }, user.apiToken);

            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.error || 'Update failed');
            }
        } catch (error) {
            throw new Error(`Update failed: ${error.message}`);
        }
    }

    async findById(id) {
        try {
            const response = await this.apiClient.get(`/v1/users/${id}`);

            if (response.success && response.data) {
                return new User(
                    response.data.id,
                    response.data.device_id,
                    response.data.fb_uid_hashed,
                    response.data.app_version,
                    response.data.api_token,
                    response.data.salt
                );
            }
            return null;
        } catch (error) {
            console.error('[ApiUserRepository] Error finding user by ID:', error);
            return null;
        }
    }

    async findByDeviceId(deviceId) {
        try {
            const response = await this.apiClient.get(`/v1/users/device/${deviceId}`);

            if (response.success && response.data) {
                return new User(
                    response.data.id,
                    response.data.device_id,
                    response.data.fb_uid_hashed,
                    response.data.app_version,
                    response.data.api_token,
                    response.data.salt
                );
            }
            return null;
        } catch (error) {
            console.error('[ApiUserRepository] Error finding user by device ID:', error);
            return null;
        }
    }

    async findByApiToken(apiToken) {
        try {
            const response = await this.apiClient.get('/v1/users/me', apiToken);

            if (response.success && response.data) {
                return new User(
                    response.data.id,
                    response.data.device_id,
                    response.data.fb_uid_hashed,
                    response.data.app_version,
                    response.data.api_token,
                    response.data.salt
                );
            }
            return null;
        } catch (error) {
            console.error('[ApiUserRepository] Error finding user by API token:', error);
            return null;
        }
    }

    async save(user) {
        try {
            if (user.id) {
                // Update existing user
                return await this.update(user);
            } else {
                // Register new user
                return await this.register(user);
            }
        } catch (error) {
            throw new Error(`Save failed: ${error.message}`);
        }
    }

    async updateProfile(userId, profileData) {
        try {
            const response = await this.apiClient.put(`/v1/users/${userId}/profile`, profileData);

            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.error || 'Profile update failed');
            }
        } catch (error) {
            throw new Error(`Profile update failed: ${error.message}`);
        }
    }

    async addToStreak(userId, targetUserId) {
        try {
            const response = await this.apiClient.post('/v1/streak/add', {
                user_id: userId,
                target_user_id: targetUserId
            });

            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.error || 'Streak add failed');
            }
        } catch (error) {
            throw new Error(`Streak add failed: ${error.message}`);
        }
    }

    async resetStreak(userId, targetUserId) {
        try {
            const response = await this.apiClient.post('/v1/streak/reset', {
                user_id: userId,
                target_user_id: targetUserId
            });

            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.error || 'Streak reset failed');
            }
        } catch (error) {
            throw new Error(`Streak reset failed: ${error.message}`);
        }
    }
}


