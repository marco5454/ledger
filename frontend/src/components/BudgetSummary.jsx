import { useState, useEffect } from 'react';
import { api } from '../api/axios';
import { Link } from 'react-router-dom';

function BudgetSummary() {
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBudgetSummary = async () => {
      try {
        const response = await api.get('/api/budgets/status');
        setBudgetData(response.data);
      } catch (err) {
        console.error('Error fetching budget summary:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBudgetSummary();
  }, []);

  const formatAmount = (amount) => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  if (loading || !budgetData || budgetData.budgetStatus.length === 0) {
    return null;
  }

  const { totalBudget, totalSpent, budgetStatus } = budgetData;
  const totalRemaining = totalBudget - totalSpent;
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Count budgets by status
  const statusCounts = {
    over: budgetStatus.filter(b => b.status === 'over').length,
    critical: budgetStatus.filter(b => b.status === 'critical').length,
    warning: budgetStatus.filter(b => b.status === 'warning').length,
    good: budgetStatus.filter(b => b.status === 'good').length
  };

  return (
    <div className="budget-summary">
      <div className="budget-summary-header">
        <h2>Budget Overview</h2>
        <Link to="/budgets" className="view-all-link">View All →</Link>
      </div>
      
      <div className="balance-grid">
        <div className="balance-item">
          <span className="label">Total Budget</span>
          <span className="amount">₱{formatAmount(totalBudget)}</span>
        </div>
        <div className="balance-item">
          <span className="label">Total Spent</span>
          <span className="amount">₱{formatAmount(totalSpent)}</span>
        </div>
        <div className="balance-item">
          <span className="label">Remaining</span>
          <span className={`amount ${totalRemaining < 0 ? 'negative' : ''}`}>
            ₱{formatAmount(totalRemaining)}
          </span>
        </div>
      </div>

      <div className="budget-summary-progress">
        <div className="budget-summary-progress-header">
          <span>Overall Usage</span>
          <span>{overallPercentage.toFixed(1)}%</span>
        </div>
        <div className="budget-progress-bar">
          <div 
            className="budget-progress-fill"
            style={{ width: `${Math.min(overallPercentage, 100)}%` }}
          ></div>
        </div>
      </div>

      {(statusCounts.over > 0 || statusCounts.critical > 0 || statusCounts.warning > 0) && (
        <div className="budget-alerts">
          {statusCounts.over > 0 && (
            <p className="budget-alert">⚠️ {statusCounts.over} budget{statusCounts.over > 1 ? 's' : ''} over limit</p>
          )}
          {statusCounts.critical > 0 && (
            <p className="budget-alert">⚠️ {statusCounts.critical} budget{statusCounts.critical > 1 ? 's' : ''} critical</p>
          )}
          {statusCounts.warning > 0 && (
            <p className="budget-alert">⚠️ {statusCounts.warning} budget{statusCounts.warning > 1 ? 's' : ''} need attention</p>
          )}
        </div>
      )}
    </div>
  );
}

export default BudgetSummary;