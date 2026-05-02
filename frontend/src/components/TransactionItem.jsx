// ============================================================
// FILE: components/TransactionItem.jsx
// PURPOSE: Renders one transaction as a table row (DEPRECATED)
// PHASE: UI Update
// NOTE: This component is no longer used — TransactionList now
//       renders table rows directly. Kept for reference/future use.
// ============================================================

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { CURRENCY_SYMBOLS } from '../utils/constants.js';

// FUNCTION: TransactionItem()
// PURPOSE: Legacy table row component — no longer used
// PARAMS:
//   transaction (object) — transaction to display
//   onEdit (function)    — called when edit button clicked
//   onDelete (function)  — called when delete button clicked
// RETURNS: Table row <tr> element with transaction data
// [UI UPDATE ADDED] Marked as deprecated — use TransactionList directly
const TransactionItem = ({ transaction, onEdit, onDelete }) => {
  const { currency } = useContext(AuthContext);
  const symbol = CURRENCY_SYMBOLS[currency] || '₱';
  
  const dateString = transaction.date
    ? new Date(transaction.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : 'Unknown';
  
  const isIncome = transaction.type === 'income';

  return (
    <tr className="transaction-row">
      <td className="col-date">{dateString}</td>
      <td className="col-description">{transaction.description}</td>
      <td className="col-type">
        <span className={`type-badge ${transaction.type}`}>
          {isIncome ? 'Income' : 'Expense'}
        </span>
      </td>
      <td className={`col-amount ${isIncome ? 'positive' : 'negative'}`}>
        {symbol}{transaction.amount.toFixed(2)}
      </td>
      <td className="col-actions">
        <button
          type="button"
          className="action-btn edit-btn"
          onClick={() => onEdit(transaction)}
          title="Edit transaction"
        >
          ✏️
        </button>
        <button
          type="button"
          className="action-btn delete-btn"
          onClick={() => onDelete(transaction._id)}
          title="Delete transaction"
        >
          🗑️
        </button>
      </td>
    </tr>
  );
};

export default TransactionItem;
