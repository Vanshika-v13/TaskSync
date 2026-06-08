const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array();
    const message = formattedErrors.map((error) => error.msg).join('. ');

    return next(new ApiError(message, 400, formattedErrors));
  }

  next();
};

module.exports = validate;
