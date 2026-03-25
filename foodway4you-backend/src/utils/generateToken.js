import jwt from 'jsonwebtoken';

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
<<<<<<< HEAD
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
=======
    { expiresIn: process.env.JWT_EXPIRE || '1d' }
>>>>>>> 1398f8b98419376cb5c17e2535671049c346a195
  );

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );

  return { accessToken, refreshToken };
};

export default generateTokens;
