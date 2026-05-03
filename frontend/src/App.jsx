import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
// [PHASE 2 ADDED] — New page imports
import AdminDashboard from './pages/AdminDashboard';
import UserDetail from './pages/UserDetail';
// [SETTINGS ADDED] Settings page import
import Settings from './pages/Settings';
// [RECURRING ADDED] Recurring transactions page import
import RecurringTransactions from './pages/RecurringTransactions';
// [BUDGET ADDED] Budget management page import
import Budgets from './pages/Budgets';
import AdminRoute from './components/AdminRoute';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <ThemeProvider>
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

          {/* [RECURRING ADDED] Recurring transactions route — auth protected, user only */}
          <Route path="/recurring" element={
            <ProtectedRoute>
              <Layout>
                <RecurringTransactions />
              </Layout>
            </ProtectedRoute>
          } />

          {/* [SETTINGS ADDED] Settings route — auth protected, user only */}
          <Route path="/settings" element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          } />

          {/* [BUDGET ADDED] Budget management route — auth protected, user only */}
          <Route path="/budgets" element={
            <ProtectedRoute>
              <Layout>
                <Budgets />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
