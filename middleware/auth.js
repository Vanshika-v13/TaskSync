const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyToken } = require('../utils/jwt');

const extractBearerToken = (authHeader) => {
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];
};

const protect = asyncHandler(async (req, res, next) => {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    throw new AppError('You are not logged in. Please provide a valid token.', 401);
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Your token has expired. Please log in again.', 401);
    }
    throw new AppError('Invalid token. Please log in again.', 401);
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new AppError('The user belonging to this token no longer exists.', 401);
  }

  req.user = user;
  next();
});

const adminOnly = (req, res, next) => {
  if (!req.user) {
    return next(new AppError('You are not logged in. Please provide a valid token.', 401));
  }

  if (req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to perform this action.', 403));
  }

  next();
};

module.exports = { protect, adminOnly };
