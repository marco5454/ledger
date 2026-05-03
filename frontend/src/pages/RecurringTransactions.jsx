import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/axios.js';
import RecurringItem from '../components/RecurringItem.jsx';
import RecurringForm from '../components/RecurringForm.jsx';
import Modal from '../components/Modal.jsx';

// ============================================================
// FILE: pages/RecurringTransactions.jsx
// PURPOSE: Main page for managing recurring transactions
// PHASE: Recurring Transactions Feature
// ============================================================

const RecurringTransactions = () => {
  const [recurring, setRecurring] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState(null);

  const fetchRecurring = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/recurring');
      setRecurring(res.data.recurring);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load recurring transactions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecurring();
  }, [fetchRecurring]);

  const handleAddClick = () => {
    setEditingRecurring(null);
    setShowModal(true);
  };

  const handleEditClick = (recurringItem) => {
    setEditingRecurring(recurringItem);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingRecurring(null);
  };

  const handleRecurringSaved = async () => {
    handleModalClose();
    await fetchRecurring();
  };

  const handleToggle = async (recurringId) => {
    try {
      await api.patch(`/api/recurring/${recurringId}/toggle`);
      await fetchRecurring();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to toggle recurring transaction.');
    }
  };

  const handleDelete = async (recurringId) => {
    if (!window.confirm('Delete this recurring transaction? This will not delete already generated transactions.')) {
      return;
    }
    try {
      await api.delete(`/api/recurring/${recurringId}`);
      await fetchRecurring();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Delete failed.');
    }
  };

  const activeCount = recurring.filter(r => r.is_active).length;
  const pausedCount = recurring.filter(r => !r.is_active).length;

  return (
    <div className="recurring-page">
      <main className="recurring-content">
        <div className="recurring-header">
          <div className="recurring-header-left">
            <h2>Recurring Transactions</h2>
            <p className="recurring-subtitle">
              Automate your regular income and expenses
            </p>
          </div>
          <button
            className="btn-add-recurring"
            onClick={handleAddClick}
          >
            + Add Recurring Transaction
          </button>
        </div>

        <div className="recurring-summary">
          <div className="summary-card">
            <span className="summary-label">Total Recurring</span>
            <span className="summary-value">{recurring.length}</span>
          </div>
          <div className="summary-card active">
            <span className="summary-label">Active</span>
            <span className="summary-value">{activeCount}</span>
          </div>
          <div className="summary-card paused">
            <span className="summary-label">Paused</span>
            <span className="summary-value">{pausedCount}</span>
          </div>
        </div>

        {error && <p className="error-message">{error}</p>}

        {loading ? (
          <p className="loading-message">Loading recurring transactions...</p>
        ) : recurring.length === 0 ? (
          <div className="empty-state">
            <p>No recurring transactions yet.</p>
            <p>Create one to automate your regular income and expenses.</p>
          </div>
        ) : (
          <div className="recurring-list">
            {recurring.map(item => (
              <RecurringItem
                key={item._id}
                recurring={item}
                onEdit={handleEditClick}
                onDelete={handleDelete}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}
      </main>

      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        title={editingRecurring ? 'Edit Recurring Transaction' : 'Add Recurring Transaction'}
      >
        <RecurringForm
          recurring={editingRecurring}
          onSuccess={handleRecurringSaved}
        />
      </Modal>
    </div>
  );
};

export default RecurringTransactions;