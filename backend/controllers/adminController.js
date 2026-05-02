// ============================================================
// FILE: controllers/adminController.js
// PURPOSE: Business logic for admin-only features
// PHASE: 2 (new)
// DEPENDENCIES: User model, Transaction model
// ============================================================

const User = require('../models/User');
const Transaction = require('../models/Transaction');

// FUNCTION: getAllUsers()
// PURPOSE: Returns all registered users for the admin user list
// RETURNS: Array of users — exclude password field always
// ERRORS: 500 if DB query fails
// ACCESS: Admin only
// FIELDS TO RETURN: _id, name, email, role, createdAt
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password') // Exclude password for security
      .sort({ createdAt: -1 }); // Newest users first

    return res.status(200).json({ users });
  } catch (error) {
    console.error('[getAllUsers] Error:', error.message);
    res.status(500).json({
      message: 'Failed to load users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// FUNCTION: getUserTransactions()
// PURPOSE: Returns all transactions belonging to one specific user
// PARAMS: req.params.id — the userId to look up
// RETURNS: Array of that user's transactions, sorted newest first
// ERRORS: 404 if user not found, 500 if DB query fails
// ACCESS: Admin only
// WHY: Admin needs to browse any user's records without
//      being the owner of those transactions
exports.getUserTransactions = async (req, res) => {
  try {
    const userId = req.params.id;

    // First, verify the user exists
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Then get all transactions for this user
    const transactions = await Transaction.find({ user: userId })
      .sort({ date: -1 }); // Newest transactions first

    return res.status(200).json({
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        currency: user.currency,
        createdAt: user.createdAt
      },
      transactions
    });
  } catch (error) {
    console.error('[getUserTransactions] Error:', error.message);
    res.status(500).json({
      message: 'Failed to load user transactions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};