import { useMemo } from 'react';

function MonthlySummary({ transactions = [] }) {
  const currentMonth = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const { monthlyIncome, monthlyExpenses, monthlyBalance } = useMemo(() => {
    // Ensure transactions is an array
    const txArray = Array.isArray(transactions) ? transactions : [];
    
    const monthlyTransactions = txArray.filter(t => {
      const transactionMonth = t.date.substring(0, 7);
      return transactionMonth === currentMonth;
    });

    const income = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      monthlyIncome: income,
      monthlyExpenses: expenses,
      monthlyBalance: income - expenses
    };
  }, [transactions, currentMonth]);

  const monthName = useMemo(() => {
    const date = new Date(currentMonth + '-01');
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [currentMonth]);

  const formatAmount = (amount) => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="monthly-summary">
      <h2>Monthly Summary - {monthName}</h2>
      <div className="balance-grid">
        <div className="balance-item income">
          <span className="label">Income</span>
          <span className="amount">₱{formatAmount(monthlyIncome)}</span>
        </div>
        <div className="balance-item expense">
          <span className="label">Expenses</span>
          <span className="amount">₱{formatAmount(monthlyExpenses)}</span>
        </div>
        <div className="balance-item balance">
          <span className="label">Net</span>
          <span className={`amount ${monthlyBalance < 0 ? 'negative' : ''}`}>
            ₱{formatAmount(monthlyBalance)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default MonthlySummary;