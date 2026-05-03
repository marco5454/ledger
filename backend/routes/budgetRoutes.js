// Routes for budget management
const express = require('express');
const router = express.Router();
const {
  getBudgets,
  getBudgetStatus,
  createOrUpdateBudget,
  updateBudget,
  deleteBudget,
  getCategoryAnalysis,
  copyBudgetsFromMonth
} = require('../controllers/budgetController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// GET /api/budgets - Get all budgets for current month
router.get('/', getBudgets);

// GET /api/budgets/status - Get budget status with spending calculations
router.get('/status', getBudgetStatus);

// GET /api/budgets/category-analysis - Get spending analysis across all categories
router.get('/category-analysis', getCategoryAnalysis);

// POST /api/budgets/copy-from-month - Copy budgets from a previous month
router.post('/copy-from-month', copyBudgetsFromMonth);

// POST /api/budgets - Create or update a budget
router.post('/', createOrUpdateBudget);

// PUT /api/budgets/:id - Update a specific budget
router.put('/:id', updateBudget);

// DELETE /api/budgets/:id - Delete a budget
router.delete('/:id', deleteBudget);

module.exports = router;