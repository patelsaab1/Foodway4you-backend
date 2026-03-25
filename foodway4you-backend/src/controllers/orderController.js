import Order from '../models/Order.js';
import response from '../utils/responseHelper.js';

export const place = async (req, res, next) => {
  try {
    const payload = { ...req.body, customer: req.user.id };
    const doc = await Order.create(payload);
    response.success(res, doc, 'Order placed', 201);
  } catch (err) {
    next(err);
  }
};

export const track = async (req, res, next) => {
 
  try {
    const doc = await Order.findById(req.params.id);
    if (!doc) return response.notFound(res);
    response.success(res, { status: doc.status, id: doc.id });

  } catch (err) {
    next(err);
  }

  
};

export const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const doc = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!doc) return response.notFound(res);
    response.success(res, doc, 'Status updated');
  } catch (err) {
    next(err);
  }
};

export const cancel = async (req, res, next) => {
  try {
    const { reason } = req.body;

  
    if (!reason || reason.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Cancellation reason is required. Please provide a reason to cancel the order."
      });
    }

    
    const doc = await Order.findByIdAndUpdate(
      req.params.id, 
      { 
        status: 'cancelled',
        cancellationReason: reason 
      }, 
      { new: true }
    );

    if (!doc) return response.notFound(res);

    response.success(res, doc, 'Order cancelled successfully with feedback');
  } catch (err) {
    next(err);
  }
};
