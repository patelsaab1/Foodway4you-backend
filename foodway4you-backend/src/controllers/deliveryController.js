import DeliveryPartner from '../models/DeliveryPartner.js';
import response from '../utils/responseHelper.js';

export const createDeliveryPartner = async (req, res, next) => {
  try {

    const partner = await DeliveryPartner.create({
      user: req.user._id,   
      vehicleType: req.body.vehicleType,
      vehicleNumber: req.body.vehicleNumber,
      drivingLicense: req.body.drivingLicense,
      licenseExpiry: req.body.licenseExpiry,
      currentLocation: {
        latitude: req.body.currentLocation?.latitude,
        longitude: req.body.currentLocation?.longitude
      },
      documents: {
        licenseImage: req.body.documents?.licenseImage,
        vehicleImage: req.body.documents?.vehicleImage,
        profileImage: req.body.documents?.profileImage
      }
    });

const io = req.app.get("io");
    io.emit("deliveryPartner:new", {
      partnerId: partner._id,
      user: partner.user
    });

    res.status(201).json({
      success: true,
      message: "Delivery partner created successfully",
      data: partner
    });

  } catch (error) {
    next(error);
  }
};

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

    // socketio
    const io = req.app.get("io");
    io.emit("delivery:locationUpdate", {
      partnerId: doc._id,
      location: doc.currentLocation
    });
    
    response.success(res, doc, 'Location updated');
  } catch (err) {
    next(err);
  }
};

export const getAll = async(req,res,next) => {
  try{
    const all = await DeliveryPartner.find({}, "currentLocation user");
    response.success(res, all, "All riders location")
  }
  catch(error){
    next(error)
  }
}
