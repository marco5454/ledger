import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CURRENCY_SYMBOLS } from '../utils/constants';

function TransactionItem({ transaction, onDelete, onEdit }) {
  const { currency } = useContext(AuthContext);
  const symbol = CURRENCY_SYMBOLS[currency] || '₱';

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    return Number(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className={`transaction-item ${transaction.type}`}>
      <div className="transaction-info">
        <div className="transaction-date">{formatDate(transaction.date)}</div>
        <div className="transaction-description">{transaction.description}</div>
        {transaction.category && (
          <div className="transaction-category">{transaction.category}</div>
        )}
      </div>
      <div className="transaction-details">
        <div className={`transaction-amount ${transaction.type}`}>
          {transaction.type === 'income' ? '+' : '-'}{symbol}{formatAmount(transaction.amount)}
        </div>
        <div className="transaction-actions">
          <span
            onClick={() => onEdit(transaction)}
            className="action-link"
            title="Edit transaction"
          >
            Edit
          </span>
          <span className="action-separator">|</span>
          <span
            onClick={() => onDelete(transaction._id)}
            className="action-link delete"
            title="Delete transaction"
          >
            Delete
          </span>
        </div>
      </div>
    </div>
  );
}

export default TransactionItem;