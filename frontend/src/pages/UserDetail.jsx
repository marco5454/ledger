// ============================================================
// FILE: pages/UserDetail.jsx
// PURPOSE: Shows admin a specific user's info and transactions
// PHASE: 2 (new)
// DEPENDENCIES: axios instance, AuthContext, React Router useParams
// ============================================================

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/axios.js';
import { CURRENCY_SYMBOLS } from '../utils/constants.js';

const UserDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // FUNCTION: fetchUserDetail()
  // PURPOSE: Calls GET /api/admin/users/:id/transactions
  //          Uses useParams() to get the id from the URL
  // Called once on mount using useEffect
  const fetchUserDetail = async () => {
    try {
      const response = await api.get(`/api/admin/users/${id}/transactions`);
      setUser(response.data.user);
      setTransactions(response.data.transactions);
      setLoading(false);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to load user details.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="page-container">
        <p>Loading user details...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-container">
        <p className="error-message">{error || 'User not found.'}</p>
        <button onClick={() => navigate('/admin/dashboard')} className="btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Calculate totals from transactions
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpenses;

  const symbol = CURRENCY_SYMBOLS[user.currency] || '₱';

  return (
    <div className="user-detail">
      <main className="page-container">
        {/* Back button */}
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="btn-back"
        >
          ← Back to Dashboard
        </button>

        {/* User info card */}
        <div className="user-card">
          <div className="user-header">
            <h1>{user.fullName}</h1>
            <span className={`role-badge ${user.role}`}>{user.role}</span>
          </div>
          <div className="user-info">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Member Since:</strong> {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        {/* Transactions section */}
        <div className="transactions-section">
          <h2>Transaction Records ({transactions.length})</h2>

          {error && <p className="error-message">{error}</p>}

          {transactions.length === 0 ? (
            <p className="empty-state">This user has no transactions yet.</p>
          ) : (
            <>
              {/* Transactions table */}
              <div className="users-table">
                <div className="table-header">
                  <span>Date</span>
                  <span>Type</span>
                  <span>Description</span>
                  <span>Amount</span>
                </div>
                {transactions.map((transaction) => (
                  <div key={transaction._id} className="table-row">
                    <span>{new Date(transaction.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    <span className={transaction.type === 'income' ? 'positive' : 'negative'}>
                      {transaction.type}
                    </span>
                    <span>{transaction.description}</span>
                    <span className={transaction.type === 'income' ? 'positive' : 'negative'}>
                      {symbol}{transaction.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals row */}
              <div className="totals-row">
                <div className="total-item">
                  <span>Total Income</span>
                  <p className="positive">{symbol}{totalIncome.toFixed(2)}</p>
                </div>
                <div className="total-item">
                  <span>Total Expenses</span>
                  <p className="negative">{symbol}{totalExpenses.toFixed(2)}</p>
                </div>
                <div className="total-item">
                  <span>Net Balance</span>
                  <p className={netBalance >= 0 ? 'positive' : 'negative'}>
                    {symbol}{netBalance.toFixed(2)}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserDetail;
