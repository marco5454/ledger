import { useState, useEffect, useContext } from 'react';
import { api } from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { EXPENSE_CATEGORIES } from '../utils/constants';
import { exportBudgetsToCSV } from '../utils/exportCSV';
import BudgetCard from '../components/BudgetCard';
import BudgetForm from '../components/BudgetForm';
import Modal from '../components/Modal';
import CategoryAnalysis from '../components/CategoryAnalysis';
import BudgetComparisonChart from '../components/BudgetComparisonChart';
import ExportMenu from '../components/ExportMenu';

function Budgets() {
  const { currency } = useContext(AuthContext);
  const [budgetStatus, setBudgetStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [currentMonth, setCurrentMonth] = useState('');
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [analysisRefreshKey, setAnalysisRefreshKey] = useState(0);
  const [preselectedCategory, setPreselectedCategory] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [copyMessage, setCopyMessage] = useState('');

  const fetchBudgetStatus = async (month = null) => {
    try {
      setLoading(true);
      setError(null);
      const url = month ? `/api/budgets/status?month=${month}` : '/api/budgets/status';
      const response = await api.get(url);
      setBudgetStatus(response.data.budgetStatus || []);
      setCurrentMonth(response.data.month);
      setSelectedMonth(response.data.month);
      setTotalBudget(response.data.totalBudget || 0);
      setTotalSpent(response.data.totalSpent || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load budget status');
      console.error('Error fetching budget status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetStatus();
  }, []);

  const handlePreviousMonth = () => {
    const [year, month] = selectedMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    date.setMonth(date.getMonth() - 1);
    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    fetchBudgetStatus(newMonth);
    setAnalysisRefreshKey(prev => prev + 1);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    date.setMonth(date.getMonth() + 1);
    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    fetchBudgetStatus(newMonth);
    setAnalysisRefreshKey(prev => prev + 1);
  };

  const isCurrentMonth = () => {
    const now = new Date();
    const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return selectedMonth === current;
  };

  const handleBudgetSaved = () => {
    setIsModalOpen(false);
    setEditingBudget(null);
    setPreselectedCategory(null);
    fetchBudgetStatus();
    setAnalysisRefreshKey(prev => prev + 1);
  };

  const handleBudgetEdit = (budget) => {
    setEditingBudget(budget);
    setIsModalOpen(true);
  };

  const handleBudgetDelete = async (budgetId) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) {
      return;
    }

    try {
      await api.delete(`/api/budgets/${budgetId}`);
      fetchBudgetStatus();
      setAnalysisRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error('Error deleting budget:', err);
      alert(err.response?.data?.message || 'Failed to delete budget');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingBudget(null);
    setPreselectedCategory(null);
  };

  const handleCreateBudgetFromAnalysis = (category) => {
    setPreselectedCategory(category);
    setIsModalOpen(true);
  };

  const handleCopyFromLastMonth = async () => {
    try {
      const [year, month] = selectedMonth.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      date.setMonth(date.getMonth() - 1);
      const sourceMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      const response = await api.post('/api/budgets/copy-from-month', { sourceMonth });
      setCopyMessage(`Copied ${response.data.count} budgets from ${getMonthName(sourceMonth)}`);
      setTimeout(() => setCopyMessage(''), 3000);
      fetchBudgetStatus();
      setAnalysisRefreshKey(prev => prev + 1);
    } catch (err) {
      setCopyMessage(err.response?.data?.message || 'Error copying budgets');
      setTimeout(() => setCopyMessage(''), 3000);
    }
  };

  const formatAmount = (amount) => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const getMonthName = (monthStr) => {
    if (!monthStr) return '';
    const date = new Date(`${monthStr}-01`);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handleExport = (option) => {
    if (budgetStatus.length === 0) {
      alert('No budgets to export');
      return;
    }

    exportBudgetsToCSV(budgetStatus, selectedMonth, currency, 'budget_report');
  };

  const exportOptions = [
    { value: 'current', label: 'Export Budget Report' }
  ];

  // Get categories that don't have budgets yet
  const availableCategories = EXPENSE_CATEGORIES.filter(
    cat => !budgetStatus.find(b => b.category === cat)
  );

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading budgets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={fetchBudgetStatus} className="btn-retry">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const totalRemaining = totalBudget - totalSpent;
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <>
      <div className="dashboard-container">
        {copyMessage && (
          <div className="message-banner">
            {copyMessage}
          </div>
        )}

        <div className="dashboard-header">
          <div>
            <h1>Budget Management</h1>
            {currentMonth && (
              <div className="month-navigation">
                <button 
                  onClick={handlePreviousMonth}
                  className="btn-month-nav"
                >
                  Previous
                </button>
                <span className="current-month-display">{getMonthName(currentMonth)}</span>
                <button 
                  onClick={handleNextMonth}
                  className="btn-month-nav"
                  disabled={isCurrentMonth()}
                >
                  Next
                </button>
              </div>
            )}
          </div>
          <div className="header-actions">
            {budgetStatus.length === 0 && (
              <button 
                onClick={handleCopyFromLastMonth}
                className="btn-secondary"
              >
                Copy from Last Month
              </button>
            )}
            {budgetStatus.length > 0 && (
              <ExportMenu onExport={handleExport} options={exportOptions} />
            )}
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="btn-primary"
              disabled={availableCategories.length === 0}
            >
              Add Budget
            </button>
          </div>
        </div>

        {budgetStatus.length > 0 && (
          <div className="budget-overview">
            <div className="summary-card">
              <h3>Overall Budget Summary</h3>
              <div className="budget-summary-grid">
                <div className="budget-summary-item">
                  <span className="label">Total Budget</span>
                  <span className="amount">₱{formatAmount(totalBudget)}</span>
                </div>
                <div className="budget-summary-item">
                  <span className="label">Total Spent</span>
                  <span className="amount">₱{formatAmount(totalSpent)}</span>
                </div>
                <div className="budget-summary-item">
                  <span className="label">Remaining</span>
                  <span className={`amount ${totalRemaining < 0 ? 'negative' : ''}`}>
                    ₱{formatAmount(totalRemaining)}
                  </span>
                </div>
                <div className="budget-summary-item">
                  <span className="label">Used</span>
                  <span className="amount">{overallPercentage.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <BudgetComparisonChart budgetStatus={budgetStatus} />

        <CategoryAnalysis 
          onCreateBudget={handleCreateBudgetFromAnalysis}
          refreshKey={analysisRefreshKey}
        />

        {budgetStatus.length === 0 ? (
          <div className="empty-state">
            <p>No budgets set for this month.</p>
            <p>Click "Add Budget" to create your first budget.</p>
          </div>
        ) : (
          <div className="budget-list">
            {budgetStatus.map(budget => (
              <BudgetCard
                key={budget._id}
                budget={budget}
                onEdit={handleBudgetEdit}
                onDelete={handleBudgetDelete}
              />
            ))}
          </div>
        )}

        <Modal isOpen={isModalOpen} onClose={handleModalClose}>
          <BudgetForm
            budget={editingBudget}
            availableCategories={availableCategories}
            preselectedCategory={preselectedCategory}
            onSuccess={handleBudgetSaved}
          />
        </Modal>
      </div>

      {/* Footer */}
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
    </>
  );
}

export default Budgets;