import Restaurant from '../models/Restaurant.js';
import response from '../utils/responseHelper.js';

const normalizePhone = (value) => (value || '').toString().trim();
const normalizeEmail = (value) => (value || '').toString().trim().toLowerCase();

export const create = async (req, res, next) => {
  try {
    const data = { ...req.body, owner: req.user.id };
    const doc = await Restaurant.create(data);

    // applying socketio
    const io = req.app.get("io");
    io.emit("restaurant:new",{
      restaurantId:doc._id,
      name: doc.name
    });

    response.success(res, doc, 'Created', 201);
  } catch (err) {
    next(err);
  }
};

export const list = async (req, res, next) => {
  try {
    const docs = await Restaurant.find().sort({ createdAt: -1 });
    response.success(res, docs);
  } catch (err) {
    next(err);
  }
};

export const me = async (req, res, next) => {
  try {
    const doc = await Restaurant.findOne({ owner: req.user.id });
    return response.success(res, doc);
  } catch (err) {
    next(err);
  }
};

export const onboard = async (req, res, next) => {
  try {
    const payload = { ...req.body, owner: req.user.id };
    if (payload?.contact?.phone) payload.contact.phone = normalizePhone(payload.contact.phone);
    if (payload?.contact?.email) payload.contact.email = normalizeEmail(payload.contact.email);

    const doc = await Restaurant.findOneAndUpdate(
      { owner: req.user.id },
      {
        $set: {
          ...payload,
          'onboarding.status': 'pending',
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    return response.success(res, doc, 'Onboarding saved');
  } catch (err) {
    next(err);
  }
};

export const submitKyc = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    if (!restaurant) return response.error(res, 'Restaurant onboarding not found', 404);

    const { kyc } = req.body || {};
    if (!kyc) return response.error(res, 'KYC payload required', 400);

    restaurant.kyc = {
      ...restaurant.kyc?.toObject?.(),
      ...kyc,
      documents: { ...(restaurant.kyc?.documents?.toObject?.() || {}), ...(kyc.documents || {}) },
      bank: { ...(restaurant.kyc?.bank?.toObject?.() || {}), ...(kyc.bank || {}) },
    };

    restaurant.onboarding = {
      ...restaurant.onboarding?.toObject?.(),
      status: 'submitted',
      submittedAt: new Date(),
      rejectedAt: null,
      rejectionReason: '',
    };

    await restaurant.save();
    // socketio
    const io = req.app.get("io");
    io.emit("restaurant:kycSubmitted", {
      restaurantId: restaurant._id,
      owner: restaurant.owner
    });
    return response.success(res, restaurant, 'KYC submitted');
  } catch (err) {
    next(err);
  }
};

export const kycStatus = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id }).select('onboarding kyc owner');
    if (!restaurant) return response.error(res, 'Restaurant onboarding not found', 404);
    return response.success(res, { onboarding: restaurant.onboarding, kyc: restaurant.kyc });
  } catch (err) {
    next(err);
  }
};

export const get = async (req, res, next) => {
  try {
    const doc = await Restaurant.findById(req.params.id);
    if (!doc) return response.notFound(res);
    response.success(res, doc);
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const doc = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doc) return response.notFound(res);
    response.success(res, doc, 'Updated');
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    const doc = await Restaurant.findByIdAndDelete(req.params.id);
    if (!doc) return response.notFound(res);
    response.success(res, null, 'Deleted');
  } catch (err) {
    next(err);
  }
};