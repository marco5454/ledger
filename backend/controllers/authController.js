// ============================================================
// FILE: controllers/authController.js
// PURPOSE: Controller for authentication routes: register and login
// PHASE: Registration Update
// LAST MODIFIED: May 2, 2026
// CHANGES: - Updated register function with fullName and currency fields
//          - Added comprehensive server-side validation
//          - Updated login function to return fullName and currency
// ============================================================

// Controller for authentication routes: register and login.
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const generateToken = (userId, role, currency) => {
  // [REG UPDATE MODIFIED] fullName replaces name in token payload
  return jwt.sign({ id: userId, role, currency }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

exports.register = async (req, res) => {
  try {
    // [REG UPDATE MODIFIED] Added currency, renamed name to fullName
    const { fullName, email, password, currency } = req.body;
    // confirmPassword is never sent to backend — frontend strips it

    // [REG UPDATE ADDED] Server-side validation
    // Never rely on frontend validation alone — always validate on server
    const validationErrors = [];

    if (!fullName || fullName.trim().length < 2) {
      validationErrors.push('Full name must be at least 2 characters');
    }
    if (!email || !email.includes('@')) {
      validationErrors.push('Valid email is required');
    }
    if (!password || password.length < 8) {
      validationErrors.push('Password must be at least 8 characters');
    }
    // Check password has at least one uppercase and one number
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).+$/;
    if (!passwordRegex.test(password)) {
      validationErrors.push(
        'Password must contain at least one uppercase letter and one number'
      );
    }
    const validCurrencies = ['PHP', 'USD', 'EUR', 'GBP'];
    if (currency && !validCurrencies.includes(currency)) {
      validationErrors.push('Invalid currency selected');
    }
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // [REG UPDATE MODIFIED] Create user with fullName and currency
    const user = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password,
      currency: currency || 'PHP' // fallback to PHP if not provided
    });
    const token = generateToken(user._id, user.role, user.currency);

    // [REG UPDATE MODIFIED] Confirm registration with safe fields only
    // Never return password — even hashed
    res.status(201).json({
      message: 'Registration successful',
      user: {
        fullName: user.fullName,
        email: user.email,
        currency: user.currency
      }
    });
  } catch (error) {
    console.error('Register error:', error.message);
    return res.status(500).json({ message: 'Failed to register user' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, user.role, user.currency);
    return res.status(200).json({
      // [REG UPDATE MODIFIED] Return fullName and currency to frontend
      token,
      role: user.role,
      fullName: user.fullName,  // [REG UPDATE MODIFIED]
      currency: user.currency   // [REG UPDATE ADDED]
    });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ message: 'Failed to log in' });
  }
};
