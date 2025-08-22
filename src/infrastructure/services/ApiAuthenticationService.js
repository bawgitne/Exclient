/**
 * API Authentication Service Implementation - Infrastructure layer
 */
import { IAuthenticationService } from '../../core/services/IAuthenticationService.js';

export class ApiAuthenticationService extends IAuthenticationService {
    constructor(apiClient) {
        super();
        this.apiClient = apiClient;
    }

    async authenticate(credentials) {
        try {
            const response = await this.apiClient.post('/v1/users/register', {
                device_id: credentials.deviceId,
                fb_uid_hashed: credentials.fbUidHashed
            });

            if (response.success) {
                return {
                    apiToken: response.data.api_token,
                    salt: response.data.salt
                };
            } else {
                throw new Error(response.error || 'Authentication failed');
            }
        } catch (error) {
            throw new Error(`Authentication failed: ${error.message}`);
        }
    }

    async validateToken(token) {
        try {
            const response = await this.apiClient.get('/v1/health', token);
            return {
                valid: response.success || false,
                user: response.data?.user || null,
                expiresAt: response.data?.expiresAt || null
            };
        } catch (error) {
            console.error('[ApiAuthenticationService] Token validation error:', error);
            return {
                valid: false,
                error: error.message
            };
        }
    }

    async refreshToken(token) {
        try {
            const response = await this.apiClient.post('/v1/auth/refresh', { token });

            if (response.success) {
                return {
                    apiToken: response.data.api_token,
                    expiresAt: response.data.expires_at
                };
            } else {
                throw new Error(response.error || 'Token refresh failed');
            }
        } catch (error) {
            throw new Error(`Token refresh failed: ${error.message}`);
        }
    }

    async logout(token) {
        try {
            const response = await this.apiClient.post('/v1/auth/logout', {}, token);

            if (response.success) {
                return true;
            } else {
                throw new Error(response.error || 'Logout failed');
            }
        } catch (error) {
            console.error('[ApiAuthenticationService] Logout error:', error);
            // Don't throw error for logout, just log it
            return false;
        }
    }

    async changePassword(token, oldPassword, newPassword) {
        try {
            const response = await this.apiClient.post('/v1/auth/change-password', {
                old_password: oldPassword,
                new_password: newPassword
            }, token);

            if (response.success) {
                return {
                    success: true,
                    apiToken: response.data.api_token
                };
            } else {
                throw new Error(response.error || 'Password change failed');
            }
        } catch (error) {
            throw new Error(`Password change failed: ${error.message}`);
        }
    }

    async getProfile(token) {
        try {
            const response = await this.apiClient.get('/v1/auth/profile', token);

            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.error || 'Get profile failed');
            }
        } catch (error) {
            throw new Error(`Get profile failed: ${error.message}`);
        }
    }
}


