import { useEffect, useState } from 'react';
import { api } from '../api/axios.js';

const initialState = {
  description: '',
  amount: 0,
  type: 'income',
  date: new Date().toISOString().slice(0, 10),
};

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
        date: transaction.date ? transaction.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
      });
      return;
    }
    setFormState(initialState);
  }, [transaction]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (transaction) {
        await api.put(`/api/transactions/${transaction._id}`, formState);
      } else {
        await api.post('/api/transactions', formState);
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
            value={formState.description}
            onChange={(event) => setFormState({ ...formState, description: event.target.value })}
            required
          />
        </label>
        <label>
          Amount
          <input
            type="number"
            min="0"
            step="0.01"
            value={formState.amount}
            onChange={(event) => setFormState({ ...formState, amount: Number(event.target.value) })}
            required
          />
        </label>
        <label>
          Type
          <select
            value={formState.type}
            onChange={(event) => setFormState({ ...formState, type: event.target.value })}
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </label>
        <label>
          Date
          <input
            type="date"
            value={formState.date}
            onChange={(event) => setFormState({ ...formState, date: event.target.value })}
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
