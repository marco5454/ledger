import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { CURRENCY_SYMBOLS } from '../utils/constants.js';

// ============================================================
// FILE: components/RecurringItem.jsx
// PURPOSE: Display a single recurring transaction in a list
// PHASE: Recurring Transactions Feature
// ============================================================

const RecurringItem = ({ recurring, onEdit, onDelete, onToggle }) => {
  const { currency } = useContext(AuthContext);
  const currencySymbol = CURRENCY_SYMBOLS[currency] || '$';

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFrequencyLabel = (frequency) => {
    const labels = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      yearly: 'Yearly'
    };
    return labels[frequency] || frequency;
  };

  const getNextDueDate = () => {
    const lastGen = recurring.last_generated_date 
      ? new Date(recurring.last_generated_date)
      : new Date(recurring.start_date);
    
    const next = new Date(lastGen);
    
    switch (recurring.frequency) {
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
    }
    
    return next;
  };

  const nextDue = getNextDueDate();
  const isOverdue = nextDue < new Date() && recurring.is_active;

  return (
    <div className={`recurring-item ${recurring.is_active ? 'active' : 'inactive'}`}>
      <div className="recurring-item-header">
        <div className="recurring-item-title">
          <h4>{recurring.title}</h4>
          <span className={`recurring-badge ${recurring.type}`}>
            {recurring.type === 'income' ? '↑' : '↓'} {recurring.type}
          </span>
          <span className="recurring-badge frequency">
            {getFrequencyLabel(recurring.frequency)}
          </span>
          {!recurring.is_active && (
            <span className="recurring-badge paused">Paused</span>
          )}
          {isOverdue && (
            <span className="recurring-badge overdue">Due</span>
          )}
        </div>
        <div className="recurring-item-amount">
          <span className={recurring.type === 'income' ? 'amount-income' : 'amount-expense'}>
            {currencySymbol}{parseFloat(recurring.amount).toFixed(2)}
          </span>
        </div>
      </div>
      
      <div className="recurring-item-details">
        <p className="recurring-description">{recurring.description}</p>
        <p className="recurring-category">Category: <strong>{recurring.category}</strong></p>
        <p className="recurring-dates">
          Started: <strong>{formatDate(recurring.start_date)}</strong>
          {recurring.last_generated_date && (
            <> | Last Generated: <strong>{formatDate(recurring.last_generated_date)}</strong></>
          )}
          {recurring.is_active && (
            <> | Next Due: <strong>{formatDate(nextDue)}</strong></>
          )}
        </p>
      </div>

      <div className="recurring-item-actions">
        <span
          onClick={() => onToggle(recurring._id)}
          className="action-link"
          title={recurring.is_active ? 'Pause' : 'Resume'}
        >
          {recurring.is_active ? 'Pause' : 'Resume'}
        </span>
        <span className="action-separator">|</span>
        <span
          onClick={() => onEdit(recurring)}
          className="action-link"
          title="Edit"
        >
          Edit
        </span>
        <span className="action-separator">|</span>
        <span
          onClick={() => onDelete(recurring._id)}
          className="action-link delete"
          title="Delete"
        >
          Delete
        </span>
      </div>
    </div>
  );
};

export default RecurringItem;