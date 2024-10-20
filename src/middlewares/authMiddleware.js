const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET; // Use the same secret key

exports.authenticate = (req, res, next) => {
    const token = req.headers['authorization']; // Get token from the Authorization header

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        req.userId = decoded.id; // Attach user ID to the request
        next(); // Proceed to the next route handler
    });
};
