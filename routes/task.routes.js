const express = require('express');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
} = require('../controllers/task.controller');
const {
  createTaskValidation,
  updateTaskValidation,
  taskIdValidation,
} = require('../validators/task.validator');

const router = express.Router();

router.use(protect);

router.route('/').post(createTaskValidation, validate, createTask).get(getTasks);

router
  .route('/:id')
  .get(taskIdValidation, validate, getTask)
  .put(updateTaskValidation, validate, updateTask)
  .delete(taskIdValidation, validate, deleteTask);

module.exports = router;
