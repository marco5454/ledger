import { useCallback, useContext, useEffect, useState, useMemo } from 'react';
import { api } from '../api/axios.js';
import { AuthContext } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import BalanceSummary from '../components/BalanceSummary.jsx';
import TransactionForm from '../components/TransactionForm.jsx';
import TransactionList from '../components/TransactionList.jsx';
import Modal from '../components/Modal.jsx'; // [UI UPDATE ADDED]
import '../styles/Dashboard.css'; // [UI UPDATE ADDED]
// [CAT-PAGE ADDED]
import { ALL_CATEGORIES, DEFAULT_PAGE_LIMIT } from '../utils/constants.js';
// [SORT-MONTHLY ADDED]
import MonthlySummary from '../components/MonthlySummary.jsx';

const Dashboard = () => {
  // [SETTINGS MODIFIED] Read fullName and currency from context
  const { logout, fullName, currency } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // [UI UPDATE ADDED] Modal state for add/edit transaction
  const [showModal, setShowModal] = useState(false);
  
  // [UI UPDATE ADDED] Track which transaction is being edited
  // null means we are adding a new transaction
  const [editingTransaction, setEditingTransaction] = useState(null);

  // [CAT-PAGE ADDED] Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [totalCount, setTotalCount]   = useState(0);

  // [CAT-PAGE ADDED] Filter state
  const [searchQuery,      setSearchQuery]      = useState('');
  const [filterType,       setFilterType]       = useState('all');
  const [filterCategory,   setFilterCategory]   = useState('all');
  const [filterDateFrom,   setFilterDateFrom]   = useState('');
  const [filterDateTo,     setFilterDateTo]     = useState('');

  // [SORT-MONTHLY ADDED] Sort state
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  // [CAT-PAGE ADDED] Full dataset for balance summary
  // Separate from paginated transactions so balance totals
  // always reflect ALL records not just the current page
  const [allTransactions, setAllTransactions]   = useState([]);

  // [CAT-PAGE MODIFIED] fetchTransactions()
  // PURPOSE: Fetches one page of transactions
  // Also fetches full dataset separately for balance summary
  const fetchTransactions = useCallback(async (page = 1) => {
    try {
      setLoading(true);

      // Paginated fetch for the table
      const res = await api.get(
        `/api/transactions?page=${page}&limit=${DEFAULT_PAGE_LIMIT}`
      );
      setTransactions(res.data.transactions);
      setTotalPages(res.data.totalPages);
      setTotalCount(res.data.totalCount);
      setCurrentPage(res.data.currentPage);

      // [CAT-PAGE ADDED] Full fetch for balance summary only
      // Uses high limit to get all records in one call
      const allRes = await api.get(
        `/api/transactions?page=1&limit=9999`
      );
      setAllTransactions(allRes.data.transactions);

    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load transactions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions(currentPage);
  }, [currentPage, fetchTransactions]);

  // [CAT-PAGE ADDED] filteredTransactions
  // PURPOSE: Applies all active filters to current page data
  // Runs on frontend — no extra API call needed
  // useMemo prevents recalculation on unrelated re-renders
  const filteredTransactions = useMemo(() => {
    let filtered = transactions.filter(t => {

      const matchesSearch =
        searchQuery === '' ||
        t.description.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        t.category?.toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesType =
        filterType === 'all' || t.type === filterType;

      const matchesCategory =
        filterCategory === 'all' || t.category === filterCategory;

      const txDate = new Date(t.date);
      const matchesFrom =
        filterDateFrom === '' ||
        txDate >= new Date(filterDateFrom);
      const matchesTo =
        filterDateTo === '' ||
        txDate <= new Date(filterDateTo);

      return matchesSearch && matchesType &&
             matchesCategory && matchesFrom && matchesTo;
    });

    // [SORT-MONTHLY ADDED] Apply sorting
    filtered.sort((a, b) => {
      let aVal, bVal;

      switch (sortField) {
        case 'date':
          aVal = new Date(a.date);
          bVal = new Date(b.date);
          break;
        case 'category':
          aVal = a.category || '';
          bVal = b.category || '';
          break;
        case 'amount':
          aVal = a.amount;
          bVal = b.amount;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [
    transactions, searchQuery, filterType,
    filterCategory, filterDateFrom, filterDateTo,
    sortField, sortDirection
  ]);

  // [CAT-PAGE ADDED] hasActiveFilters
  // PURPOSE: Controls visibility of Clear Filters button
  const hasActiveFilters =
    searchQuery || filterType !== 'all' ||
    filterCategory !== 'all' ||
    filterDateFrom || filterDateTo;

  // [CAT-PAGE ADDED] handleClearFilters()
  // PURPOSE: Resets all filter and search state to defaults
  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterType('all');
    setFilterCategory('all');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  // [SORT-MONTHLY ADDED] handleSort()
  // PURPOSE: Toggles sort direction or changes sort field
  // PARAMS: field (string) - 'date', 'category', or 'amount'
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to desc
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // [CAT-PAGE ADDED] handlePageChange()
  // PURPOSE: Updates current page — triggers useEffect refetch
  // PARAMS: newPage (number)
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  // [UI UPDATE ADDED] FUNCTION: handleAddClick()
  // PURPOSE: Opens modal in "add" mode
  // Sets showModal true and clears editingTransaction
  const handleAddClick = () => {
    setEditingTransaction(null);
    setShowModal(true);
  };

  // [UI UPDATE ADDED] FUNCTION: handleEditClick()
  // PURPOSE: Opens modal in "edit" mode with transaction data
  // PARAMS: transaction (object) — the transaction to edit
  const handleEditClick = (transaction) => {
    setEditingTransaction(transaction);
    setShowModal(true);
  };

  // [UI UPDATE ADDED] FUNCTION: handleModalClose()
  // PURPOSE: Closes modal and clears editing state
  const handleModalClose = () => {
    setShowModal(false);
    setEditingTransaction(null);
  };

  // [UI UPDATE ADDED] FUNCTION: handleTransactionSaved()
  // PURPOSE: Called after form saves successfully
  // Closes modal and refreshes transaction list
  const handleTransactionSaved = async () => {
    handleModalClose();
    setCurrentPage(1);
    await fetchTransactions(1);
  };

  // FUNCTION: handleDeleteTransaction()
  // PURPOSE: Delete a transaction after user confirmation
  // PARAMS: transactionId (string) — the ID to delete
  const handleDeleteTransaction = async (transactionId) => {
    if (!window.confirm('Delete this transaction?')) {
      return;
    }
    try {
      await api.delete(`/api/transactions/${transactionId}`);
      await fetchTransactions(currentPage);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Delete failed.');
    }
  };

  // [UI UPDATE MODIFIED] Get today's date formatted
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="dashboard-page">
      <Navbar onLogout={logout} />
      
      {/* [UI UPDATE ADDED] Top bar with welcome and add button */}
      <div className="dashboard-top-bar">
        <div className="welcome-section">
          <h2>Welcome back, {fullName || 'User'}!</h2>
          <p className="date-subtext">{formattedDate}</p>
        </div>
        <button
          className="btn-add-transaction"
          onClick={handleAddClick}
        >
          + Add Transaction
        </button>
      </div>

      {/* [UI UPDATE MODIFIED] Main content area */}
      <main className="dashboard-content">
        {/* Balance summary cards */}
        {/* [CAT-PAGE MODIFIED] Use full dataset for accurate totals */}
        <BalanceSummary transactions={allTransactions} />

        {/* [SORT-MONTHLY ADDED] Monthly summary section */}
        <MonthlySummary transactions={allTransactions} />

        {/* Error message */}
        {error && <p className="error-message">{error}</p>}

        {/* [CAT-PAGE ADDED] Search and filter controls */}
        <section className="filters-section">
          <div className="filter-controls">
            {/* [CAT-PAGE ADDED] Search input */}
            <input
              type="text"
              placeholder="Search description or category..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="search-input"
            />

            {/* [CAT-PAGE ADDED] Filter controls */}
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              {ALL_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <input
              type="date"
              value={filterDateFrom}
              onChange={e => setFilterDateFrom(e.target.value)}
              className="filter-input"
              title="From date"
            />
            <input
              type="date"
              value={filterDateTo}
              onChange={e => setFilterDateTo(e.target.value)}
              className="filter-input"
              title="To date"
            />

            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="btn-clear-filters"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* [CAT-PAGE ADDED] Results count */}
          <p className="results-count">
            Showing {filteredTransactions.length} of {totalCount} transactions
            {hasActiveFilters && ' (filtered)'}
          </p>
        </section>

        {/* [UI UPDATE ADDED] Transaction history section */}
        <section className="transactions-section">
          <div className="section-header">
            <h3>Transaction History</h3>
            <span className="transaction-count">({filteredTransactions.length})</span>
          </div>

          {/* [CAT-PAGE MODIFIED] Table uses filtered list */}
          <TransactionList
            transactions={filteredTransactions}
            onEdit={handleEditClick}
            onDelete={handleDeleteTransaction}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />

          {/* [CAT-PAGE ADDED] Pagination — only show if more than 1 page */}
          {totalPages > 1 && (
            <div className="pagination-controls">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                Previous
              </button>

              {/* Page number buttons — max 5 visible at a time */}
              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page =>
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 2
                  )
                  .map((page, index, arr) => (
                    <div key={page}>
                      {index > 0 && arr[index-1] !== page - 1 && (
                        <span className="ellipsis">...</span>
                      )}
                      <button
                        onClick={() => handlePageChange(page)}
                        disabled={page === currentPage}
                        className={`page-btn ${page === currentPage ? 'active' : ''}`}
                      >
                        {page}
                      </button>
                    </div>
                  ))
                }
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}

          {/* Page info */}
          {totalPages > 1 && (
            <p className="page-info">
              Page {currentPage} of {totalPages}
            </p>
          )}
        </section>
      </main>

      {/* [UI UPDATE ADDED] Modal for add/edit transaction */}
      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        title={editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
      >
        <TransactionForm
          transaction={editingTransaction}
          onSuccess={handleTransactionSaved}
        />
      </Modal>
    </div>
  );
};

export default Dashboard;
