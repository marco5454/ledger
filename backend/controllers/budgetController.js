// Controller for budget CRUD operations and status calculations
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// Get all budgets for the current month
exports.getBudgets = async (req, res) => {
  try {
    const month = req.query.month || getCurrentMonth();
    
    const budgets = await Budget.find({
      user: req.user.id,
      month: month
    }).sort({ category: 1 });

    return res.status(200).json({ budgets, month });
  } catch (error) {
    console.error('Get budgets error:', error.message);
    return res.status(500).json({ message: 'Failed to load budgets' });
  }
};

// Get budget status with spending calculations
exports.getBudgetStatus = async (req, res) => {
  try {
    const month = req.query.month || getCurrentMonth();
    
    // Get all budgets for the month
    const budgets = await Budget.find({
      user: req.user.id,
      month: month
    });

    // Get all expense transactions for the month
    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const transactions = await Transaction.find({
      user: req.user.id,
      type: 'expense',
      date: {
        $gte: startDate,
        $lt: endDate
      }
    });

    // Calculate spending per category
    const spendingByCategory = {};
    transactions.forEach(tx => {
      if (!spendingByCategory[tx.category]) {
        spendingByCategory[tx.category] = 0;
      }
      spendingByCategory[tx.category] += tx.amount;
    });

    // Build status for each budget
    const budgetStatus = budgets.map(budget => {
      const spent = spendingByCategory[budget.category] || 0;
      const remaining = budget.amount - spent;
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

      return {
        _id: budget._id,
        category: budget.category,
        budgetAmount: budget.amount,
        spent: spent,
        remaining: remaining,
        percentage: Math.round(percentage * 10) / 10, // Round to 1 decimal
        status: getStatus(percentage),
        month: budget.month
      };
    });

    return res.status(200).json({ 
      budgetStatus,
      month,
      totalBudget: budgets.reduce((sum, b) => sum + b.amount, 0),
      totalSpent: Object.values(spendingByCategory).reduce((sum, amt) => sum + amt, 0)
    });
  } catch (error) {
    console.error('Get budget status error:', error.message);
    return res.status(500).json({ message: 'Failed to calculate budget status' });
  }
};

// Create or update a budget
exports.createOrUpdateBudget = async (req, res) => {
  try {
    const { category, amount, month } = req.body;

    if (!category || !amount) {
      return res.status(400).json({ message: 'Category and amount are required' });
    }

    const budgetMonth = month || getCurrentMonth();

    // Validate month format
    if (!/^\d{4}-\d{2}$/.test(budgetMonth)) {
      return res.status(400).json({ message: 'Month must be in YYYY-MM format' });
    }

    // Try to find existing budget
    let budget = await Budget.findOne({
      user: req.user.id,
      category: category,
      month: budgetMonth
    });

    if (budget) {
      // Update existing budget
      budget.amount = amount;
      await budget.save();
      return res.status(200).json({ budget, message: 'Budget updated successfully' });
    } else {
      // Create new budget
      budget = await Budget.create({
        user: req.user.id,
        category,
        amount,
        month: budgetMonth
      });
      return res.status(201).json({ budget, message: 'Budget created successfully' });
    }
  } catch (error) {
    console.error('Create/update budget error:', error.message);
    return res.status(500).json({ message: 'Failed to save budget' });
  }
};

// Update an existing budget
exports.updateBudget = async (req, res) => {
  try {
    const budgetId = req.params.id;
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    const budget = await Budget.findOne({
      _id: budgetId,
      user: req.user.id
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    budget.amount = amount;
    await budget.save();

    return res.status(200).json({ budget, message: 'Budget updated successfully' });
  } catch (error) {
    console.error('Update budget error:', error.message);
    return res.status(500).json({ message: 'Failed to update budget' });
  }
};

// Delete a budget
exports.deleteBudget = async (req, res) => {
  try {
    const budgetId = req.params.id;

    const budget = await Budget.findOneAndDelete({
      _id: budgetId,
      user: req.user.id
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    return res.status(200).json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Delete budget error:', error.message);
    return res.status(500).json({ message: 'Failed to delete budget' });
  }
};

// Get category analysis - shows spending across all categories
exports.getCategoryAnalysis = async (req, res) => {
  try {
    const month = req.query.month || getCurrentMonth();
    
    // Get all budgets for the month
    const budgets = await Budget.find({
      user: req.user.id,
      month: month
    });

    // Get all expense transactions for the month
    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const transactions = await Transaction.find({
      user: req.user.id,
      type: 'expense',
      date: {
        $gte: startDate,
        $lt: endDate
      }
    });

    // Calculate spending per category
    const spendingByCategory = {};
    transactions.forEach(tx => {
      if (!spendingByCategory[tx.category]) {
        spendingByCategory[tx.category] = 0;
      }
      spendingByCategory[tx.category] += tx.amount;
    });

    // Get all unique categories (from budgets and transactions)
    const allCategories = new Set([
      ...budgets.map(b => b.category),
      ...Object.keys(spendingByCategory)
    ]);

    // Build analysis for each category
    const categoryAnalysis = Array.from(allCategories).map(category => {
      const budget = budgets.find(b => b.category === category);
      const spent = spendingByCategory[category] || 0;

      return {
        category,
        spent,
        hasBudget: !!budget,
        budgetAmount: budget ? budget.amount : 0,
        budgetId: budget ? budget._id : null,
        hasActivity: spent > 0
      };
    });

    // Sort by spent amount (descending)
    categoryAnalysis.sort((a, b) => b.spent - a.spent);

    return res.status(200).json({ 
      categoryAnalysis,
      month
    });
  } catch (error) {
    console.error('Get category analysis error:', error.message);
    return res.status(500).json({ message: 'Failed to load category analysis' });
  }
};

// Copy budgets from a previous month
exports.copyBudgetsFromMonth = async (req, res) => {
  try {
    const { sourceMonth } = req.body;
    const targetMonth = getCurrentMonth();

    if (!sourceMonth) {
      return res.status(400).json({ message: 'Source month is required' });
    }

    // Validate month format
    if (!/^\d{4}-\d{2}$/.test(sourceMonth)) {
      return res.status(400).json({ message: 'Month must be in YYYY-MM format' });
    }

    // Check if target month already has budgets
    const existingBudgets = await Budget.find({
      user: req.user.id,
      month: targetMonth
    });

    if (existingBudgets.length > 0) {
      return res.status(400).json({ message: 'Current month already has budgets' });
    }

    // Get budgets from source month
    const sourceBudgets = await Budget.find({
      user: req.user.id,
      month: sourceMonth
    });

    if (sourceBudgets.length === 0) {
      return res.status(404).json({ message: 'No budgets found in source month' });
    }

    // Create new budgets for current month
    const newBudgets = sourceBudgets.map(budget => ({
      user: req.user.id,
      category: budget.category,
      amount: budget.amount,
      month: targetMonth
    }));

    await Budget.insertMany(newBudgets);

    return res.status(201).json({ 
      message: 'Budgets copied successfully',
      count: newBudgets.length
    });
  } catch (error) {
    console.error('Copy budgets error:', error.message);
    return res.status(500).json({ message: 'Failed to copy budgets' });
  }
};

// Helper function to get current month in YYYY-MM format
function getCurrentMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

// Helper function to determine budget status
function getStatus(percentage) {
  if (percentage >= 100) return 'over';
  if (percentage >= 90) return 'critical';
  if (percentage >= 70) return 'warning';
  return 'good';
}
