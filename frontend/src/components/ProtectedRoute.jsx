// ============================================================
// FILE: components/ProtectedRoute.jsx
// PURPOSE: Blocks unauthenticated users from accessing private pages
// PHASE: 2 (new)
// USAGE: Wrap any route that requires login
// ============================================================

import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

// FUNCTION: ProtectedRoute
// PURPOSE: Checks if user has a valid token before rendering children
// RETURNS: Children if authenticated, redirect to /login if not
// NOTE: Does not check role — use AdminRoute for role checking
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated — render the protected content
  return children;
};

export default ProtectedRoute;