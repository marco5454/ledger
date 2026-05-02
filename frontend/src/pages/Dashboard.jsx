import { useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../api/axios.js';
import { AuthContext } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import BalanceSummary from '../components/BalanceSummary.jsx';
import TransactionForm from '../components/TransactionForm.jsx';
import TransactionList from '../components/TransactionList.jsx';
import Modal from '../components/Modal.jsx'; // [UI UPDATE ADDED]
import '../styles/Dashboard.css'; // [UI UPDATE ADDED]

const Dashboard = () => {
  // [SETTINGS MODIFIED] Read fullName and currency from context
  const { logout, fullName, currency } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');

  // [UI UPDATE ADDED] Modal state for add/edit transaction
  const [showModal, setShowModal] = useState(false);
  
  // [UI UPDATE ADDED] Track which transaction is being edited
  // null means we are adding a new transaction
  const [editingTransaction, setEditingTransaction] = useState(null);

  // FUNCTION: loadTransactions()
  // PURPOSE: Fetch all transactions from API
  // RETURNS: Updates state with transaction list or error
  const loadTransactions = useCallback(async () => {
    try {
      const response = await api.get('/api/transactions');
      setTransactions(response.data.transactions);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load transactions.');
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

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
    await loadTransactions();
  };

  // FUNCTION: handleDelete()
  // PURPOSE: Delete a transaction after user confirmation
  // PARAMS: transactionId (string) — the ID to delete
  const handleDelete = async (transactionId) => {
    if (!window.confirm('Delete this transaction?')) {
      return;
    }
    try {
      await api.delete(`/api/transactions/${transactionId}`);
      await loadTransactions();
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
        <BalanceSummary transactions={transactions} />

        {/* Error message */}
        {error && <p className="error-message">{error}</p>}

        {/* [UI UPDATE ADDED] Transaction history section */}
        <section className="transactions-section">
          <div className="section-header">
            <h3>Transaction History</h3>
            <span className="transaction-count">({transactions.length})</span>
          </div>

          {/* Transaction table */}
          <TransactionList
            transactions={transactions}
            onEdit={handleEditClick}
            onDelete={handleDelete}
          />
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
