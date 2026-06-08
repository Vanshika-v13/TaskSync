import React, { useState, useEffect } from 'react';
import InputField from './InputField';
import Button from './Button';
import Alert from './Alert';

const TaskForm = ({ task = null, onSubmit, onCancel, loading = false }) => {
  const isEditMode = !!task;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
  });

  const [errors, setErrors] = useState({
    title: '',
  });

  const [apiError, setApiError] = useState('');

  // Populate form if in edit mode
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'pending',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'pending',
      });
    }
    setErrors({ title: '' });
    setApiError('');
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation error on change
    if (name === 'title') {
      if (value.trim().length >= 3) {
        setErrors((prev) => ({ ...prev, title: '' }));
      }
    }
  };

  const validate = () => {
    let isValid = true;
    const newErrors = { title: '' };

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setApiError('');
    const result = await onSubmit({
      title: formData.title.trim(),
      description: formData.description.trim(),
      status: formData.status,
    });

    if (result && !result.success) {
      setApiError(result.error || 'Failed to save task.');
    }
  };

  return (
    <div className="task-form-overlay" onClick={onCancel}>
      <div className="task-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEditMode ? 'Edit Task' : 'Create New Task'}</h3>
          <button type="button" className="close-modal-btn" onClick={onCancel}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {apiError && <Alert message={apiError} type="error" />}

          <InputField
            label="Task Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter task title (min. 3 characters)"
            error={errors.title}
            required
            disabled={loading}
          />

          <InputField
            label="Description"
            type="textarea"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter task description (optional)"
            disabled={loading}
            rows={4}
          />

          <InputField
            label="Status"
            type="select"
            name="status"
            value={formData.status}
            onChange={handleChange}
            disabled={loading}
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'completed', label: 'Completed' },
            ]}
          />

          <div className="modal-footer">
            <Button
              variant="secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading || !!errors.title}
            >
              {isEditMode ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
