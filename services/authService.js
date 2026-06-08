const User = require('../models/User');
const AppError = require('../utils/AppError');
const { signToken } = require('../utils/jwt');

const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email is already registered', 400);
  }

  const user = await User.create({ name, email, password });
  return user.toPublicJSON();
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = signToken(user._id);

  return {
    token,
    user: user.toPublicJSON(),
  };
};

module.exports = { registerUser, loginUser };
