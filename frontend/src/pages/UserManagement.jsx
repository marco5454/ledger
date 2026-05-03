// ============================================================
// FILE: pages/UserManagement.jsx
// PURPOSE: Dedicated full page for managing all user accounts
// PHASE: 2 (new)
// DEPENDENCIES: AuthContext, axios instance
// ============================================================

import { useContext, useEffect, useState } from 'react';
import { api } from '../api/axios.js';
import { AuthContext } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';

const UserManagement = () => {
  const { logout } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // FUNCTION: fetchUsers
  // PURPOSE: Loads all users on mount
  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/admin/users');
      setUsers(response.data.users);
      setFilteredUsers(response.data.users);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to load users.');
    }
  };

  useEffect(() => {
    fetchUsers().finally(() => setLoading(false));
  }, []);

  // FUNCTION: handleSearch
  // PURPOSE: Filters the users array client-side by name or email
  // Does NOT make a new API call — filters already loaded data
  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  // FUNCTION: handleRoleChange
  // PURPOSE: Sends role update to API, refreshes list after
  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/api/admin/users/${userId}/role`, { role: newRole });
      await fetchUsers(); // Refresh the list
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to update role.');
    }
  };

  // FUNCTION: handleDeleteUser
  // PURPOSE: Confirm dialog → DELETE request → refresh list
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user and all their transactions?')) {
      return;
    }
    try {
      await api.delete(`/api/admin/users/${userId}`);
      await fetchUsers(); // Refresh the list
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to delete user.');
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar onLogout={logout} />
        <div className="page-container">
          <div className="loading-overlay">
            <div className="loading-spinner-large"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management">
      <Navbar onLogout={logout} />
      <main className="page-container">
        <h1>User Management</h1>

        {/* Search/filter input */}
        <div className="search-section">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        {/* Full users table */}
        <div className="users-table">
          <div className="table-header">
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span>Joined</span>
            <span>Actions</span>
          </div>
          {filteredUsers.map((user) => (
            <div key={user._id} className="table-row">
              <span>{user.fullName}</span>
              <span>{user.email}</span>
              <span className={`role-badge ${user.role}`}>{user.role}</span>
              <span>{new Date(user.createdAt).toLocaleDateString()}</span>
              <div className="actions">
                {user.role === 'user' ? (
                  <button
                    onClick={() => handleRoleChange(user._id, 'admin')}
                    className="btn-secondary"
                  >
                    Make Admin
                  </button>
                ) : (
                  <button
                    onClick={() => handleRoleChange(user._id, 'user')}
                    className="btn-secondary"
                  >
                    Make User
                  </button>
                )}
                <button
                  onClick={() => handleDeleteUser(user._id)}
                  className="btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {filteredUsers.length === 0 && (
            <div className="empty-state">
              {searchTerm ? 'No users match your search.' : 'No users found.'}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserManagement;