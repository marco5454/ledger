// ============================================================
// FILE: models/User.js
// PURPOSE: User schema for authentication and password handling
// PHASE: Registration Update
// LAST MODIFIED: May 2, 2026
// CHANGES: - Replaced 'name' field with 'fullName' for clarity
//          - Added 'currency' field with enum validation
// ============================================================

// User schema for authentication and password handling.
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // [REG UPDATE ADDED] fullName replaces 'name' for clarity
  // Trimmed to remove accidental leading/trailing spaces
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name must not exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // [PHASE 2 ADDED] — Role field for access control
  // Default is 'user'. Only seeding script or admin can set 'admin'
  role: {
    type: String,
    enum: ['admin', 'user'], // only these two values allowed
    default: 'user'          // every new registration = user
  },

  // [REG UPDATE ADDED] Currency preference set at registration
  // Used to display correct symbol throughout the app
  // Defaults to PHP since primary user is based in Philippines
  currency: {
    type: String,
    enum: {
      values: ['PHP', 'USD', 'EUR', 'GBP'],
      message: 'Currency must be PHP, USD, EUR, or GBP'
    },
    default: 'PHP'
  }
});

// Hash password before saving to the database.
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare submitted password with stored hash.
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
