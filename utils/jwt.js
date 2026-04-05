const jwt = require('jsonwebtoken');
const key = process.env.JWT_SECRET;

const now = Math.floor(Date.now() / 1000);
const exp = now + 60 * 60 * 24 * 15;

const generateToken = (id,role) => jwt.sign({id,role}, key , {expiresIn:exp});

module.exports = {  generateToken };