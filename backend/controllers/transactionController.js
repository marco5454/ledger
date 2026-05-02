// Controller for transaction CRUD operations.
const Transaction = require('../models/Transaction');

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ date: -1 });

    return res.status(200).json({ transactions });
  } catch (error) {
    console.error('Get transactions error:', error.message);
    return res.status(500).json({ message: 'Failed to load transactions' });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const { type, amount, description, date } = req.body;

    if (!type || !amount || !description) {
      return res.status(400).json({ message: 'Type, amount, and description are required' });
    }

    const transaction = await Transaction.create({
      user: req.user.id,
      type,
      amount,
      description,
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
    const { type, amount, description, date } = req.body;

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
