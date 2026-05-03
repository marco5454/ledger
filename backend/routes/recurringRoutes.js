// Recurring transaction route definitions with authentication.
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getRecurringTransactions,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
  toggleRecurringTransaction,
  processRecurringTransactions,
} = require('../controllers/recurringController');

const router = express.Router();

router.use(authMiddleware);
router.get('/', getRecurringTransactions);
router.post('/', createRecurringTransaction);
router.put('/:id', updateRecurringTransaction);
router.delete('/:id', deleteRecurringTransaction);
router.patch('/:id/toggle', toggleRecurringTransaction);
router.post('/process', processRecurringTransactions);

module.exports = router;