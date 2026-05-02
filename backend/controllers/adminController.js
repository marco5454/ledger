// ============================================================
// FILE: controllers/adminController.js
// PURPOSE: Business logic for admin-only features
// PHASE: 2 (new)
// DEPENDENCIES: User model, Transaction model
// ============================================================

const User = require('../models/User');
const Transaction = require('../models/Transaction');

// [ADMIN UPDATE ADDED] getStats()
// FUNCTION: getStats()
// PURPOSE: Returns platform-wide overview stats and
//          the most recently registered user
// RETURNS: {
//   totalUsers        (number),
//   totalTransactions (number),
//   totalIncome       (number),
//   totalExpenses     (number),
//   netBalance        (number),
//   latestUser        { fullName, email, createdAt } | null
// }
// ACCESS: Admin only
// NOTE: All queries run in parallel via Promise.all
//       for performance — never run them sequentially
const getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalTransactions,
      incomeResult,
      expenseResult,
      latestUser
    ] = await Promise.all([
      // Total registered users
      User.countDocuments(),

      // Total transactions across all users
      Transaction.countDocuments(),

      // Sum all income records platform-wide
      Transaction.aggregate([
        { $match: { type: 'income' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),

      // Sum all expense records platform-wide
      Transaction.aggregate([
        { $match: { type: 'expense' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),

      // Most recently registered user
      User.findOne()
        .sort({ createdAt: -1 })
        .select('fullName email createdAt')
    ]);

    const totalIncome   = incomeResult[0]?.total  || 0;
    const totalExpenses = expenseResult[0]?.total || 0;

    res.json({
      totalUsers,
      totalTransactions,
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      latestUser: latestUser || null
    });

  } catch (error) {
    console.error('[getStats] Error:', error.message);
    res.status(500).json({
      message: 'Failed to load platform stats.',
      error: process.env.NODE_ENV === 'development'
        ? error.message : undefined
    });
  }
};

// FUNCTION: getAllUsers()
// PURPOSE: Returns all registered users for the admin user list
// RETURNS: Array of users — exclude password field always
// ERRORS: 500 if DB query fails
// ACCESS: Admin only
// FIELDS TO RETURN: _id, name, email, role, createdAt
// [ADMIN UPDATE MODIFIED] getAllUsers()
// PURPOSE: Returns all users each with a transaction
//          summary — avoids admin clicking into each user
//          just to see their basic numbers
// CHANGE: After fetching users run per-user aggregate
//         queries and attach results to each user object
// RETURNS: Array where each item has:
//   { _id, fullName, email, role, createdAt,
//     transactionCount, totalIncome,
//     totalExpenses, netBalance }
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password') // Exclude password for security
      .sort({ createdAt: -1 }); // Newest users first

    // [ADMIN UPDATE ADDED] Attach transaction summary
    // to each user — all queries run in parallel
    const usersWithSummary = await Promise.all(
      users.map(async (user) => {
        const [income, expense, count] = await Promise.all([
          Transaction.aggregate([
            { $match: { user: user._id, type: 'income' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
          ]),

          Transaction.aggregate([
            { $match: { user: user._id, type: 'expense' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
          ]),

          Transaction.countDocuments({ user: user._id })
        ]);

        const totalIncome   = income[0]?.total  || 0;
        const totalExpenses = expense[0]?.total || 0;

        // toObject() converts Mongoose doc to plain object
        // so we can safely spread it
        return {
          ...user.toObject(),
          transactionCount: count,
          totalIncome,
          totalExpenses,
          netBalance: totalIncome - totalExpenses
        };
      })
    );

    // [ADMIN UPDATE MODIFIED]
    return res.status(200).json({ users: usersWithSummary });
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
// [ADMIN UPDATE ADDED] Export getStats alongside existing exports
exports.getStats = getStats;

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

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!role || (role !== 'user' && role !== 'admin')) {
      return res.status(400).json({ message: 'Invalid role. Must be "user" or "admin"' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({ message: 'User role updated successfully', user: { _id: user._id, role: user.role } });
  } catch (error) {
    console.error('[updateUserRole] Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
