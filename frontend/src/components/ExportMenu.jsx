import { useState, useRef, useEffect } from 'react';

function ExportMenu({ onExport, options = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleOptionClick = (option) => {
    onExport(option.value);
    setIsOpen(false);
  };

  return (
    <div className="export-menu" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-export"
        aria-label="Export options"
      >
        📥 Export CSV
      </button>
      
      {isOpen && (
        <div className="export-dropdown">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleOptionClick(option)}
              className="export-option"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ExportMenu;