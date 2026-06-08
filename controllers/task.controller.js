const Task = require('../models/task.model');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const isAdmin = (user) => user.role === 'admin';

const formatTask = (task) => ({
  id: task._id,
  title: task.title,
  description: task.description,
  status: task.status,
  userId: task.userId,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
});

const getTaskOrThrow = async (taskId) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError('Task not found', 404);
  }
  return task;
};

const assertTaskAccess = (task, user) => {
  if (isAdmin(user)) return;

  if (task.userId.toString() !== user._id.toString()) {
    throw new ApiError('You do not have permission to access this task', 403);
  }
};

const createTask = asyncHandler(async (req, res) => {
  const { title, description, status } = req.body;

  const task = await Task.create({
    title: title.trim(),
    description: description?.trim() || '',
    status: status || 'pending',
    userId: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: { task: formatTask(task) },
  });
});

const getTasks = asyncHandler(async (req, res) => {
  const filter = isAdmin(req.user) ? {} : { userId: req.user._id };
  const tasks = await Task.find(filter).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    results: tasks.length,
    data: { tasks: tasks.map(formatTask) },
  });
});

const getTask = asyncHandler(async (req, res) => {
  const task = await getTaskOrThrow(req.params.id);
  assertTaskAccess(task, req.user);

  res.status(200).json({
    success: true,
    data: { task: formatTask(task) },
  });
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await getTaskOrThrow(req.params.id);
  assertTaskAccess(task, req.user);

  const { title, description, status } = req.body;

  if (title !== undefined) {
    task.title = title.trim();
  }

  if (description !== undefined) {
    task.description = description.trim();
  }

  if (status !== undefined) {
    task.status = status;
  }

  await task.save();

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: { task: formatTask(task) },
  });
});

const deleteTask = asyncHandler(async (req, res) => {
  const task = await getTaskOrThrow(req.params.id);
  assertTaskAccess(task, req.user);

  await task.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully',
  });
});

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
};
