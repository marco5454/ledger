// RecurringTransaction schema for automated transaction generation.
const mongoose = require('mongoose');

const recurringTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative'],
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: [true, 'Frequency is required'],
  },
  start_date: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  last_generated_date: {
    type: Date,
    default: null,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('RecurringTransaction', recurringTransactionSchema);