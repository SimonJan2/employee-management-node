const { Session } = require('../models');
const authService = require('../services/authService');

async function sessionManager(req, res, next) {
    const accessToken = req.headers.authorization?.split(' ')[1];
    const refreshToken = req.cookies?.refreshToken;

    if (!accessToken) {
        return next();
    }

    const decoded = await authService.validateToken(accessToken);
    if (decoded) {
        req.user = decoded;
        return next();
    }

    if (refreshToken) {
        try {
            const tokens = await authService.refreshToken(refreshToken);
            res.cookie('refreshToken', tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });
            res.setHeader('Authorization', `Bearer ${tokens.accessToken}`);
            req.user = await authService.validateToken(tokens.accessToken);
        } catch (error) {
            // Invalid refresh token, continue as unauthenticated
        }
    }

    next();
}