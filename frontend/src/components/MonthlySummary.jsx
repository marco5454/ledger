// ============================================================
// FILE: components/MonthlySummary.jsx
// PURPOSE: Shows per-month breakdown of income, expenses,
//          net balance, and transaction count for a given year
// PHASE: Sort & Monthly Update
// DEPENDENCIES: AuthContext (for currency), utils/constants
// ============================================================

import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { CURRENCY_SYMBOLS } from '../utils/constants.js';

// FUNCTION: MonthlySummary()
// PURPOSE: Renders a monthly breakdown table for selected year
// PARAMS:
//   transactions (array) — full transaction dataset
//   currency (string)    — from AuthContext
// RETURNS: Monthly summary section with table and year selector
const MonthlySummary = ({ transactions }) => {
  const { currency } = useContext(AuthContext);
  const symbol = CURRENCY_SYMBOLS[currency] || '₱';

  // Selected year — defaults to current year
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Early return if no transactions yet (loading state)
  if (!transactions || !transactions.length) {
    return (
      <section className="monthly-summary-section">
        <div className="monthly-summary-header">
          <h3>Monthly Summary</h3>
        </div>
        <p className="empty-state">Loading monthly summary...</p>
      </section>
    );
  }

  // FUNCTION: getAvailableYears()
  // PURPOSE: Derives list of years from transactions dates
  //          so year selector only shows years with data
  // RETURNS: sorted array of unique years descending
  //          Always includes current year even if no data yet
  const getAvailableYears = () => {
    const years = transactions.map(t =>
      new Date(t.date).getFullYear()
    );
    const unique = [...new Set([...years, currentYear])];
    return unique.sort((a, b) => b - a); // newest first
  };

  // FUNCTION: getMonthlySummary()
  // PURPOSE: Groups transactions by month for selectedYear
  //          Calculates income, expenses, net, count per month
  // RETURNS: array of 12 objects — one per month
  //          Months with no transactions show zeros
  const getMonthlySummary = () => {
    const months = [
      'January','February','March','April',
      'May','June','July','August',
      'September','October','November','December'
    ];

    return months.map((monthName, index) => {
      // Filter transactions for this month and year
      const monthTransactions = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() === selectedYear &&
               d.getMonth() === index;
      });

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        month:    monthName,
        income,
        expenses,
        net:      income - expenses,
        count:    monthTransactions.length
      };
    });
  };

  const monthlyData = getMonthlySummary();
  const availableYears = getAvailableYears();

  // Calculate year totals for footer
  const yearTotals = monthlyData.reduce(
    (totals, month) => ({
      income: totals.income + month.income,
      expenses: totals.expenses + month.expenses,
      net: totals.net + month.net,
      count: totals.count + month.count
    }),
    { income: 0, expenses: 0, net: 0, count: 0 }
  );

  return (
    <section className="monthly-summary-section">
      <div className="monthly-summary-header">
        <h3>Monthly Summary</h3>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="year-selector"
        >
          {availableYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      <div className="monthly-summary-table-container">
        <table className="monthly-summary-table">
          <thead>
            <tr>
              <th className="col-month">Month</th>
              <th className="col-income">Income</th>
              <th className="col-expenses">Expenses</th>
              <th className="col-net">Net</th>
              <th className="col-count">Transactions</th>
            </tr>
          </thead>
          <tbody>
            {monthlyData.map((month, index) => (
              <tr key={index}>
                <td className="col-month">{month.month}</td>
                <td className="col-income">
                  {month.income > 0 ? `${symbol}${month.income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                </td>
                <td className="col-expenses">
                  {month.expenses > 0 ? `${symbol}${month.expenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                </td>
                <td className={`col-net ${month.net > 0 ? 'positive' : month.net < 0 ? 'negative' : 'zero'}`}>
                  {month.net !== 0 ? `${symbol}${month.net.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                </td>
                <td className="col-count">
                  {month.count > 0 ? `${month.count} txn` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="year-total-row">
              <td className="col-month"><strong>Total {selectedYear}</strong></td>
              <td className="col-income"><strong>{symbol}{yearTotals.income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
              <td className="col-expenses"><strong>{symbol}{yearTotals.expenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
              <td className={`col-net ${yearTotals.net > 0 ? 'positive' : yearTotals.net < 0 ? 'negative' : 'zero'}`}>
                <strong>{symbol}{yearTotals.net.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </td>
              <td className="col-count"><strong>{yearTotals.count} txn</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
};

export default MonthlySummary;
