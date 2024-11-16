const jwt = require('jsonwebtoken');
const { User, Session } = require('../models');
const { v4: uuidv4 } = require('uuid');

class AuthService {
    async generateTokens(user) {
        const accessToken = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        const refreshToken = uuidv4();
        
        await Session.create({
            userId: user.id,
            refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });

        return { accessToken, refreshToken };
    }

    async refreshToken(refreshToken) {
        const session = await Session.findOne({
            where: { refreshToken, expiresAt: { [Op.gt]: new Date() } },
            include: User
        });

        if (!session) {
            throw new Error('Invalid refresh token');
        }

        const tokens = await this.generateTokens(session.user);
        await session.destroy();
        return tokens;
    }

    async validateToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch {
            return null;
        }
    }

    async invalidateSession(refreshToken) {
        await Session.destroy({ where: { refreshToken } });
    }
}

module.exports = new AuthService();