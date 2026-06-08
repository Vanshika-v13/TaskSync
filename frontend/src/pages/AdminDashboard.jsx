import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import TaskForm from '../components/TaskForm';
import Alert from '../components/Alert';
import Loader from '../components/Loader';
import { formatDate } from '../utils/formatDate';

const AdminDashboard = () => {
  const { user } = useAuth();
  
  // Task state
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UI Control states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'completed'
  const [feedback, setFeedback] = useState({ message: '', type: 'success' });

  // Modal / Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Delete Confirmation States
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch all tasks (the backend automatically returns all user tasks if the requester is admin)
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await API.get('/tasks');
      setTasks(response.data?.data?.tasks || []);
    } catch (err) {
      console.error('Admin fetch tasks error:', err);
      setError('Failed to load system tasks. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const showFeedback = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => {
      setFeedback({ message: '', type: 'success' });
    }, 4500);
  };

  // Shorten MongoDB ObjectId to format 64ab89...e91f
  const formatOwnerId = (id) => {
    if (!id) return '';
    if (id.length <= 12) return id;
    return `${id.substring(0, 6)}...${id.substring(id.length - 4)}`;
  };

  // Quick toggle task status
  const handleStatusToggle = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      const response = await API.put(`/tasks/${task.id}`, { status: newStatus });
      const updatedTask = response.data?.data?.task;
      
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updatedTask : t)));
      showFeedback(`Task "${task.title}" updated to ${newStatus}.`);
    } catch (err) {
      console.error('Admin status toggle error:', err);
      showFeedback(err.response?.data?.message || 'Failed to update task status.', 'error');
    }
  };

  // Open Edit Modal
  const handleEditClick = (task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  // Handle Form submit (edit)
  const handleFormSubmit = async (taskData) => {
    setFormLoading(true);
    try {
      if (editingTask) {
        const response = await API.put(`/tasks/${editingTask.id}`, taskData);
        const updatedTask = response.data?.data?.task;
        
        setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? updatedTask : t)));
        showFeedback('Task updated successfully.');
      } else {
        // Fallback: Admin can also create tasks
        const response = await API.post('/tasks', taskData);
        const newTask = response.data?.data?.task;
        
        setTasks((prev) => [newTask, ...prev]);
        showFeedback('Task created successfully.');
      }
      setIsFormOpen(false);
      return { success: true };
    } catch (err) {
      console.error('Admin save task error:', err);
      const msg = err.response?.data?.message || 'Failed to save task.';
      return { success: false, error: msg };
    } finally {
      setFormLoading(false);
    }
  };

  // Open Delete confirmation
  const handleDeleteClick = (taskId) => {
    setDeleteTaskId(taskId);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteTaskId) return;
    setIsDeleting(true);
    try {
      await API.delete(`/tasks/${deleteTaskId}`);
      setTasks((prev) => prev.filter((t) => t.id !== deleteTaskId));
      showFeedback('Task deleted successfully.');
      setDeleteTaskId(null);
    } catch (err) {
      console.error('Admin delete task error:', err);
      showFeedback(err.response?.data?.message || 'Failed to delete task.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtering logic
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ? true : task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((t) => t.status === 'pending').length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="dashboard-page">
      <Navbar />

      <main className="dashboard-content">
        {/* Admin Header alert */}
        <section className="admin-alert-banner">
          <span className="admin-banner-icon">🛡️</span>
          <span className="admin-banner-text">
            <strong>Admin Dashboard Panel</strong> — Management and global overview of system tasks.
          </span>
        </section>

        {/* Admin Stats Section */}
        <section className="stats-section">
          <div className="stats-grid">
            <div className="stat-card stat-total">
              <div className="stat-info">
                <span className="stat-label">Total System Tasks</span>
                <span className="stat-value">{totalTasks}</span>
              </div>
              <span className="stat-icon">📋</span>
            </div>

            <div className="stat-card stat-pending">
              <div className="stat-info">
                <span className="stat-label">Pending System Tasks</span>
                <span className="stat-value">{pendingTasks}</span>
              </div>
              <span className="stat-icon">⏳</span>
            </div>

            <div className="stat-card stat-completed">
              <div className="stat-info">
                <span className="stat-label">Completed System Tasks</span>
                <span className="stat-value">{completedTasks}</span>
              </div>
              <span className="stat-icon">✅</span>
            </div>
          </div>
        </section>

        {/* Feedback alerts */}
        {feedback.message && (
          <div className="feedback-alert-wrapper">
            <Alert
              message={feedback.message}
              type={feedback.type}
              onClose={() => setFeedback({ message: '', type: 'success' })}
            />
          </div>
        )}

        {/* Admin Tasks Panel */}
        <section className="task-section">
          <div className="task-section-header">
            <div>
              <h2 className="section-title">All System Tasks</h2>
              <p className="section-subtitle">
                Search, filter, edit, or delete any task recorded in the database.
              </p>
            </div>
            
            {/* Action controls */}
            <div className="admin-controls-wrapper">
              <input
                type="text"
                className="form-control admin-search-input"
                placeholder="Search tasks by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              
              <select
                className="form-control admin-filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="task-list-loading-container">
              <Loader size="large" />
              <p>Loading system tasks...</p>
            </div>
          ) : error ? (
            <Alert message={error} type="error" />
          ) : filteredTasks.length === 0 ? (
            <div className="empty-state-card">
              <span className="empty-state-icon">🔍</span>
              <h4>No tasks match criteria</h4>
              <p className="empty-state-desc">
                Try adjusting your search query or status filter.
              </p>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th>Owner ID</th>
                    <th className="table-actions-col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => (
                    <tr key={task.id} className={`table-row-status-${task.status}`}>
                      <td className="table-cell-title">
                        <strong>{task.title}</strong>
                      </td>
                      <td className="table-cell-desc">
                        {task.description || <em className="empty-text">No description</em>}
                      </td>
                      <td className="table-cell-status">
                        <button
                          type="button"
                          className={`status-badge status-${task.status}`}
                          onClick={() => handleStatusToggle(task)}
                          title="Click to toggle status"
                        >
                          {task.status}
                        </button>
                      </td>
                      <td className="table-cell-date">{formatDate(task.createdAt)}</td>
                      <td className="table-cell-owner">
                        <code className="owner-id-code" title={task.userId}>
                          {formatOwnerId(task.userId)}
                        </code>
                      </td>
                      <td className="table-cell-actions">
                        <button
                          type="button"
                          className="btn btn-text btn-sm"
                          onClick={() => handleEditClick(task)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-text btn-sm btn-text-danger"
                          onClick={() => handleDeleteClick(task.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Task Form Modal */}
      {isFormOpen && (
        <TaskForm
          task={editingTask}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormOpen(false)}
          loading={formLoading}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTaskId && (
        <div className="task-form-overlay" onClick={() => setDeleteTaskId(null)}>
          <div className="task-form-modal delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Task</h3>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setDeleteTaskId(null)}
                disabled={isDeleting}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this task? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDeleteTaskId(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
