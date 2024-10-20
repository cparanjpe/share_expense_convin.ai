const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET; // Use the same secret key

exports.authenticate = (req, res, next) => {
    // Get token from the Authorization header
    const token = req.headers['authorization'];
    const {userId} = req.body;
    const user_id = req.params?.id;
    // console.log(userId,user_id);

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        req.body.decoded_id = decoded.id;
        if((userId && userId!="")|| ( user_id&& user_id!="") ){
            if(userId && userId!="" && decoded.id!=userId)return res.status(401).json({ error: 'Unauthorized' });
            if(user_id && user_id!="" && decoded.id!=user_id)return res.status(401).json({ error: 'Unauthorized' });
        }
            // Attach user ID to the request
        next(); // Proceed to the next route handler
    });
};
