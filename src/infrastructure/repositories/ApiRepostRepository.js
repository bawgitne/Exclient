/**
 * API Repost Repository Implementation - Infrastructure layer
 */
import { IRepostRepository } from '../../core/repositories/IRepostRepository.js';

export class ApiRepostRepository extends IRepostRepository {
    constructor(apiClient) {
        super();
        this.apiClient = apiClient;
    }

    async create(repost) {
        try {
            const response = await this.apiClient.post('/v1/repost', {
                postId: repost.postId,
                content: repost.content,
                timestamp: repost.timestamp,
                url: repost.url,
                userAgent: repost.userAgent
            }, repost.userId);

            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.error || 'Create repost failed');
            }
        } catch (error) {
            throw new Error(`Create repost failed: ${error.message}`);
        }
    }

    async findById(id) {
        try {
            const response = await this.apiClient.get(`/v1/repost/${id}`);

            if (response.success && response.data) {
                return response.data;
            }
            return null;
        } catch (error) {
            console.error('[ApiRepostRepository] Error finding repost by ID:', error);
            return null;
        }
    }

    async findByPostId(postId) {
        try {
            const response = await this.apiClient.get(`/v1/repost/post/${postId}`);

            if (response.success && response.data) {
                return Array.isArray(response.data) ? response.data : [response.data];
            }
            return [];
        } catch (error) {
            console.error('[ApiRepostRepository] Error finding reposts by post ID:', error);
            return [];
        }
    }

    async findByUserId(userId) {
        try {
            const response = await this.apiClient.get(`/v1/repost/user/${userId}`);

            if (response.success && response.data) {
                return Array.isArray(response.data) ? response.data : [response.data];
            }
            return [];
        } catch (error) {
            console.error('[ApiRepostRepository] Error finding reposts by user ID:', error);
            return [];
        }
    }

    async update(repost) {
        try {
            const response = await this.apiClient.put(`/v1/repost/${repost.id}`, {
                content: repost.content,
                timestamp: repost.timestamp,
                url: repost.url,
                userAgent: repost.userAgent
            });

            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.error || 'Update repost failed');
            }
        } catch (error) {
            throw new Error(`Update repost failed: ${error.message}`);
        }
    }

    async delete(id) {
        try {
            const response = await this.apiClient.delete(`/v1/repost/${id}`);

            if (response.success) {
                return true;
            } else {
                throw new Error(response.error || 'Delete repost failed');
            }
        } catch (error) {
            throw new Error(`Delete repost failed: ${error.message}`);
        }
    }

    async findAll(limit = 50, offset = 0) {
        try {
            const response = await this.apiClient.get(`/v1/repost?limit=${limit}&offset=${offset}`);

            if (response.success && response.data) {
                return {
                    reposts: Array.isArray(response.data.reposts) ? response.data.reposts : [],
                    total: response.data.total || 0,
                    limit,
                    offset
                };
            }
            return { reposts: [], total: 0, limit, offset };
        } catch (error) {
            console.error('[ApiRepostRepository] Error finding all reposts:', error);
            return { reposts: [], total: 0, limit, offset };
        }
    }

    async getStatistics(userId) {
        try {
            const response = await this.apiClient.get(`/v1/repost/stats/${userId}`);

            if (response.success && response.data) {
                return response.data;
            }
            return {
                totalReposts: 0,
                todayReposts: 0,
                weekReposts: 0,
                monthReposts: 0
            };
        } catch (error) {
            console.error('[ApiRepostRepository] Error getting repost statistics:', error);
            return {
                totalReposts: 0,
                todayReposts: 0,
                weekReposts: 0,
                monthReposts: 0
            };
        }
    }
}


