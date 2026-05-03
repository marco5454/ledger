import { useCallback, useContext, useEffect, useState, useMemo } from 'react';
import { api } from '../api/axios.js';
import { AuthContext } from '../context/AuthContext.jsx';
import BalanceSummary from '../components/BalanceSummary.jsx';
import TransactionForm from '../components/TransactionForm.jsx';
import TransactionList from '../components/TransactionList.jsx';
import Modal from '../components/Modal.jsx'; // [UI UPDATE ADDED]
// [CAT-PAGE ADDED]
import { ALL_CATEGORIES, DEFAULT_PAGE_LIMIT } from '../utils/constants.js';
// [SORT-MONTHLY ADDED]
import MonthlySummary from '../components/MonthlySummary.jsx';
// [CSV ADDED] Import export utility
import { exportTransactionsToCSV } from '../utils/exportCSV';

const Dashboard = () => {
  // [SETTINGS MODIFIED] Read fullName and currency from context
  const { fullName, currency } = useContext(AuthContext);
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

  // FUNCTION: handleExportCSV()
  // PURPOSE: Determines which dataset to export then calls
  //          the CSV utility function
  // If filters are active: export filteredTransactions
  //   WHY: User filtered for a reason — export what they see
  // If no filters active: export allTransactions
  //   WHY: Full history export when nothing is filtered
  // Filename reflects what was exported for clarity
  const handleExportCSV = () => {
    // [CSV ADDED]
    const dataToExport = hasActiveFilters
      ? filteredTransactions
      : allTransactions;

    const filename = hasActiveFilters
      ? 'filtered_transactions'
      : 'all_transactions';

    exportTransactionsToCSV(dataToExport, currency, filename);
  };

  return (
    <div className="dashboard-page">
      {/* [UI UPDATE MODIFIED] Main content area */}
      <main className="dashboard-content">
        {/* Balance summary cards - PROMINENT */}
        {/* [CAT-PAGE MODIFIED] Use full dataset for accurate totals */}
        <div className="balance-summary-wrapper">
          <BalanceSummary transactions={allTransactions} />
          <button
            className="btn-add-transaction-compact"
            onClick={handleAddClick}
            title="Add new transaction"
          >
            + Add Transaction
          </button>
        </div>

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
              placeholder="Start Date"
            />
            <input
              type="date"
              value={filterDateTo}
              onChange={e => setFilterDateTo(e.target.value)}
              className="filter-input"
              title="To date"
              placeholder="End Date"
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
            <div className="section-header-left">
              <h3>Transaction History <span className="transaction-count">({filteredTransactions.length})</span></h3>
            </div>
            <div className="section-header-right">
              <button onClick={handleExportCSV} className="btn-export-csv">
                Export CSV ↓
              </button>
              <p className="export-info">
                {hasActiveFilters
                  ? `Exports ${filteredTransactions.length} filtered transactions`
                  : `Exports all ${allTransactions.length} transactions`
                }
              </p>
            </div>
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

      {/* Minimalist Footer */}
      <footer className="dashboard-footer">
        <div className="footer-content">
          <div className="footer-company">
            <p className="company-name">M.M I.T Solutions</p>
            <p className="copyright">© 2026 M.M I.T Solutions. All rights reserved.</p>
          </div>
          <div className="footer-contact">
            <span className="contact-item">
              <svg className="contact-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 16.92V19.92C22 20.4728 21.5523 20.92 21 20.92H3C2.44772 20.92 2 20.4728 2 19.92V16.92M16 11.92L12 15.92M12 15.92L8 11.92M12 15.92V3.92" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              00000000000
            </span>
            <a href="mailto:contact@mmitsolutions.com" className="contact-item" aria-label="Email">
              <svg className="contact-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a href="https://messenger.com" target="_blank" rel="noopener noreferrer" className="contact-item" aria-label="Messenger">
              <svg className="contact-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.5 2 2 6.14 2 11.25C2 14.13 3.42 16.69 5.65 18.36V22L9.14 20.14C10.03 20.38 10.99 20.5 12 20.5C17.5 20.5 22 16.36 22 11.25C22 6.14 17.5 2 12 2ZM13.03 14.41L10.63 11.83L5.87 14.41L11.07 8.91L13.53 11.49L18.23 8.91L13.03 14.41Z" fill="currentColor"/>
              </svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="contact-item" aria-label="LinkedIn">
              <svg className="contact-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 8C17.5913 8 19.1174 8.63214 20.2426 9.75736C21.3679 10.8826 22 12.4087 22 14V21H18V14C18 13.4696 17.7893 12.9609 17.4142 12.5858C17.0391 12.2107 16.5304 12 16 12C15.4696 12 14.9609 12.2107 14.5858 12.5858C14.2107 12.9609 14 13.4696 14 14V21H10V14C10 12.4087 10.6321 10.8826 11.7574 9.75736C12.8826 8.63214 14.4087 8 16 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 9H2V21H6V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 6C5.10457 6 6 5.10457 6 4C6 2.89543 5.10457 2 4 2C2.89543 2 2 2.89543 2 4C2 5.10457 2.89543 6 4 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a href="https://portfolio.com" target="_blank" rel="noopener noreferrer" className="contact-item" aria-label="Portfolio">
              <svg className="contact-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 3C14.5 6 16 9 16 12C16 15 14.5 18 12 21M12 3C9.5 6 8 9 8 12C8 15 9.5 18 12 21M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
