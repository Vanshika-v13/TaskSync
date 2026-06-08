import React from 'react';

const Alert = ({ message, type = 'error', onClose }) => {
  if (!message) return null;

  return (
    <div className={`alert alert-${type}`}>
      <span className="alert-message">{message}</span>
      {onClose && (
        <button type="button" className="alert-close-btn" onClick={onClose}>
          &times;
        </button>
      )}
    </div>
  );
};

export default Alert;
