import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { CURRENCY_SYMBOLS } from '../utils/constants.js';

// Minimal formatter for adding commas to numbers
const formatAmount = (amount) => {
  if (amount == null) return '0.00';
  return Number(amount).toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
};

const BalanceSummary = ({ transactions }) => {
  const { currency } = useContext(AuthContext);
  const symbol = CURRENCY_SYMBOLS[currency] || '₱';

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
          <p className="positive">{symbol}{formatAmount(totalIncome)}</p>
        </div>
        <div>
          <h3>Total Expenses</h3>
          <p className="negative">{symbol}{formatAmount(totalExpenses)}</p>
        </div>
        <div>
          <h3>Net Balance</h3>
          <p className={netBalance >= 0 ? 'positive' : 'negative'}>
            {symbol}{formatAmount(netBalance)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BalanceSummary;
