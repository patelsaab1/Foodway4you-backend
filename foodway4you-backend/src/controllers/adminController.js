import response from '../utils/responseHelper.js';

export const dashboard = async (req, res, next) => {
  try {
    response.success(res, { status: 'ok' }, 'Admin dashboard');
  } catch (err) {
    next(err);
  }
};

