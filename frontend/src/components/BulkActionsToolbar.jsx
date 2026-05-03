import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/constants';

function BulkActionsToolbar({ 
  selectedCount, 
  onBulkDelete, 
  onBulkCategoryChange, 
  onBulkExport,
  onCancel 
}) {
  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    if (newCategory && window.confirm(`Change category for ${selectedCount} transaction(s)?`)) {
      onBulkCategoryChange(newCategory);
    }
  };

  return (
    <div className="bulk-actions-toolbar">
      <div className="bulk-actions-info">
        <span className="selected-count">{selectedCount} selected</span>
      </div>
      
      <div className="bulk-actions-buttons">
        <select 
          onChange={handleCategoryChange}
          className="bulk-category-select"
          defaultValue=""
        >
          <option value="" disabled>Change Category</option>
          <optgroup label="Income">
            {INCOME_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </optgroup>
          <optgroup label="Expense">
            {EXPENSE_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </optgroup>
        </select>
        
        <button 
          onClick={onBulkExport}
          className="btn-bulk-action btn-export-bulk"
        >
          📥 Export Selected
        </button>
        
        <button 
          onClick={onBulkDelete}
          className="btn-bulk-action btn-delete-bulk"
        >
          🗑️ Delete Selected
        </button>
        
        <button 
          onClick={onCancel}
          className="btn-bulk-action btn-cancel-bulk"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default BulkActionsToolbar;