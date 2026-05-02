// ============================================================
// FILE: pages/Register.jsx
// PURPOSE: New user registration form with all updated fields
// PHASE: Registration Update
// ============================================================

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/axios.js';
import { CURRENCY_OPTIONS } from '../utils/constants.js';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    currency: 'PHP'  // default selected
  });
  const [errors, setErrors]       = useState({});
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg]   = useState('');
  const [isLoading, setIsLoading]     = useState(false);
  const [showPassword, setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword]
                                               = useState(false);

  // FUNCTION: validateForm()
  // PURPOSE: Validates all fields before API call
  // RETURNS: errors object — empty means valid
  // NOTE: confirmPassword is validated here but never sent to API
  const validateForm = () => {
    const newErrors = {};

    // fullName: required, min 2 chars
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    // email: required, must contain @ and .
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!formData.email.includes('@') || !formData.email.includes('.')) {
      newErrors.email = 'Please enter a valid email address';
    }

    // password: min 8 chars, 1 uppercase, 1 number
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else {
      const hasUppercase = /[A-Z]/.test(formData.password);
      const hasNumber = /\d/.test(formData.password);
      if (!hasUppercase || !hasNumber) {
        newErrors.password = 'Min 8 characters, 1 uppercase, 1 number';
      }
    }

    // confirmPassword: must match password exactly
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // currency: must be one of CURRENCY_OPTIONS values
    if (!formData.currency || !CURRENCY_OPTIONS.some(opt => opt.value === formData.currency)) {
      newErrors.currency = 'Please select a currency';
    }

    return newErrors;
  };

  // FUNCTION: handleSubmit()
  // PURPOSE: Validates form, calls POST /api/auth/register,
  //          shows success message, redirects to /login
  // On success:
  //   - Show: "Account created! Redirecting to login..."
  //   - Wait 1500ms then navigate('/login')
  // On error:
  //   - If server returns errors array: show first error
  //   - If email already exists: "This email is already registered."
  //   - Generic fallback: "Registration failed. Please try again."
  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError('');
    setSuccessMsg('');

    // Run frontend validation
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      // [REG UPDATE IMPORTANT]
      // confirmPassword is used for frontend validation only
      // It is intentionally excluded from the API request body
      // The backend never receives or stores confirmPassword
      // Only send: { fullName, email, password, currency }
      const { confirmPassword, ...requestData } = formData;

      await api.post('/api/auth/register', requestData);

      setSuccessMsg('✅ Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (requestError) {
      const errorData = requestError.response?.data;
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        setServerError(errorData.errors[0]);
      } else if (errorData?.message) {
        setServerError(errorData.message);
      } else {
        setServerError('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // FUNCTION: handleChange()
  // PURPOSE: Updates formData state and clears the error
  //          for that specific field on every keystroke
  // WHY: Clears error inline as user corrects their input
  //      instead of waiting for them to resubmit
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field as user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="page-container">
      <h1>Create Account</h1>

      {successMsg && (
        <div className="success-message" style={{ color: 'green', marginBottom: '1rem' }}>
          {successMsg}
        </div>
      )}

      {serverError && (
        <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-card">
        {/* Full Name */}
        <label>
          Full Name
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            disabled={isLoading}
            required
          />
          {errors.fullName && <span className="field-error">{errors.fullName}</span>}
        </label>

        {/* Email */}
        <label>
          Email
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            disabled={isLoading}
            required
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </label>

        {/* Password */}
        <label>
          Password
          <div className="password-input-container">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              disabled={isLoading}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {errors.password && <span className="field-error">{errors.password}</span>}
        </label>

        {/* Confirm Password */}
        <label>
          Confirm Password
          <div className="password-input-container">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              disabled={isLoading}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
            >
              {showConfirmPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
        </label>

        {/* Currency */}
        <label>
          Currency
          <select
            value={formData.currency}
            onChange={(e) => handleChange('currency', e.target.value)}
            disabled={isLoading}
            required
          >
            {CURRENCY_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.currency && <span className="field-error">{errors.currency}</span>}
        </label>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
};

export default Register;
