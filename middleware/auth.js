// middleware/auth.js
const jwt = require('jsonwebtoken');
const JWT_SECRET =process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    console.log("token..:", token);
    if (!token) {
        return res.status(401).json({ message: 'Access denied, no token provided' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attach decoded token data to the request object
        next();
    } catch (error) {
        res.status(403).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authenticateToken;
