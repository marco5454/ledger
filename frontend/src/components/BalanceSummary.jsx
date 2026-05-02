import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { CURRENCY_SYMBOLS } from '../utils/constants.js';

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
          <p className="positive">{symbol}{totalIncome.toFixed(2)}</p>
        </div>
        <div>
          <h3>Total Expenses</h3>
          <p className="negative">{symbol}{totalExpenses.toFixed(2)}</p>
        </div>
        <div>
          <h3>Net Balance</h3>
          <p className={netBalance >= 0 ? 'positive' : 'negative'}>
            {symbol}{netBalance.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BalanceSummary;
