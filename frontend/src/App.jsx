import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
// [PHASE 2 ADDED] — New page imports
import AdminDashboard from './pages/AdminDashboard';
import UserDetail from './pages/UserDetail';
// [SETTINGS ADDED] Settings page import
import Settings from './pages/Settings';
import AdminRoute from './components/AdminRoute';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          {/* [PHASE 2 ADDED] — New admin routes below existing routes */}
          <Route path="/admin/dashboard" element={
            <AdminRoute>
              <Layout>
                <AdminDashboard />
              </Layout>
            </AdminRoute>
          } />

          <Route path="/admin/users/:id" element={
            <AdminRoute>
              <Layout>
                <UserDetail />
              </Layout>
            </AdminRoute>
          } />

          {/* [SETTINGS ADDED] Settings route — auth protected, user only */}
          <Route path="/settings" element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
