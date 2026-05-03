function BudgetCard({ budget, onEdit, onDelete }) {
  const formatAmount = (amount) => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'over':
        return 'Over Budget';
      case 'critical':
        return 'Critical';
      case 'warning':
        return 'Warning';
      default:
        return 'On Track';
    }
  };

  const percentage = Math.min(budget.percentage, 100);
  const isOverBudget = budget.percentage > 100;

  return (
    <div className="budget-card">
      <div className="budget-card-header">
        <h3>{budget.category}</h3>
        <div className="budget-card-actions">
          <span 
            onClick={() => onEdit(budget)} 
            className="action-link"
          >
            Edit
          </span>
          <span className="action-separator">|</span>
          <span 
            onClick={() => onDelete(budget._id)} 
            className="action-link delete"
          >
            Delete
          </span>
        </div>
      </div>

      <div className="budget-amounts">
        <div className="budget-amount-item">
          <span className="label">Budget</span>
          <span className="value">₱{formatAmount(budget.budgetAmount)}</span>
        </div>
        <div className="budget-amount-item">
          <span className="label">Spent</span>
          <span className="value">₱{formatAmount(budget.spent)}</span>
        </div>
        <div className="budget-amount-item">
          <span className="label">Remaining</span>
          <span className={`value ${budget.remaining < 0 ? 'negative' : ''}`}>
            ₱{formatAmount(budget.remaining)}
          </span>
        </div>
      </div>

      <div className="budget-progress">
        <div className="budget-progress-header">
          <span className="budget-status">{getStatusText(budget.status)}</span>
          <span className="budget-percentage">{budget.percentage.toFixed(1)}%</span>
        </div>
        <div className="budget-progress-bar">
          <div 
            className="budget-progress-fill"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        {isOverBudget && (
          <p className="budget-over-message">
            Over by ₱{formatAmount(Math.abs(budget.remaining))}
          </p>
        )}
      </div>
    </div>
  );
}

export default BudgetCard;