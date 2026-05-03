// Controller for recurring transaction CRUD operations and generation logic.
const RecurringTransaction = require('../models/RecurringTransaction');
const Transaction = require('../models/Transaction');

// Helper function to calculate next due date based on frequency
const calculateNextDate = (lastDate, frequency) => {
  const next = new Date(lastDate);
  
  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
    default:
      throw new Error('Invalid frequency');
  }
  
  return next;
};

// Get all recurring transactions for logged-in user
exports.getRecurringTransactions = async (req, res) => {
  try {
    const recurring = await RecurringTransaction.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    
    return res.status(200).json({ recurring });
  } catch (error) {
    console.error('Get recurring transactions error:', error.message);
    return res.status(500).json({ message: 'Failed to load recurring transactions' });
  }
};

// Create a new recurring transaction
exports.createRecurringTransaction = async (req, res) => {
  try {
    const { title, description, amount, type, category, frequency, start_date } = req.body;

    // Validate required fields
    if (!title || !description || !amount || !type || !category || !frequency || !start_date) {
      return res.status(400).json({ 
        message: 'All fields are required: title, description, amount, type, category, frequency, start_date' 
      });
    }

    // Set last_generated_date to one day before start_date
    // This ensures first generation happens on start_date
    const startDate = new Date(start_date);
    const lastGenDate = new Date(startDate);
    lastGenDate.setDate(lastGenDate.getDate() - 1);

    const recurring = await RecurringTransaction.create({
      user: req.user.id,
      title,
      description,
      amount,
      type,
      category,
      frequency,
      start_date: startDate,
      last_generated_date: lastGenDate,
      is_active: true,
    });

    return res.status(201).json({ recurring });
  } catch (error) {
    console.error('Create recurring transaction error:', error.message);
    return res.status(500).json({ message: 'Failed to create recurring transaction' });
  }
};

// Update a recurring transaction
exports.updateRecurringTransaction = async (req, res) => {
  try {
    const recurringId = req.params.id;
    const { title, description, amount, type, category, frequency, start_date, is_active } = req.body;

    const recurring = await RecurringTransaction.findOne({
      _id: recurringId,
      user: req.user.id,
    });

    if (!recurring) {
      return res.status(404).json({ message: 'Recurring transaction not found' });
    }

    // Update fields if provided
    if (title !== undefined) recurring.title = title;
    if (description !== undefined) recurring.description = description;
    if (amount !== undefined) recurring.amount = amount;
    if (type !== undefined) recurring.type = type;
    if (category !== undefined) recurring.category = category;
    if (frequency !== undefined) recurring.frequency = frequency;
    if (start_date !== undefined) recurring.start_date = new Date(start_date);
    if (is_active !== undefined) recurring.is_active = is_active;

    await recurring.save();

    return res.status(200).json({ recurring });
  } catch (error) {
    console.error('Update recurring transaction error:', error.message);
    return res.status(500).json({ message: 'Failed to update recurring transaction' });
  }
};

// Delete a recurring transaction
exports.deleteRecurringTransaction = async (req, res) => {
  try {
    const recurringId = req.params.id;

    const recurring = await RecurringTransaction.findOneAndDelete({
      _id: recurringId,
      user: req.user.id,
    });

    if (!recurring) {
      return res.status(404).json({ message: 'Recurring transaction not found' });
    }

    return res.status(200).json({ message: 'Recurring transaction deleted successfully' });
  } catch (error) {
    console.error('Delete recurring transaction error:', error.message);
    return res.status(500).json({ message: 'Failed to delete recurring transaction' });
  }
};

// Toggle active status of a recurring transaction
exports.toggleRecurringTransaction = async (req, res) => {
  try {
    const recurringId = req.params.id;

    const recurring = await RecurringTransaction.findOne({
      _id: recurringId,
      user: req.user.id,
    });

    if (!recurring) {
      return res.status(404).json({ message: 'Recurring transaction not found' });
    }

    recurring.is_active = !recurring.is_active;
    await recurring.save();

    return res.status(200).json({ recurring });
  } catch (error) {
    console.error('Toggle recurring transaction error:', error.message);
    return res.status(500).json({ message: 'Failed to toggle recurring transaction' });
  }
};

// Process recurring transactions and generate due transactions
exports.processRecurringTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    // Get all active recurring transactions for this user
    const recurringList = await RecurringTransaction.find({
      user: userId,
      is_active: true,
    });

    let generatedCount = 0;

    for (const recurring of recurringList) {
      let nextDueDate = calculateNextDate(recurring.last_generated_date, recurring.frequency);
      
      // Generate all missed occurrences up to today
      while (nextDueDate <= today) {
        // Create the transaction
        await Transaction.create({
          user: userId,
          type: recurring.type,
          amount: recurring.amount,
          description: recurring.description,
          category: recurring.category,
          date: nextDueDate,
        });

        // Update last_generated_date
        recurring.last_generated_date = nextDueDate;
        generatedCount++;

        // Calculate next due date
        nextDueDate = calculateNextDate(nextDueDate, recurring.frequency);
      }

      // Save updated last_generated_date
      if (generatedCount > 0) {
        await recurring.save();
      }
    }

    return res.status(200).json({ 
      message: `Processed recurring transactions successfully`,
      generatedCount 
    });
  } catch (error) {
    console.error('Process recurring transactions error:', error.message);
    return res.status(500).json({ message: 'Failed to process recurring transactions' });
  }
};