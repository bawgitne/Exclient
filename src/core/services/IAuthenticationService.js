/**
 * Authentication Service Interface - Core contract
 */
export class IAuthenticationService {
    async authenticate(credentials) {
        throw new Error('Method not implemented');
    }

    async validateToken(token) {
        throw new Error('Method not implemented');
    }

    async refreshToken(token) {
        throw new Error('Method not implemented');
    }

    async logout() {
        throw new Error('Method not implemented');
    }
}

