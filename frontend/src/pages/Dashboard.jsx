import { useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../api/axios.js';
import { AuthContext } from '../context/AuthContext.jsx';
import { CURRENCY_SYMBOLS } from '../utils/constants.js';
import Navbar from '../components/Navbar.jsx';
import BalanceSummary from '../components/BalanceSummary.jsx';
import TransactionForm from '../components/TransactionForm.jsx';
import TransactionList from '../components/TransactionList.jsx';

const Dashboard = () => {
  // [SETTINGS MODIFIED] Read fullName and currency from context
  const { logout, fullName, currency } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [error, setError] = useState('');

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

  const handleSuccess = async () => {
    setSelectedTransaction(null);
    await loadTransactions();
  };

  const handleEdit = (transaction) => {
    setSelectedTransaction(transaction);
  };

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

  return (
    <div className="dashboard-page">
      <Navbar onLogout={logout} />
      {/* [SETTINGS MODIFIED] Use real name in welcome heading */}
      <h2 style={{ marginBottom: '2rem' }}>Welcome back, {fullName || 'User'}!</h2>
      <main className="dashboard-grid">
        <section className="dashboard-panel">
          <BalanceSummary transactions={transactions} />
          {error && <p className="error-message">{error}</p>}
          <TransactionForm
            transaction={selectedTransaction}
            onSuccess={handleSuccess}
          />
        </section>
        <section className="dashboard-panel">
          <TransactionList
            transactions={transactions}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
