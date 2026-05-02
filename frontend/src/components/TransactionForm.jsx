import { useEffect, useState } from 'react';
import { api } from '../api/axios.js';
// [CAT-PAGE ADDED]
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../utils/constants.js';

// ============================================================
// FILE: components/TransactionForm.jsx
// PURPOSE: Form for adding and editing transactions
// PHASE: UI Update & Categories
// CHANGES: Added category dropdown and validation
// ============================================================

const initialState = {
  description: '',
  amount: 0,
  type: 'income',
  category: '',
  date: new Date().toISOString().slice(0, 10),
};

// FUNCTION: TransactionForm()
// PURPOSE: Renders a form for creating or editing a transaction
// PARAMS:
//   transaction (object|null) — transaction to edit, or null for new
//   onSuccess (function)      — called after successful save
// RETURNS: Form element with inputs and validation
const TransactionForm = ({ transaction, onSuccess }) => {
  const [formState, setFormState] = useState(initialState);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (transaction) {
      setFormState({
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        // [CAT-PAGE ADDED] Include category from transaction
        category: transaction.category || '',
        date: transaction.date ? transaction.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
      });
      return;
    }
    setFormState(initialState);
  }, [transaction]);

  // [CAT-PAGE ADDED] Options change based on selected type
  // WHY: Income and expense have different relevant categories
  const categoryOptions = formState.type === 'income'
    ? INCOME_CATEGORIES
    : EXPENSE_CATEGORIES;

  // [CAT-PAGE ADDED] Reset category when type changes
  // WHY: Previously selected category may not belong to new type
  const handleTypeChange = (e) => {
    setFormState(prev => ({
      ...prev,
      type: e.target.value,
      category: ''
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    // [CAT-PAGE ADDED] Validate category before API call
    if (!formState.category) {
      setError('Please select a category');
      return;
    }

    setIsSubmitting(true);

    try {
      // [CAT-PAGE MODIFIED] Include category in request payload
      const payload = {
        type:        formState.type,
        amount:      formState.amount,
        description: formState.description,
        category:    formState.category,
        date:        formState.date
      };

      if (transaction) {
        await api.put(`/api/transactions/${transaction._id}`, payload);
      } else {
        await api.post('/api/transactions', payload);
      }
      setFormState(initialState);
      onSuccess();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to save transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-card">
      <h2>{transaction ? 'Edit Transaction' : 'Add Transaction'}</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Description
          <input
            type="text"
            name="description"
            value={formState.description}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Amount
          <input
            type="number"
            name="amount"
            min="0"
            step="0.01"
            value={formState.amount}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Type
          <select
            name="type"
            value={formState.type}
            onChange={handleTypeChange}
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </label>

        {/* [CAT-PAGE ADDED] Category dropdown — place after Type field */}
        <label>
          Category
          <select
            name="category"
            value={formState.category}
            onChange={handleChange}
            required
          >
            <option value="">Select a category</option>
            {categoryOptions.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </label>

        <label>
          Date
          <input
            type="date"
            name="date"
            value={formState.date}
            onChange={handleChange}
            required
          />
        </label>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" disabled={isSubmitting}>
          {transaction ? 'Update Transaction' : 'Add Transaction'}
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;
