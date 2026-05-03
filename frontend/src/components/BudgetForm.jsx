import { useState, useEffect } from 'react';
import { api } from '../api/axios';
import { EXPENSE_CATEGORIES } from '../utils/constants';

function BudgetForm({ budget, availableCategories, preselectedCategory, onSuccess }) {
  const [formData, setFormData] = useState({
    category: '',
    amount: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (budget) {
      setFormData({
        category: budget.category,
        amount: budget.budgetAmount
      });
    } else if (preselectedCategory) {
      setFormData({
        category: preselectedCategory,
        amount: ''
      });
    } else {
      setFormData({
        category: '',
        amount: ''
      });
    }
  }, [budget, preselectedCategory]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.category || !formData.amount) {
      setError('Category and amount are required');
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    setIsSubmitting(true);

    try {
      if (budget) {
        // Update existing budget
        await api.put(`/api/budgets/${budget._id}`, {
          amount: parseFloat(formData.amount)
        });
      } else {
        // Create new budget
        await api.post('/api/budgets', {
          category: formData.category,
          amount: parseFloat(formData.amount)
        });
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save budget');
      console.error('Error saving budget:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-card">
      <h2>{budget ? 'Edit Budget' : 'Add Budget'}</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Category
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            disabled={!!budget}
          >
            <option value="">Select a category</option>
            {budget ? (
              <option value={budget.category}>{budget.category}</option>
            ) : (
              availableCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))
            )}
          </select>
        </label>

        <label>
          Monthly Budget Amount
          <input
            type="number"
            name="amount"
            min="0"
            step="0.01"
            value={formData.amount}
            onChange={handleChange}
            required
            placeholder="Enter budget amount"
          />
        </label>

        {error && <p className="error-message">{error}</p>}

        <button type="submit" disabled={isSubmitting}>
          {budget ? 'Update Budget' : 'Create Budget'}
        </button>
      </form>
    </div>
  );
}

export default BudgetForm;