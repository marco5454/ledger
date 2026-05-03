// [ADMIN SEARCH-SORT MODIFIED]
import { useState, useEffect, useMemo } from 'react'; // [ADMIN SEARCH-SORT ADDED] useMemo
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios'; // [ADMIN SEARCH-SORT MODIFIED] Use named export

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTransactions: 0,
    totalIncome: 0,
    totalExpenses: 0,
  });
  const [users, setUsers] = useState([]);
  const [latestUser, setLatestUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // [ADMIN SEARCH-SORT ADDED] Search state
  const [searchQuery, setSearchQuery] = useState('');

  // [ADMIN SEARCH-SORT ADDED] Sort state
  // Default: newest registrations first
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/admin/users'),
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data.users || usersRes.data); // Handle both response formats

      // Get latest registered user
      const userArray = usersRes.data.users || usersRes.data;
      if (userArray.length > 0) {
        const sorted = [...userArray].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setLatestUser(sorted[0]);
      }

      setError('');
    } catch (err) {
      console.error('Error fetching dashboard ', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await api.delete(`/api/admin/users/${userId}`);
      await fetchDashboardData();
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user');
    }
  };

  const handleViewUser = (userId) => {
    navigate(`/admin/users/${userId}`);
  };

  const handleRoleChange = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Change user role to ${newRole}?`)) {
      return;
    }

    try {
      await api.patch(`/api/admin/users/${userId}/role`, { role: newRole });
      await fetchDashboardData();
    } catch (err) {
      console.error('Error updating role:', err);
      alert('Failed to update user role');
    }
  };

  // [ADMIN SEARCH-SORT ADDED]
  // FUNCTION: handleSort()
  // PURPOSE: Toggles sort direction if same column clicked,
  //          switches to new column ascending if different
  // PARAMS: field (string) — column identifier to sort by
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev =>
        prev === 'asc' ? 'desc' : 'asc'
      );
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // [ADMIN SEARCH-SORT ADDED]
  // FUNCTION: getSortIndicator()
  // PURPOSE: Returns the correct arrow for a column header
  // PARAMS: field (string) — column to check
  // RETURNS: ' ↑' | ' ↓' | ' ↕'
  //   ↑ = active column ascending
  //   ↓ = active column descending
  //   ↕ = sortable but not currently active
  const getSortIndicator = (field) => {
    if (sortField !== field) return ' ↕';
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  // [ADMIN SEARCH-SORT ADDED] filteredAndSortedUsers
  // PURPOSE: Applies search filter then sort to users array
  // Runs on frontend — no API call needed
  // useMemo prevents recalculation on unrelated re-renders
  // DEPENDENCIES: users, searchQuery, sortField, sortDirection
  const filteredAndSortedUsers = useMemo(() => {

    // Step 1 — Filter by search query
    // Match against fullName or email, case insensitive
    const filtered = users.filter(user => {
      if (searchQuery === '') return true;
      const query = searchQuery.toLowerCase();
      return (
        user.fullName?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
      );
    });

    // Step 2 — Sort the filtered results
    return [...filtered].sort((a, b) => {
      let aVal, bVal;

      if (sortField === 'fullName') {
        aVal = (a.fullName || '').toLowerCase();
        bVal = (b.fullName || '').toLowerCase();
      } else if (sortField === 'createdAt') {
        aVal = new Date(a.createdAt);
        bVal = new Date(b.createdAt);
      } else if (sortField === 'transactionCount') {
        aVal = a.transactionCount;
        bVal = b.transactionCount;
      } else if (sortField === 'netBalance') {
        aVal = a.netBalance;
        bVal = b.netBalance;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ?  1 : -1;
      return 0;
    });

  }, [users, searchQuery, sortField, sortDirection]);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-overlay">
          <div className="loading-spinner-large"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-content">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p className="admin-subtitle">Manage users and monitor system activity</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-value">{stats.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Total Transactions</h3>
          <p className="stat-value">{stats.totalTransactions}</p>
        </div>
        <div className="stat-card income">
          <h3>Total Income</h3>
          <p className="stat-value">₱{stats.totalIncome.toFixed(2)}</p>
        </div>
        <div className="stat-card expense">
          <h3>Total Expenses</h3>
          <p className="stat-value">₱{stats.totalExpenses.toFixed(2)}</p>
        </div>
      </div>

        {/* Latest Registration Card */}
        {latestUser && (
          <div className="latest-registration">
            <h3>Latest Registration</h3>
            <div className="user-info">
              <p>
                <strong>{latestUser.fullName}</strong> ({latestUser.email})
              </p>
              <p className="registration-date">
                Joined: {new Date(latestUser.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        {/* [ADMIN SEARCH-SORT MODIFIED] Users Table Section with Search */}
        <div className="users-section">
        <div className="users-header">
          <h2>Registered Users ({filteredAndSortedUsers.length})</h2>
          {/* [ADMIN SEARCH-SORT ADDED] Search input */}
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {/* [ADMIN SEARCH-SORT ADDED] Clear button */}
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="clear-search-btn"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* [ADMIN SEARCH-SORT ADDED] Empty search state */}
        {filteredAndSortedUsers.length === 0 && searchQuery && (
          <div className="empty-state">
            No users found matching '{searchQuery}'
          </div>
        )}

        {/* [ADMIN SEARCH-SORT MODIFIED] Users Table - now uses filteredAndSortedUsers */}
        {filteredAndSortedUsers.length > 0 && (
          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  {/* [ADMIN SEARCH-SORT MODIFIED] Sortable Name header */}
                  <th
                    onClick={() => handleSort('fullName')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    Name{getSortIndicator('fullName')}
                  </th>
                  <th>Email</th>
                  <th>Role</th>
                  {/* [ADMIN SEARCH-SORT MODIFIED] Sortable Joined header */}
                  <th
                    onClick={() => handleSort('createdAt')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    Joined{getSortIndicator('createdAt')}
                  </th>
                  {/* [ADMIN SEARCH-SORT MODIFIED] Sortable Transactions header */}
                  <th
                    onClick={() => handleSort('transactionCount')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    Transactions{getSortIndicator('transactionCount')}
                  </th>
                  <th>Income</th>
                  <th>Expenses</th>
                  {/* [ADMIN SEARCH-SORT MODIFIED] Sortable Net header */}
                  <th
                    onClick={() => handleSort('netBalance')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    Net{getSortIndicator('netBalance')}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* [ADMIN SEARCH-SORT MODIFIED] Now maps filteredAndSortedUsers */}
                {filteredAndSortedUsers.map((user) => (
                  <tr key={user._id}>
                    <td>{user.fullName}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>{user.transactionCount}</td>
                    <td className="income">₱{user.totalIncome.toFixed(2)}</td>
                    <td className="expense">₱{user.totalExpenses.toFixed(2)}</td>
                    <td className={user.netBalance >= 0 ? 'income' : 'expense'}>
                      ₱{user.netBalance.toFixed(2)}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleRoleChange(user._id, user.role)}
                          className="btn-role-switch"
                          title={`Switch to ${user.role === 'admin' ? 'user' : 'admin'}`}
                        >
                          ⇄
                        </button>
                        <button
                          onClick={() => handleViewUser(user._id)}
                          className="btn-view"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="btn-delete"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>
      </div>

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

export default AdminDashboard;
