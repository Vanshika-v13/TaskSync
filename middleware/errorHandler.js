const ApiError = require('../utils/ApiError');

const handleCastError = (err) => {
  if (err.path === '_id') {
    return new ApiError('Resource not found', 404);
  }
  return new ApiError(`Invalid ${err.path}: ${err.value}`, 400);
};

const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue || {})[0];

  if (field === 'email') {
    return new ApiError('Email is already registered', 400);
  }

  const value = err.keyValue?.[field];
  return new ApiError(`Duplicate field value: ${field} = ${value}`, 400);
};

const handleMongooseValidationError = (err) => {
  const errors = Object.values(err.errors).map((error) => error.message);
  return new ApiError(`Invalid input data. ${errors.join('. ')}`, 400);
};

const handleJWTError = () =>
  new ApiError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = () =>
  new ApiError('Your token has expired. Please log in again.', 401);

const sendErrorResponse = (err, res) => {
  const response = {
    success: false,
    message: err.message,
  };

  if (process.env.NODE_ENV === 'development') {
    if (err.errors) {
      response.errors = err.errors;
    }
    if (err.stack) {
      response.stack = err.stack;
    }
  }

  res.status(err.statusCode).json(response);
};

const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    error = new ApiError(error.message || 'Something went wrong', error.statusCode || 500);
    error.isOperational = false;
    error.stack = err.stack;
  }

  if (err.name === 'CastError') error = handleCastError(err);
  if (err.code === 11000) error = handleDuplicateKeyError(err);
  if (err.name === 'ValidationError' && err.errors) error = handleMongooseValidationError(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

  if (!error.isOperational) {
    console.error('ERROR:', err);
    error.message = 'Something went wrong';
    error.statusCode = 500;
  }

  sendErrorResponse(error, res);
};

module.exports = errorHandler;
