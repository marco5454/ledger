import { useState, useEffect, useContext } from 'react';
import { api } from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { exportTransactionsToCSV } from '../utils/exportCSV';
import BalanceSummary from '../components/BalanceSummary';
import MonthlySummary from '../components/MonthlySummary';
import BudgetSummary from '../components/BudgetSummary';
import TransactionList from '../components/TransactionList';
import TransactionForm from '../components/TransactionForm';
import ExportMenu from '../components/ExportMenu';
import Modal from '../components/Modal';

function Dashboard() {
  const { currency } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [budgetRefreshKey, setBudgetRefreshKey] = useState(0);

  const fetchTransactions = async (signal) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/transactions', { signal });
      
      // Debug: log the response structure
      console.log('API Response:', response.data);
      console.log('Is Array?', Array.isArray(response.data));
      console.log('Has transactions property?', response.data?.transactions);
      
      // Handle both response formats: array or object with transactions property
      let transactionsData = [];
      if (Array.isArray(response.data)) {
        transactionsData = response.data;
      } else if (response.data && Array.isArray(response.data.transactions)) {
        transactionsData = response.data.transactions;
      }
      
      console.log('Final transactions array:', transactionsData);
      setTransactions(transactionsData);
    } catch (err) {
      if (err.name !== 'CanceledError') {
        setError(err.response?.data?.message || 'Failed to load transactions');
        console.error('Error fetching transactions:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    fetchTransactions(abortController.signal);
    
    return () => abortController.abort();
  }, []);

  const handleTransactionAdded = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
    const abortController = new AbortController();
    fetchTransactions(abortController.signal);
    setBudgetRefreshKey(prev => prev + 1); // Force budget summary to refresh
  };

  const handleTransactionDeleted = async (transactionId) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }
    
    try {
      await api.delete(`/api/transactions/${transactionId}`);
      const abortController = new AbortController();
      fetchTransactions(abortController.signal);
      setBudgetRefreshKey(prev => prev + 1); // Force budget summary to refresh
    } catch (err) {
      console.error('Error deleting transaction:', err);
      alert(err.response?.data?.message || 'Failed to delete transaction');
    }
  };

  const handleTransactionEdit = (transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const handleExport = (option) => {
    if (transactions.length === 0) {
      alert('No transactions to export');
      return;
    }

    switch (option) {
      case 'all':
        exportTransactionsToCSV(transactions, currency, 'all_transactions');
        break;
      case 'current-month':
        const now = new Date();
        const currentMonth = transactions.filter(t => {
          const tDate = new Date(t.date);
          return tDate.getMonth() === now.getMonth() && 
                 tDate.getFullYear() === now.getFullYear();
        });
        exportTransactionsToCSV(currentMonth, currency, 'current_month_transactions');
        break;
      default:
        exportTransactionsToCSV(transactions, currency, 'transactions');
    }
  };

  const exportOptions = [
    { value: 'all', label: 'Export All Transactions' },
    { value: 'current-month', label: 'Export Current Month' }
  ];

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={() => fetchTransactions()} className="btn-retry">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <ExportMenu onExport={handleExport} options={exportOptions} />
            <button onClick={() => setIsModalOpen(true)} className="btn-primary">
              Add Transaction
            </button>
          </div>
        </div>

        <div className="dashboard-grid">
          <BalanceSummary transactions={transactions} />
          <MonthlySummary transactions={transactions} />
        </div>

        <BudgetSummary key={budgetRefreshKey} />

      <TransactionList 
        transactions={transactions} 
        onTransactionDeleted={handleTransactionDeleted}
        onTransactionEdit={handleTransactionEdit}
      />

      <Modal isOpen={isModalOpen} onClose={handleModalClose}>
        <TransactionForm 
          transaction={editingTransaction}
          onSuccess={handleTransactionAdded} 
        />
      </Modal>
      </div>

      {/* Minimalist Footer */}
      <footer className="auth-page-footer">
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
    </>
  );
}

export default Dashboard;
