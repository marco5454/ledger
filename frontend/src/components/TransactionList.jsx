import { useState, useMemo, useContext } from 'react';
import { api } from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { exportTransactionsToCSV } from '../utils/exportCSV';
import TransactionItem from './TransactionItem';
import BulkActionsToolbar from './BulkActionsToolbar';

function TransactionList({ transactions = [], onTransactionDeleted, onTransactionEdit }) {
  const { currency } = useContext(AuthContext);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isBulkMode, setIsBulkMode] = useState(false);
  const itemsPerPage = 10;

  const filteredAndSortedTransactions = useMemo(() => {
    // Ensure transactions is an array
    const txArray = Array.isArray(transactions) ? transactions : [];
    let filtered = [...txArray];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(query) ||
        (t.category && t.category.toLowerCase().includes(query))
      );
    }

    // Apply type filter
    if (filter !== 'all') {
      filtered = filtered.filter(t => t.type === filter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.date) - new Date(a.date);
        case 'date-asc':
          return new Date(a.date) - new Date(b.date);
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

    return filtered;
  }, [transactions, filter, sortBy, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredAndSortedTransactions.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, filter, sortBy]);

  // Bulk operations handlers
  const handleSelectAll = () => {
    if (selectedIds.size === currentTransactions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(currentTransactions.map(t => t._id)));
    }
  };

  const handleSelectTransaction = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.size} transaction(s)?`)) {
      return;
    }

    try {
      await Promise.all(
        Array.from(selectedIds).map(id => api.delete(`/api/transactions/${id}`))
      );
      setSelectedIds(new Set());
      setIsBulkMode(false);
      // Trigger parent refresh
      if (onTransactionDeleted) {
        onTransactionDeleted();
      }
    } catch (err) {
      console.error('Error deleting transactions:', err);
      alert('Failed to delete some transactions');
    }
  };

  const handleBulkCategoryChange = async (newCategory) => {
    try {
      await Promise.all(
        Array.from(selectedIds).map(id => 
          api.put(`/api/transactions/${id}`, { category: newCategory })
        )
      );
      setSelectedIds(new Set());
      setIsBulkMode(false);
      // Trigger parent refresh
      if (onTransactionDeleted) {
        onTransactionDeleted();
      }
    } catch (err) {
      console.error('Error updating categories:', err);
      alert('Failed to update some transactions');
    }
  };

  const handleBulkExport = () => {
    const selectedTransactions = transactions.filter(t => selectedIds.has(t._id));
    exportTransactionsToCSV(selectedTransactions, currency, 'selected_transactions');
  };

  const handleCancelBulk = () => {
    setSelectedIds(new Set());
    setIsBulkMode(false);
  };

  return (
    <div className="transaction-list">
      {isBulkMode && selectedIds.size > 0 && (
        <BulkActionsToolbar
          selectedCount={selectedIds.size}
          onBulkDelete={handleBulkDelete}
          onBulkCategoryChange={handleBulkCategoryChange}
          onBulkExport={handleBulkExport}
          onCancel={handleCancelBulk}
        />
      )}

      <div className="transaction-list-header">
        <h2>Transactions ({filteredAndSortedTransactions.length})</h2>
        <button
          onClick={() => setIsBulkMode(!isBulkMode)}
          className={`btn-bulk-toggle ${isBulkMode ? 'active' : ''}`}
        >
          {isBulkMode ? 'Cancel Selection' : 'Select Multiple'}
        </button>
      </div>
      
      <div className="transaction-search-controls">
        <input
          type="text"
          placeholder="Search by description or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <div className="transaction-controls">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>
        </div>
      </div>

      {filteredAndSortedTransactions.length === 0 ? (
        <div className="empty-state">
          <p>No transactions found</p>
        </div>
      ) : (
        <>
          {isBulkMode && (
            <div className="bulk-select-all">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedIds.size === currentTransactions.length && currentTransactions.length > 0}
                  onChange={handleSelectAll}
                />
                <span>Select All on Page</span>
              </label>
            </div>
          )}

          <div className="transactions">
            {currentTransactions.map(transaction => (
              <div key={transaction._id} className="transaction-wrapper">
                {isBulkMode && (
                  <div className="transaction-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(transaction._id)}
                      onChange={() => handleSelectTransaction(transaction._id)}
                    />
                  </div>
                )}
                <TransactionItem
                  transaction={transaction}
                  onDelete={onTransactionDeleted}
                  onEdit={onTransactionEdit}
                />
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                Previous
              </button>
              
              <div className="pagination-info">
                Page {currentPage} of {totalPages} ({filteredAndSortedTransactions.length} total)
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default TransactionList;