import TransactionItem from './TransactionItem.jsx';

const TransactionList = ({ transactions, onEdit, onDelete }) => {
  if (!transactions.length) {
    return <p className="empty-state">No transactions recorded yet.</p>;
  }

  return (
    <div className="list-card">
      <h2>Transactions</h2>
      <div className="transaction-list">
        {transactions.map((transaction) => (
          <TransactionItem
            key={transaction._id}
            transaction={transaction}
            onEdit={() => onEdit(transaction)}
            onDelete={() => onDelete(transaction._id)}
          />
        ))}
      </div>
    </div>
  );
};

export default TransactionList;
