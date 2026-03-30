import jwt from 'jsonwebtoken';

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '1d' }
  );

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
     { expiresIn:  process.env.JWT_REFRESH_EXPIRE || '7d'}

  );
  const days = parseInt(process.env.JWT_REFRESH_EXPIRE_DAYS, 10) || 7;
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  return { accessToken, refreshToken,expiresAt };
};

export default generateTokens;
