import React, { useState } from 'react';
import { formatDate } from '../utils/formatDate';

const TaskCard = ({ task, onEdit, onDelete, onStatusToggle, isAdmin }) => {
  const [isToggling, setIsToggling] = useState(false);

  const handleStatusClick = async () => {
    if (isToggling) return;
    setIsToggling(true);
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await onStatusToggle(task.id, newStatus);
    setIsToggling(false);
  };

  return (
    <div className={`task-card task-status-${task.status}`}>
      <div className="task-card-header">
        <h3 className="task-title">{task.title}</h3>
        <button
          type="button"
          className={`status-badge status-${task.status} ${isToggling ? 'status-toggling' : ''}`}
          onClick={handleStatusClick}
          title="Click to toggle status"
          disabled={isToggling}
        >
          {task.status}
        </button>
      </div>

      <p className="task-description">
        {task.description || <em className="empty-text">No description provided.</em>}
      </p>

      <div className="task-card-footer">
        <div className="task-meta">
          <span className="task-date">
            Created: {formatDate(task.createdAt)}
          </span>
          {isAdmin && (
            <span className="task-owner-badge" title={`User ID: ${task.userId}`}>
              Owner ID: {task.userId.substring(0, 8)}...
            </span>
          )}
        </div>

        <div className="task-actions">
          <button
            type="button"
            className="btn btn-text btn-sm"
            onClick={() => onEdit(task)}
          >
            Edit
          </button>
          <button
            type="button"
            className="btn btn-text btn-sm btn-text-danger"
            onClick={() => onDelete(task.id)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
