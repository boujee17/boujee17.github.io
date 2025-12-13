const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');

// app_api/controllers/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const sign = (user) =>
  jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });

exports.register = async (req, res, next) => {
  try {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
      return res.status(400).json({ error: 'email, name, and password are required' });
    }
    let user = await User.findOne({ email });
    if (user) return res.status(409).json({ error: 'Email already registered' });

    user = new User({ email, name, hash: 'temp' });
    await user.setPassword(password);   // uses bcrypt under the hood
    await user.save();

    res.status(201).json({ token: sign(user), user: user.toJSON() });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'email and password are required' });

    const user = await User.findOne({ email });
    if (!user || !(await user.validatePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ token: sign(user), user: user.toJSON() });
  } catch (err) {
    next(err);
  }
};
