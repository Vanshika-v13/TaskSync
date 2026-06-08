const User = require('../models/User');
const ApiError = require('../utils/ApiError');
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
    throw new ApiError('You are not logged in. Please provide a valid token.', 401);
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError('Your token has expired. Please log in again.', 401);
    }
    throw new ApiError('Invalid token. Please log in again.', 401);
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new ApiError('The user belonging to this token no longer exists.', 401);
  }

  req.user = user;
  next();
});

const adminOnly = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError('You are not logged in. Please provide a valid token.', 401));
  }

  if (req.user.role !== 'admin') {
    return next(new ApiError('You do not have permission to perform this action.', 403));
  }

  next();
};

module.exports = { protect, adminOnly };
