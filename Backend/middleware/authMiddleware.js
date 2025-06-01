const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }
    
    // Extract token from "Bearer <token>"
    const token = authHeader.substring(7);
    
    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Token verification failed:', err);
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

module.exports = auth;