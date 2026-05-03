import React from 'react';

function BudgetComparisonChart({ budgetStatus }) {
  if (!budgetStatus || budgetStatus.length === 0) {
    return null;
  }

  const formatAmount = (amount) => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  return (
    <div className="budget-comparison-chart">
      <h3>Budget vs Actual Spending</h3>
      <div className="chart-container">
        {budgetStatus.map((budget) => {
          const budgetPercentage = 100;
          const spentPercentage = budget.budgetAmount > 0 
            ? Math.min((budget.spent / budget.budgetAmount) * 100, 150) 
            : 0;
          const isOverBudget = budget.spent > budget.budgetAmount;

          return (
            <div key={budget._id} className="chart-row">
              <div className="chart-category">
                <span className="category-name">{budget.category}</span>
              </div>
              <div className="chart-bars">
                <div className="bar-group">
                  <div className="bar-label">
                    <span>Budget</span>
                    <span className="bar-amount">₱{formatAmount(budget.budgetAmount)}</span>
                  </div>
                  <div className="bar-container">
                    <div 
                      className="bar bar-budget"
                      style={{ width: `${budgetPercentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="bar-group">
                  <div className="bar-label">
                    <span>Spent</span>
                    <span className={`bar-amount ${isOverBudget ? 'over-budget' : ''}`}>
                      ₱{formatAmount(budget.spent)}
                      {isOverBudget && ' (over)'}
                    </span>
                  </div>
                  <div className="bar-container">
                    <div 
                      className={`bar bar-spent ${isOverBudget ? 'over-budget' : ''}`}
                      style={{ width: `${spentPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BudgetComparisonChart;