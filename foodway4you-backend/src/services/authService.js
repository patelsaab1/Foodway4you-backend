const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const sign = (payload, secret, options) => jwt.sign(payload, secret, options);
const verify = (token, secret) => jwt.verify(token, secret);
const hash = (value) => bcrypt.hash(value, 10);
const compare = (value, hashed) => bcrypt.compare(value, hashed);

module.exports = { sign, verify, hash, compare };

