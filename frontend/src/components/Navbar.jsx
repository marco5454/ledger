import { useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

const Navbar = () => {
  const { role, fullName, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract first name for display
  const displayName = fullName ? fullName.split(' ')[0] : 'User';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Helper function to check if route is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <h1>MyLedger</h1>
        <p className="subtitle">Welcome, {displayName}!</p>
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
              to="/settings" 
              className={`nav-link ${isActive('/settings') ? 'active' : ''}`}
            >
              Settings
            </Link>
          </>
        )}
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </nav>
    </header>
  );
};

export default Navbar;