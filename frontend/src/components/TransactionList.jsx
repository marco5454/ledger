// ============================================================
// FILE: components/TransactionList.jsx
// PURPOSE: Renders transactions in a clean table layout
// PHASE: UI Update
// CHANGES: Converted from card layout to table-based display
// ============================================================

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { CURRENCY_SYMBOLS } from '../utils/constants.js';
import '../styles/TransactionTable.css';

// Minimal formatter for adding commas to numbers
const formatAmount = (amount) => {
  if (amount == null) return '0.00';
  return Number(amount).toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
};

// FUNCTION: TransactionList()
// PURPOSE: Renders all transactions as a formatted table
// PARAMS:
//   transactions (array)  — list of transaction objects
//   onEdit (function)     — called with transaction object on edit
//   onDelete (function)   — called with transaction._id on delete
//   sortField (string)   — current sort field ('date', 'category', 'amount')
//   sortDirection (string) — current sort direction ('asc', 'desc')
//   onSort (function)    — called with field name to change sort
// RETURNS: Table element with all transactions, or empty state

const TransactionList = ({ transactions, onEdit, onDelete, sortField, sortDirection, onSort }) => {
  const { currency } = useContext(AuthContext);
  const symbol = CURRENCY_SYMBOLS[currency] || '₱';

  // [SORT-MONTHLY ADDED] Helper function for sort indicators
  const getSortIndicator = (field) => {
    if (sortField !== field) return '';
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  // [UI UPDATE ADDED] Empty state handling
  if (!transactions.length) {
    return (
      <div className="empty-state-container">
        <p className="empty-state">No transactions yet.</p>
      </div>
    );
  }

  // [UI UPDATE ADDED] Render as table instead of card list
  return (
    <table className="transactions-table">
      {/* [UI UPDATE ADDED] Table header */}
      <thead>
        <tr>
          <th className="col-date sortable-header" onClick={() => onSort('date')}>
            Date{getSortIndicator('date')}
          </th>
          <th className="col-description">Description</th>
          {/* [CAT-PAGE ADDED] Category column header */}
          <th className="col-category sortable-header" onClick={() => onSort('category')}>
            Category{getSortIndicator('category')}
          </th>
          <th className="col-type">Type</th>
          <th className="col-amount sortable-header" onClick={() => onSort('amount')}>
            Amount{getSortIndicator('amount')}
          </th>
          <th className="col-actions">Actions</th>
        </tr>
      </thead>

      {/* [UI UPDATE ADDED] Table body with transaction rows */}
      <tbody>
        {transactions.map((transaction) => {
          const dateString = transaction.date
            ? new Date(transaction.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })
            : 'Unknown';

          const isIncome = transaction.type === 'income';
          const amountClass = isIncome ? 'positive' : 'negative';

          return (
            <tr key={transaction._id} className="transaction-row">
              {/* Date cell */}
              <td className="col-date">{dateString}</td>

              {/* Description cell */}
              <td className="col-description">{transaction.description}</td>

              {/* [CAT-PAGE ADDED] Category cell */}
              <td className="col-category">{transaction.category || '—'}</td>

              {/* Type badge cell */}
              <td className="col-type">
                <span className={`type-badge ${transaction.type}`}>
                  {isIncome ? 'Income' : 'Expense'}
                </span>
              </td>

              {/* Amount cell */}
              <td className={`col-amount ${amountClass}`}>
                {symbol}{formatAmount(transaction.amount)}
              </td>

              {/* Actions cell */}
              <td className="col-actions">
                <span className="action-link" onClick={() => onEdit(transaction)}>Edit</span>
                <span className="action-separator">|</span>
                <span className="action-link delete" onClick={() => onDelete(transaction._id)}>Delete</span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default TransactionList;

