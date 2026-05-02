// ============================================================
// FILE: pages/AdminDashboard.jsx
// PURPOSE: Admin's main view — shows all registered users
// PHASE: 2 (new)
// DEPENDENCIES: axios instance, AuthContext, React Router
// ============================================================

// [ADMIN UPDATE MODIFIED] Add CURRENCY_SYMBOLS import
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios.js';
import { AuthContext } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import { CURRENCY_SYMBOLS } from '../utils/constants'; // [ADMIN UPDATE ADDED]

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout, currency } = useContext(AuthContext); // [ADMIN UPDATE MODIFIED] Add currency
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // [ADMIN UPDATE ADDED] Auth context for currency symbol
  const symbol = CURRENCY_SYMBOLS[currency] || '₱';

  // [ADMIN UPDATE ADDED] Stats state
  const [stats, setStats] = useState({
    totalUsers:        0,
    totalTransactions: 0,
    totalIncome:       0,
    totalExpenses:     0,
    netBalance:        0,
    latestUser:        null
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError,   setStatsError]   = useState('');

  // [ADMIN UPDATE ADDED] fetchStats()
  // FUNCTION: fetchStats()
  // PURPOSE: Fetches platform stats from GET /api/admin/stats
  // Called once on mount alongside existing fetchUsers()
  // ERRORS: Sets statsError message if request fails
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const res = await api.get('/api/admin/stats');
      setStats(res.data);
    } catch (err) {
      setStatsError('Failed to load platform stats.');
    } finally {
      setStatsLoading(false);
    }
  };

  // FUNCTION: fetchUsers()
  // PURPOSE: Calls GET /api/admin/users and stores result in state
  // Called once on component mount using useEffect
  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/admin/users');
      setUsers(response.data.users);
      setLoading(false);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to load users.');
      setLoading(false);
    }
  };

  // [ADMIN UPDATE MODIFIED] Call fetchStats on mount
  // alongside existing fetchUsers — both run independently
  useEffect(() => {
    fetchStats(); // [ADMIN UPDATE ADDED]
    fetchUsers(); // existing — do not change
  }, []);

  if (loading) {
    return (
      <div>
        <Navbar onLogout={logout} />
        <div className="page-container">
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <Navbar onLogout={logout} />
      <main className="page-container">
        <h1>Admin Dashboard</h1>

        {/* [ADMIN UPDATE ADDED] Stats cards row */}
        {statsError && (
          <div style={{ color: 'red', marginBottom: '20px' }}>
            {statsError}
          </div>
        )}
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {/* Card 1 — Total Users */}
          <div style={{
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
              Total Users
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {statsLoading ? 'Loading...' : stats.totalUsers}
            </div>
          </div>

          {/* Card 2 — Total Transactions */}
          <div style={{
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
              Total Transactions
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {statsLoading ? 'Loading...' : stats.totalTransactions}
            </div>
          </div>

          {/* Card 3 — Platform Income */}
          <div style={{
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
              Platform Income
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'green' }}>
              {statsLoading ? 'Loading...' : `${symbol}${stats.totalIncome.toFixed(2)}`}
            </div>
          </div>

          {/* Card 4 — Platform Expenses */}
          <div style={{
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
              Platform Expenses
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'red' }}>
              {statsLoading ? 'Loading...' : `${symbol}${stats.totalExpenses.toFixed(2)}`}
            </div>
          </div>

          {/* Card 5 — Net Balance */}
          <div style={{
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
              Net Balance
            </div>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: statsLoading ? 'inherit' : (stats.netBalance > 0 ? 'green' : stats.netBalance < 0 ? 'red' : 'gray')
            }}>
              {statsLoading ? 'Loading...' : `${symbol}${stats.netBalance.toFixed(2)}`}
            </div>
          </div>
        </div>

        {/* [ADMIN UPDATE ADDED] Latest Registration Card */}
        {stats.latestUser && (
          <div style={{
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '30px'
          }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>
              Latest Registration
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 16px' }}>
              <div style={{ fontWeight: '500' }}>Name:</div>
              <div>{stats.latestUser.fullName}</div>
              <div style={{ fontWeight: '500' }}>Email:</div>
              <div>{stats.latestUser.email}</div>
              <div style={{ fontWeight: '500' }}>Joined:</div>
              <div>
                {new Date(stats.latestUser.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>
        )}

        <p className="subtitle">Registered Users ({users.length})</p>

        {error && <p className="error-message">{error}</p>}

        {/* [ADMIN UPDATE MODIFIED] Users Table with new columns: Transactions | Income | Expenses | Net */}
        <div className="users-table">
          <div className="table-header">
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span>Date Joined</span>
            <span style={{ textAlign: 'center' }}>Transactions</span>
            <span style={{ textAlign: 'right' }}>Income</span>
            <span style={{ textAlign: 'right' }}>Expenses</span>
            <span style={{ textAlign: 'right' }}>Net</span>
            <span>Actions</span>
          </div>
          
          {users.length === 0 ? (
            <p className="empty-state">No users registered yet.</p>
          ) : (
            users.map((user) => (
              <div key={user._id} className="table-row">
                <span>{user.fullName}</span>
                <span>{user.email}</span>
                <span className={`role-badge ${user.role}`}>{user.role}</span>
                <span>{new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                
                {/* [ADMIN UPDATE ADDED] Transactions column */}
                <span style={{ textAlign: 'center' }}>
                  {user.transactionCount > 0 ? `${user.transactionCount} txn` : '—'}
                </span>
                
                {/* [ADMIN UPDATE ADDED] Income column */}
                <span style={{ textAlign: 'right', color: 'green' }}>
                  {user.totalIncome > 0 ? `${symbol}${user.totalIncome.toFixed(2)}` : '—'}
                </span>
                
                {/* [ADMIN UPDATE ADDED] Expenses column */}
                <span style={{ textAlign: 'right', color: 'red' }}>
                  {user.totalExpenses > 0 ? `${symbol}${user.totalExpenses.toFixed(2)}` : '—'}
                </span>
                
                {/* [ADMIN UPDATE ADDED] Net column */}
                <span style={{
                  textAlign: 'right',
                  color: user.netBalance > 0 ? 'green' : user.netBalance < 0 ? 'red' : 'inherit'
                }}>
                  {user.netBalance !== 0 ? `${symbol}${user.netBalance.toFixed(2)}` : '—'}
                </span>
                
                <div className="actions">
                  <button
                    onClick={() => navigate(`/admin/users/${user._id}`)}
                    className="btn-primary"
                  >
                    View Records
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;