const DeliveryPartner = require('../models/DeliveryPartner');
const response = require('../utils/responseHelper');

exports.profile = async (req, res, next) => {
  try {
    const doc = await DeliveryPartner.findOne({ user: req.user.id });
    response.success(res, doc);
  } catch (err) {
    next(err);
  }
};

exports.updateLocation = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;
    const doc = await DeliveryPartner.findOneAndUpdate(
      { user: req.user.id },
      { currentLocation: { latitude, longitude } },
      { new: true }
    );
    response.success(res, doc, 'Location updated');
  } catch (err) {
    next(err);
  }
};

