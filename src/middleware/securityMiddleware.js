const { AppError } = require('../utils/errorHandler');
const jwt = require('jsonwebtoken');

const securityMiddleware = {
    checkJWT: (req, res, next) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                throw new AppError('No token provided', 401);
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            next(new AppError('Invalid token', 401));
        }
    },

    checkRole: (roles) => {
        return (req, res, next) => {
            if (!roles.includes(req.user.role)) {
                return next(new AppError('Unauthorized access', 403));
            }
            next();
        };
    },

    sanitizeInput: (req, res, next) => {
        // Implement input sanitization logic
        next();
    }
};