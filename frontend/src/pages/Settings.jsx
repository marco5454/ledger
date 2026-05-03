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

const Settings = () => {
  const { fullName, currency, updateUserContext } = useContext(AuthContext);

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
      <main className="settings-content">
        <div className="settings-header">
          <h1>Account Settings</h1>
          <p className="settings-subtitle">Manage your profile information and security settings</p>
        </div>

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

              <button 
                type="submit" 
                className={isLoading ? 'loading' : ''}
                disabled={isLoading}
              >
                Save Changes
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

              <button 
                type="submit" 
                className={isLoading ? 'loading' : ''}
                disabled={isLoading}
              >
                Update Password
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Minimalist Footer */}
      <footer className="settings-footer">
        <div className="footer-content">
          <div className="footer-company">
            <p className="company-name">M.M I.T Solutions</p>
            <p className="copyright">© 2026 M.M I.T Solutions. All rights reserved.</p>
          </div>
          <div className="footer-contact">
            <span className="contact-item">
              <svg className="contact-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 16.92V19.92C22 20.4728 21.5523 20.92 21 20.92H3C2.44772 20.92 2 20.4728 2 19.92V16.92M16 11.92L12 15.92M12 15.92L8 11.92M12 15.92V3.92" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              00000000000
            </span>
            <a href="mailto:contact@mmitsolutions.com" className="contact-item" aria-label="Email">
              <svg className="contact-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a href="https://messenger.com" target="_blank" rel="noopener noreferrer" className="contact-item" aria-label="Messenger">
              <svg className="contact-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.5 2 2 6.14 2 11.25C2 14.13 3.42 16.69 5.65 18.36V22L9.14 20.14C10.03 20.38 10.99 20.5 12 20.5C17.5 20.5 22 16.36 22 11.25C22 6.14 17.5 2 12 2ZM13.03 14.41L10.63 11.83L5.87 14.41L11.07 8.91L13.53 11.49L18.23 8.91L13.03 14.41Z" fill="currentColor"/>
              </svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="contact-item" aria-label="LinkedIn">
              <svg className="contact-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 8C17.5913 8 19.1174 8.63214 20.2426 9.75736C21.3679 10.8826 22 12.4087 22 14V21H18V14C18 13.4696 17.7893 12.9609 17.4142 12.5858C17.0391 12.2107 16.5304 12 16 12C15.4696 12 14.9609 12.2107 14.5858 12.5858C14.2107 12.9609 14 13.4696 14 14V21H10V14C10 12.4087 10.6321 10.8826 11.7574 9.75736C12.8826 8.63214 14.4087 8 16 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 9H2V21H6V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 6C5.10457 6 6 5.10457 6 4C6 2.89543 5.10457 2 4 2C2.89543 2 2 2.89543 2 4C2 5.10457 2.89543 6 4 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a href="https://portfolio.com" target="_blank" rel="noopener noreferrer" className="contact-item" aria-label="Portfolio">
              <svg className="contact-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 3C14.5 6 16 9 16 12C16 15 14.5 18 12 21M12 3C9.5 6 8 9 8 12C8 15 9.5 18 12 21M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Settings;
