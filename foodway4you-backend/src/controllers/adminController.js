const response = require('../utils/responseHelper');

exports.dashboard = async (req, res, next) => {
  try {
    response.success(res, { status: 'ok' }, 'Admin dashboard');
  } catch (err) {
    next(err);
  }
};

