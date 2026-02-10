const jwt = require('jsonwebtoken');

const optionalAuthMiddleware = async (req, res, next) => {
    // Get token from header
    const token = req.header('x-auth-token') || (req.header('Authorization') && req.header('Authorization').replace('Bearer ', ''));

    // If no token, just next() without setting req.user
    if (!token) {
        return next();
    }

    try {
        const secret = process.env.JWT_SECRET || 'codewise_secret_key_123';
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    } catch (err) {
        // Invalid token? Just ignore and treat as guest
        next();
    }
};

module.exports = optionalAuthMiddleware;
