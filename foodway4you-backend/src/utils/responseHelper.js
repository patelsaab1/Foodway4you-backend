const responseHelper = {
  success: (res, data = null, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  },

  error: (res, message = 'Internal Server Error', statusCode = 500, errors = null) => {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(errors && { errors })
    });
  },

  validation: (res, errors) => {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  },

  unauthorized: (res, message = 'Unauthorized') => {
    return res.status(401).json({
      success: false,
      message
    });
  },

  notFound: (res, message = 'Resource not found') => {
    return res.status(404).json({
      success: false,
      message
    });
  }
};

module.exports = responseHelper;