const Razorpay = require('razorpay');

let client = null;

const getRazorpay = () => {
  if (client) return client;

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) return null;

  client = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  return client;
};

module.exports = { getRazorpay };
