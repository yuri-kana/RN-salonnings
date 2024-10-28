const jwt = require('jsonwebtoken');
const Admin = require('../models/admin'); // Adjust the path as necessary

const adminAuth = async (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY || 'your_secret_key');
        const admin = await Admin.findById(decoded.id);
        
        if (!admin) {
            return res.status(403).json({ error: 'Forbidden: Admin only' });
        }
        
        req.admin = admin; // Add admin info to request
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = adminAuth;