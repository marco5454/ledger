// ============================================================
// FILE: pages/Login.jsx
// PURPOSE: User login form
// PHASE: Registration Update
// LAST MODIFIED: May 2, 2026
// CHANGES: - Updated login() call to pass fullName and currency
// ============================================================

import { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/axios.js';
import { AuthContext } from '../context/AuthContext.jsx';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formState, setFormState] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const response = await api.post('/api/auth/login', formState);
      // [REG UPDATE MODIFIED] Pass all four values to context
      login(response.data.token, response.data.role, response.data.fullName, response.data.currency);

      // [PHASE 2 ADDED] — Auto-route based on role stored in DB
      // Admin goes to admin dashboard, regular user goes to user dashboard
      if (response.data.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Login failed.');
    }
  };

  return (
    <div className="page-container">
      <h1>Login</h1>
      <form onSubmit={handleSubmit} className="form-card">
        <label>
          Email
          <input
            type="email"
            value={formState.email}
            onChange={(event) => setFormState({ ...formState, email: event.target.value })}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={formState.password}
            onChange={(event) => setFormState({ ...formState, password: event.target.value })}
            required
          />
        </label>
        {error && <p className="error-message">{error}</p>}
        <button type="submit">Log In</button>
      </form>
      <p>
        Need an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

export default Login;
