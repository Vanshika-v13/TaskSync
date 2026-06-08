import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import Alert from '../components/Alert';

const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Task states
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Feedback alerts
  const [feedback, setFeedback] = useState({ message: '', type: 'success' });

  // Modal / Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Delete Confirmation States
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await API.get('/tasks');
      // Backend returns tasks inside response.data.data.tasks
      setTasks(response.data?.data?.tasks || []);
    } catch (err) {
      console.error('Fetch tasks error:', err);
      setError('Failed to fetch tasks. Please reload the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Show a temporary feedback message
  const showFeedback = (message, type = 'success') => {
    setFeedback({ message, type });
    // Auto clear after 4 seconds
    setTimeout(() => {
      setFeedback({ message: '', type: 'success' });
    }, 4000);
  };

  // Open form modal for creation
  const handleCreateClick = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  // Open form modal for editing
  const handleEditClick = (task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  // Handle Form Submission (Create or Edit)
  const handleFormSubmit = async (taskData) => {
    setFormLoading(true);
    try {
      if (editingTask) {
        // Update task
        const response = await API.put(`/tasks/${editingTask.id}`, taskData);
        const updatedTask = response.data?.data?.task;
        
        setTasks((prev) =>
          prev.map((t) => (t.id === editingTask.id ? updatedTask : t))
        );
        showFeedback('Task updated successfully.');
      } else {
        // Create task
        const response = await API.post('/tasks', taskData);
        const newTask = response.data?.data?.task;
        
        setTasks((prev) => [newTask, ...prev]);
        showFeedback('Task created successfully.');
      }
      setIsFormOpen(false);
      return { success: true };
    } catch (err) {
      console.error('Save task error:', err);
      const msg = err.response?.data?.message || 'Failed to save task.';
      return { success: false, error: msg };
    } finally {
      setFormLoading(false);
    }
  };

  // Trigger delete confirmation
  const handleDeleteClick = (taskId) => {
    setDeleteTaskId(taskId);
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!deleteTaskId) return;
    setIsDeleting(true);
    try {
      await API.delete(`/tasks/${deleteTaskId}`);
      setTasks((prev) => prev.filter((t) => t.id !== deleteTaskId));
      showFeedback('Task deleted successfully.', 'success');
      setDeleteTaskId(null);
    } catch (err) {
      console.error('Delete task error:', err);
      showFeedback(err.response?.data?.message || 'Failed to delete task.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Quick Status Toggle
  const handleStatusToggle = async (taskId, newStatus) => {
    try {
      const response = await API.put(`/tasks/${taskId}`, { status: newStatus });
      const updatedTask = response.data?.data?.task;
      
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? updatedTask : t))
      );
      showFeedback(`Task marked as ${newStatus}.`);
    } catch (err) {
      console.error('Toggle status error:', err);
      showFeedback(err.response?.data?.message || 'Failed to update task status.', 'error');
    }
  };

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const pendingTasks = tasks.filter((t) => t.status === 'pending').length;
  // Unique users who have tasks (only meaningful for Admin)
  const activeUsersCount = new Set(tasks.map((t) => t.userId)).size;

  return (
    <div className="dashboard-page">
      <Navbar />

      <main className="dashboard-content">
        {/* Statistics Panel */}
        <section className="stats-section">
          {isAdmin && (
            <div className="admin-alert-banner">
              <span className="admin-banner-icon">🛡️</span>
              <span className="admin-banner-text">
                <strong>Admin Mode:</strong> You are viewing and managing tasks for all users in the system.
              </span>
            </div>
          )}

          <div className="stats-grid">
            <div className="stat-card stat-total">
              <div className="stat-info">
                <span className="stat-label">Total Tasks</span>
                <span className="stat-value">{totalTasks}</span>
              </div>
              <span className="stat-icon">📋</span>
            </div>

            <div className="stat-card stat-pending">
              <div className="stat-info">
                <span className="stat-label">Pending</span>
                <span className="stat-value">{pendingTasks}</span>
              </div>
              <span className="stat-icon">⏳</span>
            </div>

            <div className="stat-card stat-completed">
              <div className="stat-info">
                <span className="stat-label">Completed</span>
                <span className="stat-value">{completedTasks}</span>
              </div>
              <span className="stat-icon">✅</span>
            </div>

            {isAdmin && (
              <div className="stat-card stat-users">
                <div className="stat-info">
                  <span className="stat-label">Active Users</span>
                  <span className="stat-value">{activeUsersCount}</span>
                </div>
                <span className="stat-icon">👥</span>
              </div>
            )}
          </div>
        </section>

        {/* Feedback Messages */}
        {feedback.message && (
          <div className="feedback-alert-wrapper">
            <Alert
              message={feedback.message}
              type={feedback.type}
              onClose={() => setFeedback({ message: '', type: 'success' })}
            />
          </div>
        )}

        {/* Task Management Section */}
        <section className="task-section">
          <div className="task-section-header">
            <div>
              <h2 className="section-title">
                {isAdmin ? 'System Task Management' : 'My Tasks'}
              </h2>
              <p className="section-subtitle">
                Create, update, and manage your checklist items. Click the status badge to toggle.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-with-icon"
              onClick={handleCreateClick}
            >
              <span className="btn-icon">+</span> Create Task
            </button>
          </div>

          <TaskList
            tasks={tasks}
            loading={loading}
            error={error}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onStatusToggle={handleStatusToggle}
            isAdmin={isAdmin}
          />
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

export default Dashboard;
