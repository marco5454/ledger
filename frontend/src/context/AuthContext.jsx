// ============================================================
// FILE: context/AuthContext.jsx
// PURPOSE: Global authentication state management
// PHASE: Registration Update
// LAST MODIFIED: May 2, 2026
// CHANGES: - Added currency state and persistence
//          - Updated login() to handle fullName and currency
//          - Used centralized STORAGE_KEYS constants
// ============================================================

import { createContext, useEffect, useState } from 'react';

// [REG UPDATE ADDED] Use centralized key constants
import { STORAGE_KEYS } from '../utils/constants';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  // [PHASE 2 MODIFIED] — Added role to initial state
  const [role, setRole] = useState(
    localStorage.getItem(STORAGE_KEYS.ROLE) || null
  );

  // [REG UPDATE ADDED] Currency persists across refreshes
  const [currency, setCurrency] = useState(
    localStorage.getItem(STORAGE_KEYS.CURRENCY) || 'PHP'
  );

  // [REG UPDATE ADDED] fullName persists across refreshes
  const [fullName, setFullName] = useState(
    localStorage.getItem(STORAGE_KEYS.FULLNAME) || null
  );

  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // [REG UPDATE MODIFIED] login() — store role and name alongside token
  const login = (token, role, fullName, currency) => {
    localStorage.setItem(STORAGE_KEYS.TOKEN,    token);
    localStorage.setItem(STORAGE_KEYS.ROLE,     role);
    localStorage.setItem(STORAGE_KEYS.FULLNAME, fullName);
    localStorage.setItem(STORAGE_KEYS.CURRENCY, currency);
    setToken(token);
    setRole(role);
    setFullName(fullName); // [REG UPDATE ADDED]
    setCurrency(currency); // [REG UPDATE ADDED]
  };

  // [REG UPDATE MODIFIED] logout() — clear role and name on logout
  const logout = () => {
    Object.values(STORAGE_KEYS).forEach(key =>
      localStorage.removeItem(key)
    );
    setToken(null);
    setRole(null);
    setFullName(null); // [REG UPDATE ADDED]
    setCurrency('PHP'); // [REG UPDATE ADDED] reset to default
  };

  const isAuthenticated = Boolean(token);

  // [SETTINGS ADDED] updateUserContext()
  // PURPOSE: Updates fullName and currency in state and localStorage
  //          after a successful settings save — keeps UI in sync
  //          without requiring the user to log out and back in
  // PARAMS: updates (object) — { fullName?, currency? }
  const updateUserContext = (updates) => {
    if (updates.fullName) {
      localStorage.setItem(STORAGE_KEYS.FULLNAME, updates.fullName);
      setFullName(updates.fullName); // update state so navbar refreshes
    }
    if (updates.currency) {
      localStorage.setItem(STORAGE_KEYS.CURRENCY, updates.currency);
      setCurrency(updates.currency);
    }
  };

  // [SETTINGS MODIFIED] Expose updateUserContext in context value
  return (
    <AuthContext.Provider value={{ token, role, fullName, currency, login, logout, updateUserContext, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
