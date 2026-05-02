// ============================================================
// FILE: controllers/userController.js
// PURPOSE: Handles user profile read and update operations
// PHASE: Settings Update
// DEPENDENCIES: User model, bcryptjs
// ============================================================

const User = require('../models/User');
const bcrypt = require('bcryptjs');

// FUNCTION: getProfile()
// PURPOSE: Returns the logged-in user's profile data
// PARAMS: req.user.id — from authMiddleware decoded JWT
// RETURNS: { fullName, email, currency, role, createdAt }
// ERRORS: 404 if user not found, 500 on DB error
// NOTE: Never return password field — use .select('-password')
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      fullName: user.fullName,
      email: user.email,
      currency: user.currency,
      role: user.role,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('[getProfile] Error:', error.message);
    res.status(500).json({ message: 'Failed to load profile' });
  }
};

// FUNCTION: updateProfile()
// PURPOSE: Updates fullName and/or currency for logged-in user
// PARAMS: req.body { fullName, currency } — both optional
//         req.user.id — from authMiddleware
// RETURNS: Updated user object { fullName, email, currency }
// ERRORS:
//   400 if fullName is provided but less than 2 characters
//   400 if currency is provided but not in allowed list
//   404 if user not found
//   500 on DB error
// NOTE: Only update fields that are actually provided in body
//       Use findByIdAndUpdate with { new: true, runValidators: true }
//       Never allow role or email to be updated here
exports.updateProfile = async (req, res) => {
  try {
    // [SETTINGS ADDED] Destructure only allowed fields, ignore the rest
    // This prevents malicious attempts to change role or email
    const { fullName, currency } = req.body;

    const updateData = {};

    // [SETTINGS ADDED] Validate and add fullName if provided
    if (fullName !== undefined) {
      if (!fullName || fullName.trim().length < 2) {
        return res.status(400).json({ message: 'Full name must be at least 2 characters' });
      }
      updateData.fullName = fullName.trim();
    }

    // [SETTINGS ADDED] Validate and add currency if provided
    if (currency !== undefined) {
      const validCurrencies = ['PHP', 'USD', 'EUR', 'GBP'];
      if (!validCurrencies.includes(currency)) {
        return res.status(400).json({ message: 'Invalid currency selected' });
      }
      updateData.currency = currency;
    }

    // [SETTINGS ADDED] If nothing to update, return error
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    // [SETTINGS ADDED] Update with validation enabled
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      fullName: user.fullName,
      email: user.email,
      currency: user.currency
    });
  } catch (error) {
    console.error('[updateProfile] Error:', error.message);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

// FUNCTION: updatePassword()
// PURPOSE: Validates current password then updates to new one
// PARAMS: req.body { currentPassword, newPassword }
//         req.user.id — from authMiddleware
// RETURNS: { message: 'Password updated successfully' }
// ERRORS:
//   400 if currentPassword or newPassword missing
//   400 if newPassword less than 8 chars, no uppercase, no number
//   401 if currentPassword does not match stored hash
//   404 if user not found
//   500 on DB error
// STEPS:
//   1. Find user by id — include password this time (no .select)
//   2. Compare currentPassword using bcrypt.compare()
//   3. If no match: return 401 'Current password is incorrect'
//   4. Validate newPassword strength with regex
//   5. Set user.password = newPassword (pre-save hook hashes it)
//   6. Save user
//   7. Return success message
// NOTE: Do NOT manually hash the password here
//       The User model pre-save hook handles hashing automatically
//       Just assign plain text and call user.save()
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // [SETTINGS ADDED] Validate both passwords are provided
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' });
    }

    // [SETTINGS ADDED] Find user — must include password to compare
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // [SETTINGS ADDED] Verify current password matches
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // [SETTINGS ADDED] Validate new password strength
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).+$/;
    if (newPassword.length < 8 || !passwordRegex.test(newPassword)) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters with 1 uppercase letter and 1 number' 
      });
    }

    // [SETTINGS ADDED] Assign new password (pre-save hook will hash it)
    // Do NOT manually hash here — the pre-save hook handles it
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('[updatePassword] Error:', error.message);
    res.status(500).json({ message: 'Failed to update password' });
  }
};
