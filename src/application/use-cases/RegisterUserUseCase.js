/**
 * Register User Use Case - Application layer
 */
import { User } from '../../core/entities/User.js';

export class RegisterUserUseCase {
    constructor(userRepository, authenticationService) {
        this.userRepository = userRepository;
        this.authenticationService = authenticationService;
    }

    async execute(deviceId, fbUidHashed, appVersion) {
        try {
            // Validate input
            if (!deviceId || !fbUidHashed || !appVersion) {
                throw new Error('Missing required parameters');
            }

            // Create user entity
            const user = new User(null, deviceId, fbUidHashed, appVersion);

            // Check if user already exists
            const existingUser = await this.userRepository.findByDeviceId(deviceId);
            if (existingUser) {
                throw new Error('User already exists');
            }

            // Register user through repository
            const registeredUser = await this.userRepository.register(user);

            // Authenticate user
            const authResult = await this.authenticationService.authenticate({
                deviceId: registeredUser.deviceId,
                fbUidHashed: registeredUser.fbUidHashed
            });

            // Update user with credentials
            registeredUser.updateApiCredentials(authResult.apiToken, authResult.salt);
            await this.userRepository.save(registeredUser);

            return {
                success: true,
                user: registeredUser,
                salt: authResult.salt,
                apiToken: authResult.apiToken
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

