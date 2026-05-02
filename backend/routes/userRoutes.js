// ============================================================
// FILE: routes/userRoutes.js
// PURPOSE: User profile and settings API endpoints
// PHASE: Settings Update
// DEPENDENCIES: authMiddleware, userController
// NOTE: All routes require authentication — no public access
// ============================================================

const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { getProfile, updateProfile, updatePassword } = require('../controllers/userController');

const router = express.Router();

// [SETTINGS ADDED] Apply authMiddleware to ALL routes in this file
// Every route below requires a valid JWT token
router.use(authMiddleware);

// ROUTE: GET /api/user/profile
// ACCESS: Authenticated user only
// PURPOSE: Get current user's profile data
// RESPONSE: { fullName, email, currency, role, createdAt }
router.get('/profile', getProfile);

// ROUTE: PUT /api/user/profile
// ACCESS: Authenticated user only
// PURPOSE: Update fullName and/or currency
// BODY: { fullName?, currency? } — both optional
// RESPONSE: { fullName, email, currency }
router.put('/profile', updateProfile);

// ROUTE: PUT /api/user/password
// ACCESS: Authenticated user only
// PURPOSE: Change password with current password verification
// BODY: { currentPassword, newPassword }
// RESPONSE: { message: 'Password updated successfully' }
router.put('/password', updatePassword);

module.exports = router;
