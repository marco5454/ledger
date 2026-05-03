import { useMemo } from 'react';

function BalanceSummary({ transactions = [] }) {
  const { totalIncome, totalExpenses, balance } = useMemo(() => {
    // Ensure transactions is an array
    const txArray = Array.isArray(transactions) ? transactions : [];
    
    const income = txArray
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = txArray
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      totalIncome: income,
      totalExpenses: expenses,
      balance: income - expenses
    };
  }, [transactions]);

  const formatAmount = (amount) => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="balance-summary">
      <h2>Balance Summary</h2>
      <div className="balance-grid">
        <div className="balance-item income">
          <span className="label">Total Income</span>
          <span className="amount">₱{formatAmount(totalIncome)}</span>
        </div>
        <div className="balance-item expense">
          <span className="label">Total Expenses</span>
          <span className="amount">₱{formatAmount(totalExpenses)}</span>
        </div>
        <div className="balance-item balance">
          <span className="label">Current Balance</span>
          <span className={`amount ${balance < 0 ? 'negative' : ''}`}>
            ₱{formatAmount(balance)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default BalanceSummary;