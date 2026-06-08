const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const validateAuthInput = ({ name, email, password }, isRegister = false) => {
  if (isRegister && !name?.trim()) {
    throw new AppError('Name is required', 400);
  }
  if (!email?.trim()) {
    throw new AppError('Email is required', 400);
  }
  if (!password) {
    throw new AppError('Password is required', 400);
  }
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  validateAuthInput({ name, email, password }, true);

  const user = await authService.registerUser({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
  });

  res.status(201).json({
    status: 'success',
    message: 'User registered successfully',
    data: { user },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  validateAuthInput({ email, password });

  const result = await authService.loginUser({
    email: email.trim().toLowerCase(),
    password,
  });

  res.status(200).json({
    status: 'success',
    message: 'Login successful',
    data: result,
  });
});

module.exports = { register, login };
