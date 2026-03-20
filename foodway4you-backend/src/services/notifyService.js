const admin = require('../config/firebase');

const push = async (tokens, payload) => {
  if (!Array.isArray(tokens)) tokens = [tokens];
  if (!tokens.length) return null;
  return admin.messaging().sendMulticast({ tokens, notification: payload });
};

module.exports = { push };

