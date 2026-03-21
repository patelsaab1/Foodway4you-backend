import { getFirebaseAdmin } from '../config/firebase.js';

const push = async (tokens, payload) => {
  const admin = getFirebaseAdmin();
  if (!admin) return null;
  if (!Array.isArray(tokens)) tokens = [tokens];
  if (!tokens.length) return null;
  return admin.messaging().sendMulticast({ tokens, notification: payload });
};

export { push };
