// ============================================================
// FILE: components/Modal.jsx
// PURPOSE: Reusable overlay modal wrapper component
// PHASE: UI Update
// CHANGES: New component for displaying forms/content in overlay
// ============================================================

import { useEffect } from 'react';

// FUNCTION: Modal()
// PURPOSE: Renders a centered overlay card on top of the page
// PARAMS:
//   isOpen (boolean)   — controls visibility
//   onClose (function) — called when X or backdrop is clicked
//   title (string)     — shown in modal header
//   children           — content rendered inside modal body
// RETURNS: Modal overlay with centered card, or null if not isOpen
const Modal = ({ isOpen, onClose, title, children }) => {
  // [UI UPDATE ADDED] Handle Escape key to close modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      {/* [UI UPDATE ADDED] Modal card container */}
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* [UI UPDATE ADDED] Modal header with title and close button */}
        <div className="modal-header">
          <h2>{title}</h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* [UI UPDATE ADDED] Modal body containing form or content */}
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
