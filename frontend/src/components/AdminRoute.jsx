// ============================================================
// FILE: components/AdminRoute.jsx
// PURPOSE: Blocks non-admin users from accessing admin pages
// PHASE: 2 (new)
// USAGE: Wrap any route that requires admin role
// ============================================================

import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

// FUNCTION: AdminRoute
// PURPOSE: Dual check — must be authenticated AND have role: admin
// RETURNS: Children if admin, /login if not authenticated,
//          /dashboard if authenticated but not admin
// NOTE: Two separate checks — auth first, then role
const AdminRoute = ({ children }) => {
  const { isAuthenticated, role } = useContext(AuthContext);

  // First check: Must be authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Second check: Must have admin role
  if (role !== 'admin') {
    // Authenticated but not admin — redirect to user dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // User is authenticated AND admin — render the admin content
  return children;
};

export default AdminRoute;