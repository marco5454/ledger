// ============================================================
// FILE: pages/AdminDashboard.jsx
// PURPOSE: Admin's main view — shows all registered users
// PHASE: 2 (new)
// DEPENDENCIES: axios instance, AuthContext, React Router
// ============================================================

import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios.js';
import { AuthContext } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  useEffect(() => {
    fetchUsers();
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
        <p className="subtitle">Registered Users ({users.length})</p>

        {error && <p className="error-message">{error}</p>}

        {/* Users Table with columns: Name | Email | Role | Date Joined | Actions */}
        <div className="users-table">
          <div className="table-header">
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span>Date Joined</span>
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