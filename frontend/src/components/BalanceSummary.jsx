const BalanceSummary = ({ transactions }) => {
  const totalIncome = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((total, current) => total + current.amount, 0);

  const totalExpenses = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((total, current) => total + current.amount, 0);

  const netBalance = totalIncome - totalExpenses;

  return (
    <div className="summary-card">
      <h2>Balance Summary</h2>
      <div className="summary-grid">
        <div>
          <h3>Total Income</h3>
          <p className="positive">${totalIncome.toFixed(2)}</p>
        </div>
        <div>
          <h3>Total Expenses</h3>
          <p className="negative">${totalExpenses.toFixed(2)}</p>
        </div>
        <div>
          <h3>Net Balance</h3>
          <p className={netBalance >= 0 ? 'positive' : 'negative'}>
            ${netBalance.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BalanceSummary;
