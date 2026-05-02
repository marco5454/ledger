import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { CURRENCY_SYMBOLS } from '../utils/constants.js';

const TransactionItem = ({ transaction, onEdit, onDelete }) => {
  const { currency } = useContext(AuthContext);
  const symbol = CURRENCY_SYMBOLS[currency] || '₱';
  const dateString = transaction.date ? new Date(transaction.date).toLocaleDateString() : 'Unknown';
  const amountClass = transaction.type === 'income' ? 'positive' : 'negative';

  return (
    <div className={`transaction-item ${amountClass}`}>
      <div>
        <h3>{transaction.description}</h3>
        <p>{dateString}</p>
      </div>
      <div className="transaction-meta">
        <span>{transaction.type}</span>
        <strong>{symbol}{transaction.amount.toFixed(2)}</strong>
      </div>
      <div className="transaction-actions">
        <button type="button" onClick={onEdit}>Edit</button>
        <button type="button" onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
};

export default TransactionItem;
