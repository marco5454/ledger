// Controller for transaction CRUD operations.
const Transaction = require('../models/Transaction');

// [CAT-PAGE MODIFIED] getTransactions()
// PURPOSE: Returns paginated transactions for logged-in user
// QUERY PARAMS: page (default 1), limit (default 10)
// RETURNS: { transactions, totalCount, currentPage, totalPages }
exports.getTransactions = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip  = (page - 1) * limit;

    // Run both queries simultaneously for efficiency
    const [totalCount, transactions] = await Promise.all([
      Transaction.countDocuments({ user: req.user.id }),
      Transaction.find({ user: req.user.id })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
    ]);

    return res.status(200).json({
      transactions,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (error) {
    console.error('Get transactions error:', error.message);
    return res.status(500).json({ message: 'Failed to load transactions' });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    // [CAT-PAGE MODIFIED] Destructure category from body
    const { type, amount, description, category, date } = req.body;

    if (!type || !amount || !description) {
      return res.status(400).json({ message: 'Type, amount, and description are required' });
    }

    // [CAT-PAGE ADDED] Validate category presence
    if (!category) {
      return res.status(400).json({
        message: 'Category is required'
      });
    }

    // [CAT-PAGE MODIFIED] Include category when creating
    const transaction = await Transaction.create({
      user: req.user.id,
      type,
      amount,
      description,
      category,
      date: date || Date.now(),
    });

    return res.status(201).json({ transaction });
  } catch (error) {
    console.error('Create transaction error:', error.message);
    return res.status(500).json({ message: 'Failed to create transaction' });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const transactionId = req.params.id;
    // [CAT-PAGE MODIFIED] Include category in allowed updates
    const { type, amount, description, category, date } = req.body;

    const transaction = await Transaction.findOne({
      _id: transactionId,
      user: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    transaction.type = type || transaction.type;
    transaction.amount = amount !== undefined ? amount : transaction.amount;
    transaction.description = description || transaction.description;
    transaction.category = category || transaction.category;
    transaction.date = date || transaction.date;

    await transaction.save();

    return res.status(200).json({ transaction });
  } catch (error) {
    console.error('Update transaction error:', error.message);
    return res.status(500).json({ message: 'Failed to update transaction' });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const transactionId = req.params.id;

    const transaction = await Transaction.findOneAndDelete({
      _id: transactionId,
      user: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    return res.status(200).json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error.message);
    return res.status(500).json({ message: 'Failed to delete transaction' });
  }
};
