// [ADMIN SEARCH-SORT MODIFIED]
import { useState, useEffect, useMemo, useContext } from 'react'; // [ADMIN SEARCH-SORT ADDED] useMemo
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios'; // [ADMIN SEARCH-SORT MODIFIED] Use named export
import { AuthContext } from '../context/AuthContext';
import '../styles/Dashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
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
        <div className="loading">Loading dashboard...</div>
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className="admin-logout-btn">
          Logout
        </button>
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
  );
};

export default AdminDashboard;