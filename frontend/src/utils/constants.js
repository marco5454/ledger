// ============================================================
// FILE: src/utils/constants.js
// PURPOSE: Shared constants used across the frontend
// PHASE: Registration Update
// USAGE: import { CURRENCY_SYMBOLS, CURRENCY_OPTIONS }
//        from '../utils/constants'
// ============================================================

// Currency symbol lookup — used to display ₱, $, €, £
// wherever an amount is shown in the app
export const CURRENCY_SYMBOLS = {
  PHP: '₱',
  USD: '$',
  EUR: '€',
  GBP: '£'
};

// Currency dropdown options for the registration form
export const CURRENCY_OPTIONS = [
  { value: 'PHP', label: '🇵🇭 Philippine Peso (₱)' },
  { value: 'USD', label: '🇺🇸 US Dollar ($)'        },
  { value: 'EUR', label: '🇪🇺 Euro (€)'              },
  { value: 'GBP', label: '🇬🇧 British Pound (£)'    }
];

// localStorage key constants — prevents typo bugs
export const STORAGE_KEYS = {
  TOKEN:    'token',
  ROLE:     'role',
  FULLNAME: 'fullName',
  CURRENCY: 'currency'
};

// [SETTINGS ADDED] Settings tab identifiers
// Used to control which settings section is active
export const SETTINGS_TABS = {
  PROFILE:  'profile',
  PASSWORD: 'password'
};