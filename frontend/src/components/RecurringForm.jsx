import { useEffect, useState } from 'react';
import { api } from '../api/axios.js';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../utils/constants.js';

// ============================================================
// FILE: components/RecurringForm.jsx
// PURPOSE: Form for adding and editing recurring transactions
// PHASE: Recurring Transactions Feature
// ============================================================

const initialState = {
  title: '',
  description: '',
  amount: '',
  type: 'income',
  category: '',
  frequency: 'monthly',
  start_date: new Date().toISOString().slice(0, 10),
};

const RecurringForm = ({ recurring, onSuccess }) => {
  const [formState, setFormState] = useState(initialState);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (recurring) {
      setFormState({
        title: recurring.title,
        description: recurring.description,
        amount: recurring.amount,
        type: recurring.type,
        category: recurring.category || '',
        frequency: recurring.frequency,
        start_date: recurring.start_date ? recurring.start_date.slice(0, 10) : new Date().toISOString().slice(0, 10),
      });
      return;
    }
    setFormState(initialState);
  }, [recurring]);

  const categoryOptions = formState.type === 'income'
    ? INCOME_CATEGORIES
    : EXPENSE_CATEGORIES;

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
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!formState.category) {
      setError('Please select a category');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: formState.title,
        description: formState.description,
        amount: formState.amount,
        type: formState.type,
        category: formState.category,
        frequency: formState.frequency,
        start_date: formState.start_date
      };

      if (recurring) {
        await api.put(`/api/recurring/${recurring._id}`, payload);
      } else {
        await api.post('/api/recurring', payload);
      }
      setFormState(initialState);
      onSuccess();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to save recurring transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-card">
      <h2>{recurring ? 'Edit Recurring Transaction' : 'Add Recurring Transaction'}</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Title
          <input
            type="text"
            name="title"
            value={formState.title}
            onChange={handleChange}
            placeholder="e.g., Monthly Rent"
            required
          />
        </label>
        <label>
          Description
          <input
            type="text"
            name="description"
            value={formState.description}
            onChange={handleChange}
            placeholder="e.g., Apartment rent payment"
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
          Frequency
          <select
            name="frequency"
            value={formState.frequency}
            onChange={handleChange}
            required
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </label>
        <label>
          Start Date
          <input
            type="date"
            name="start_date"
            value={formState.start_date}
            onChange={handleChange}
            required
          />
        </label>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" disabled={isSubmitting}>
          {recurring ? 'Update Recurring Transaction' : 'Add Recurring Transaction'}
        </button>
      </form>
    </div>
  );
};

export default RecurringForm;