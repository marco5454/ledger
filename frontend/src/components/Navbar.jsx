import { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

const Navbar = ({ onLogout }) => {
  // [SETTINGS MODIFIED] Read fullName from AuthContext
  // fullName is stored in localStorage and loaded into context on start
  // It updates immediately after user saves settings without re-login
  const { role, fullName } = useContext(AuthContext);
  const navigate = useNavigate();

  // [SETTINGS MODIFIED] Display real name instead of generic label
  // Show first word of fullName only to keep navbar clean
  // Example: "Juan dela Cruz" displays as "Juan"
  const displayName = fullName ? fullName.split(' ')[0] : 'User';

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div>
        <h1>MyLedger</h1>
        {/* [SETTINGS MODIFIED] — Show real user name instead of role label */}
        {role && <p className="subtitle">Welcome, {displayName}!</p>}
      </div>
      <nav>
        {/* [PHASE 2 ADDED] — Conditional nav links based on role */}
        {/* Admin sees admin dashboard link, user sees only their dashboard */}
        {role === 'admin' ? (
          <Link to="/admin/dashboard">Admin Dashboard</Link>
        ) : (
          <>
            <Link to="/dashboard">Dashboard</Link>
            {/* [SETTINGS ADDED] Settings navigation link — users only */}
            {/* Admins manage settings differently — not needed in admin nav */}
            <Link to="/settings">Settings</Link>
          </>
        )}
        <button onClick={handleLogout}>Logout</button>
      </nav>
    </header>
  );
};

export default Navbar;
