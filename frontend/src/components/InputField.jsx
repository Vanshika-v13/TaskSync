import React from 'react';

const InputField = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder = '',
  error = '',
  required = false,
  options = [],
  rows = 3,
  className = '',
  ...props
}) => {
  const isTextarea = type === 'textarea';
  const isSelect = type === 'select';

  return (
    <div className={`form-group ${error ? 'has-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="required-marker"> *</span>}
        </label>
      )}

      {isTextarea ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="form-control form-textarea"
          rows={rows}
          required={required}
          {...props}
        />
      ) : isSelect ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className="form-control form-select"
          required={required}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="form-control"
          required={required}
          {...props}
        />
      )}

      {error && <span className="form-error-message">{error}</span>}
    </div>
  );
};

export default InputField;
