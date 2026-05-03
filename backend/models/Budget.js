// Budget schema for monthly category budgets
const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Budget amount is required'],
    min: [0, 'Budget amount cannot be negative'],
  },
  // Store as YYYY-MM format for easy querying
  month: {
    type: String,
    required: [true, 'Month is required'],
    match: [/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format']
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Ensure one budget per user per category per month
budgetSchema.index({ user: 1, category: 1, month: 1 }, { unique: true });

// Update the updatedAt timestamp before saving
budgetSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Budget', budgetSchema);