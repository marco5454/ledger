import { useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { ThemeContext } from '../context/ThemeContext.jsx';

const Navbar = () => {
  const { role, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Helper function to check if route is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Get current date formatted
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <h1>MyLedger</h1>
        <p className="subtitle">{formattedDate}</p>
      </div>
      <nav className="navbar-nav">
        {role === 'admin' ? (
          <>
            <Link 
              to="/admin/dashboard" 
              className={`nav-link ${isActive('/admin/dashboard') ? 'active' : ''}`}
            >
              Admin Dashboard
            </Link>
          </>
        ) : (
          <>
            <Link 
              to="/dashboard" 
              className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
            >
              Dashboard
            </Link>
            <Link 
              to="/recurring" 
              className={`nav-link ${isActive('/recurring') ? 'active' : ''}`}
            >
              Recurring
            </Link>
            <Link 
              to="/budgets" 
              className={`nav-link ${isActive('/budgets') ? 'active' : ''}`}
            >
              Budgets
            </Link>
            <Link 
              to="/settings" 
              className={`nav-link ${isActive('/settings') ? 'active' : ''}`}
            >
              Settings
            </Link>
          </>
        )}
        <button 
          onClick={toggleTheme} 
          className="btn-theme-toggle"
          aria-label="Toggle theme"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </nav>
    </header>
  );
};

export default Navbar;