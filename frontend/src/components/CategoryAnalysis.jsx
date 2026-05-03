import { useState, useEffect } from 'react';
import { api } from '../api/axios';

function CategoryAnalysis({ onCreateBudget, refreshKey }) {
  const [analysis, setAnalysis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchCategoryAnalysis();
  }, [refreshKey]);

  const fetchCategoryAnalysis = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/budgets/category-analysis');
      setAnalysis(response.data.categoryAnalysis || []);
    } catch (err) {
      console.error('Error fetching category analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount) => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleCreateBudget = (category) => {
    onCreateBudget(category);
  };

  if (loading) {
    return (
      <div className="category-analysis">
        <div className="category-analysis-header">
          <h3>📊 Category Spending Analysis</h3>
        </div>
        <p className="loading-text">Loading analysis...</p>
      </div>
    );
  }

  if (analysis.length === 0) {
    return null;
  }

  // Separate categories into groups
  const withSpending = analysis.filter(cat => cat.hasActivity);
  const withoutSpending = analysis.filter(cat => !cat.hasActivity);

  return (
    <div className="category-analysis">
      <div 
        className="category-analysis-header"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ cursor: 'pointer' }}
      >
        <h3>Category Spending Analysis</h3>
        <span className="expand-icon">{isExpanded ? 'Collapse' : 'Expand'}</span>
      </div>

      {isExpanded && (
        <div className="category-analysis-content">
          <p className="analysis-description">
            View spending across all categories and identify which ones need budgets.
          </p>

          {withSpending.length > 0 && (
            <div className="category-section">
              <h4 className="category-section-title">Categories with Spending</h4>
              <div className="category-list">
                {withSpending.map((cat) => (
                  <div key={cat.category} className="category-item">
                    <div className="category-info">
                      <span className="category-name">{cat.category}</span>
                      <span className="category-spent">₱{formatAmount(cat.spent)}</span>
                    </div>
                    <div className="category-status">
                      {cat.hasBudget ? (
                        <span className="status-badge has-budget">
                          Budget: ₱{formatAmount(cat.budgetAmount)}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleCreateBudget(cat.category)}
                          className="btn-create-budget"
                        >
                          Create Budget
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {withoutSpending.length > 0 && (
            <div className="category-section">
              <h4 className="category-section-title">Categories without Spending</h4>
              <div className="category-list">
                {withoutSpending.map((cat) => (
                  <div key={cat.category} className="category-item inactive">
                    <div className="category-info">
                      <span className="category-name">{cat.category}</span>
                      <span className="category-spent">₱0.00</span>
                    </div>
                    <div className="category-status">
                      {cat.hasBudget ? (
                        <span className="status-badge has-budget-no-activity">
                          Budget: ₱{formatAmount(cat.budgetAmount)}
                        </span>
                      ) : (
                        <span className="status-badge no-activity">
                          No Activity
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CategoryAnalysis;