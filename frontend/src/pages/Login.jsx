// ============================================================
// FILE: pages/Login.jsx
// PURPOSE: User login form with modern 2-column layout
// PHASE: Registration Update
// LAST MODIFIED: May 3, 2026
// CHANGES: - Redesigned with 2-column layout and minimalist footer
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
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Column - Logo/Branding */}
        <div className="auth-left">
          <div className="auth-branding">
            <div className="logo-container">
              <svg className="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 7H17M7 12H17M7 17H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="brand-title">MyLedger</h1>
            <p className="brand-tagline">Manage your finances with clarity and confidence</p>
          </div>
        </div>

        {/* Right Column - Login Form */}
        <div className="auth-right">
          <div className="auth-form-container">
            <div className="auth-header">
              <h2>Welcome Back</h2>
              <p className="auth-subtitle">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={formState.email}
                  onChange={(event) => setFormState({ ...formState, email: event.target.value })}
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-container">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formState.password}
                    onChange={(event) => setFormState({ ...formState, password: event.target.value })}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {error && <p className="error-message">{error}</p>}

              <button type="submit" className="btn-auth-primary">
                Sign In
              </button>
            </form>

            <div className="auth-footer-link">
              <p>
                Don't have an account? <Link to="/register" className="auth-link">Create one</Link>
              </p>
            </div>
          </div>
        </div>
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
    </div>
  );
};

export default Login;