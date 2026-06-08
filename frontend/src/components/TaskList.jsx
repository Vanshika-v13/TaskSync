import React, { useState } from 'react';
import TaskCard from './TaskCard';
import Loader from './Loader';
import Alert from './Alert';

const TaskList = ({
  tasks = [],
  loading = false,
  error = '',
  onEdit,
  onDelete,
  onStatusToggle,
  isAdmin,
}) => {
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'completed'

  if (loading && tasks.length === 0) {
    return (
      <div className="task-list-loading-container">
        <Loader size="large" />
        <p>Fetching tasks...</p>
      </div>
    );
  }

  if (error) {
    return <Alert message={error} type="error" />;
  }

  // Filter tasks based on selected tab
  const filteredTasks = tasks.filter((task) => {
    if (filter === 'pending') return task.status === 'pending';
    if (filter === 'completed') return task.status === 'completed';
    return true;
  });

  return (
    <div className="task-list-container">
      {/* Filtering tabs */}
      <div className="task-filter-tabs">
        <button
          type="button"
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({tasks.length})
        </button>
        <button
          type="button"
          className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({tasks.filter((t) => t.status === 'pending').length})
        </button>
        <button
          type="button"
          className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed ({tasks.filter((t) => t.status === 'completed').length})
        </button>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="empty-state-card">
          <span className="empty-state-icon">📭</span>
          <h4>No tasks found</h4>
          <p className="empty-state-desc">
            {filter === 'all'
              ? "You haven't created any tasks yet."
              : `No tasks found with '${filter}' status.`}
          </p>
        </div>
      ) : (
        <div className="tasks-grid">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusToggle={onStatusToggle}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;
