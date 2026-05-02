// ============================================================
// FILE: pages/Settings.jsx
// PURPOSE: Lets user edit their fullName, currency, and password
// PHASE: Settings Update
// DEPENDENCIES: AuthContext, axios instance, constants
// ============================================================

import { useContext, useEffect, useState } from 'react';
import { api } from '../api/axios.js';
import { AuthContext } from '../context/AuthContext.jsx';
import { CURRENCY_OPTIONS, SETTINGS_TABS } from '../utils/constants.js';
import Navbar from '../components/Navbar.jsx';

const Settings = () => {
  const { logout, fullName, currency, updateUserContext } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState(SETTINGS_TABS.PROFILE);
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    currency: 'PHP'
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [profileMsg, setProfileMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    newPass: false,
    confirm: false
  });

  // FUNCTION: fetchProfile()
  // PURPOSE: Loads current user data from GET /api/user/profile
  //          to prefill the profile form on mount
  // Called once on component mount via useEffect
  // Sets profileForm state with returned fullName and currency
  const fetchProfile = async () => {
    try {
      const response = await api.get('/api/user/profile');
      setProfileForm({
        fullName: response.data.fullName,
        email: response.data.email,
        currency: response.data.currency
      });
    } catch (error) {
      setProfileError(error.response?.data?.message || 'Failed to load profile');
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // FUNCTION: handleProfileSubmit()
  // PURPOSE: Validates and sends PUT /api/user/profile
  // VALIDATION before API call:
  //   fullName: required, min 2 characters
  //   currency: must be valid option
  // On success:
  //   Call updateUserContext({ fullName, currency }) from AuthContext
  //   This updates navbar and dashboard immediately without re-login
  //   Show success: "Profile updated successfully"
  //   Clear message after 3000ms
  // On error:
  //   Show server error message in red below the form
  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileError('');
    setProfileMsg('');

    // Validate fullName
    if (!profileForm.fullName.trim()) {
      setProfileError('Full name is required');
      return;
    }
    if (profileForm.fullName.trim().length < 2) {
      setProfileError('Full name must be at least 2 characters');
      return;
    }

    // Validate currency
    if (!CURRENCY_OPTIONS.some(opt => opt.value === profileForm.currency)) {
      setProfileError('Please select a valid currency');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.put('/api/user/profile', {
        fullName: profileForm.fullName.trim(),
        currency: profileForm.currency
      });

      // [SETTINGS ADDED] Update context so navbar and dashboard show new values immediately
      updateUserContext({
        fullName: response.data.fullName,
        currency: response.data.currency
      });

      setProfileMsg('Profile updated successfully');
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (error) {
      setProfileError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  // FUNCTION: handlePasswordSubmit()
  // PURPOSE: Validates and sends PUT /api/user/password
  // VALIDATION before API call:
  //   currentPassword: required
  //   newPassword: min 8 chars, 1 uppercase, 1 number
  //   confirmNewPassword: must match newPassword
  // On success:
  //   Clear all three password fields
  //   Show success: "Password updated successfully"
  //   Clear message after 3000ms
  // On error:
  //   'Current password is incorrect' — show in red
  //   Generic fallback: 'Update failed. Please try again.'
  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordError('');
    setPasswordMsg('');

    // Validate currentPassword
    if (!passwordForm.currentPassword) {
      setPasswordError('Current password is required');
      return;
    }

    // Validate newPassword
    if (!passwordForm.newPassword) {
      setPasswordError('New password is required');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).+$/;
    if (!passwordRegex.test(passwordForm.newPassword)) {
      setPasswordError('Password must contain 1 uppercase letter and 1 number');
      return;
    }

    // Validate confirmNewPassword
    if (passwordForm.confirmNewPassword !== passwordForm.newPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await api.put('/api/user/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      // Clear form fields on success
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });

      setPasswordMsg('Password updated successfully');
      setTimeout(() => setPasswordMsg(''), 3000);
    } catch (error) {
      setPasswordError(error.response?.data?.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <Navbar onLogout={logout} />

      <main className="page-container">
        <h1>Account Settings</h1>

        {/* Tab buttons */}
        <div className="settings-tabs">
          <button
            className={`tab-button ${activeTab === SETTINGS_TABS.PROFILE ? 'active' : ''}`}
            onClick={() => setActiveTab(SETTINGS_TABS.PROFILE)}
            disabled={isLoading}
          >
            Profile
          </button>
          <button
            className={`tab-button ${activeTab === SETTINGS_TABS.PASSWORD ? 'active' : ''}`}
            onClick={() => setActiveTab(SETTINGS_TABS.PASSWORD)}
            disabled={isLoading}
          >
            Password
          </button>
        </div>

        {/* TAB 1 — PROFILE */}
        {activeTab === SETTINGS_TABS.PROFILE && (
          <div className="settings-form-container">
            {profileMsg && <div className="success-message">{profileMsg}</div>}
            {profileError && <div className="error-message">{profileError}</div>}

            <form onSubmit={handleProfileSubmit} className="form-card">
              <label>
                Full Name
                <input
                  type="text"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  disabled={isLoading}
                  required
                />
              </label>

              <label>
                Currency
                <select
                  value={profileForm.currency}
                  onChange={(e) => setProfileForm({ ...profileForm, currency: e.target.value })}
                  disabled={isLoading}
                  required
                >
                  {CURRENCY_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="settings-info-box">
                <strong>Email</strong>
                <p>{profileForm.email || 'Loading...'}</p>
                <small>Email cannot be changed</small>
              </div>

              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 2 — PASSWORD */}
        {activeTab === SETTINGS_TABS.PASSWORD && (
          <div className="settings-form-container">
            {passwordMsg && <div className="success-message">{passwordMsg}</div>}
            {passwordError && <div className="error-message">{passwordError}</div>}

            <form onSubmit={handlePasswordSubmit} className="form-card">
              <label>
                Current Password
                <div className="password-input-container">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    disabled={isLoading}
                  >
                    {showPasswords.current ? '🙈' : '👁️'}
                  </button>
                </div>
              </label>

              <label>
                New Password
                <div className="password-input-container">
                  <input
                    type={showPasswords.newPass ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPasswords({ ...showPasswords, newPass: !showPasswords.newPass })}
                    disabled={isLoading}
                  >
                    {showPasswords.newPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </label>

              <label>
                Confirm New Password
                <div className="password-input-container">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordForm.confirmNewPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    disabled={isLoading}
                  >
                    {showPasswords.confirm ? '🙈' : '👁️'}
                  </button>
                </div>
              </label>

              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default Settings;
