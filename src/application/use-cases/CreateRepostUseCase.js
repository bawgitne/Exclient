/**
 * Create Repost Use Case - Application layer
 */
import { Repost } from '../../core/entities/Repost.js';

export class CreateRepostUseCase {
    constructor(repostRepository, userRepository) {
        this.repostRepository = repostRepository;
        this.userRepository = userRepository;
    }

    async execute(postId, content, url, userAgent, apiToken) {
        try {
            // Validate input
            if (!postId || !url || !apiToken) {
                throw new Error('Missing required parameters');
            }

            // Validate user token
            const user = await this.userRepository.findByApiToken(apiToken);
            if (!user) {
                throw new Error('Invalid API token');
            }

            // Create repost entity
            const repost = new Repost(
                postId,
                content || '',
                new Date(),
                url,
                userAgent || navigator.userAgent,
                user.id
            );

            // Validate repost
            if (!repost.isValid()) {
                throw new Error('Invalid repost data');
            }

            // Save repost
            const savedRepost = await this.repostRepository.create(repost);

            return {
                success: true,
                repost: savedRepost
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

