// ============================================================
// FILE: middleware/authMiddleware.js
// PURPOSE: Middleware to verify JWT tokens and attach the user to req.user
// PHASE: Registration Update
// LAST MODIFIED: May 2, 2026
// CHANGES: - Added currency to req.user object for global access
// ============================================================

// Middleware to verify JWT tokens and attach the user to req.user.
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token missing' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // [REG UPDATE MODIFIED] Added currency so components can
    // display correct symbol without an extra DB call
    req.user = {
      id: decoded.id,
      role: decoded.role,
      currency: decoded.currency // [REG UPDATE ADDED]
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
