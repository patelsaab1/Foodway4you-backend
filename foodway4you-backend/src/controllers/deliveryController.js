import DeliveryPartner from '../models/DeliveryPartner.js';
import response from '../utils/responseHelper.js';

export const profile = async (req, res, next) => {
  try {
    const doc = await DeliveryPartner.findOne({ user: req.user.id });
    response.success(res, doc);
  } catch (err) {
    next(err);
  }
};

export const updateLocation = async (req, res, next) => {
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
