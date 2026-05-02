// ============================================================
// FILE: routes/adminRoutes.js
// PURPOSE: Admin-only API endpoint definitions
// PHASE: 2 (new)
// DEPENDENCIES: authMiddleware, adminMiddleware, adminController
// IMPORTANT: router.use(authMiddleware, adminMiddleware) must be
//            called ONCE at the top to protect ALL routes below
// ============================================================

const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
// [ADMIN UPDATE MODIFIED] Add getStats to existing import
const {
  getAllUsers,
  getUserTransactions,
  getStats,            // [ADMIN UPDATE ADDED]
  updateUserRole       // [ROLE SWITCH ADDED]
} = require('../controllers/adminController');

const router = express.Router();

// Apply both middlewares to every route in this file at once:
router.use(authMiddleware, adminMiddleware);

// ROUTE: GET /api/admin/users
// ACCESS: Admin only (authMiddleware + adminMiddleware)
// PURPOSE: Get full list of all registered users
// RESPONSE: [{ _id, name, email, role, createdAt }]
router.get('/users', getAllUsers);

// ROUTE: GET /api/admin/users/:id/transactions
// ACCESS: Admin only
// PURPOSE: Get all transactions for a specific user
// PARAMS: id — the MongoDB _id of the target user
// RESPONSE: { user: {...}, transactions: [...] }
router.get('/users/:id/transactions', getUserTransactions);

// [ADMIN UPDATE ADDED]
// ROUTE: GET /api/admin/stats
// ACCESS: Admin only
// PURPOSE: Platform overview numbers for stats cards
router.get('/stats', getStats);

// [ROLE SWITCH ADDED]
// ROUTE: PATCH /api/admin/users/:id/role
// ACCESS: Admin only
// PURPOSE: Update a user's role between 'user' and 'admin'
router.patch('/users/:id/role', updateUserRole);

module.exports = router;
