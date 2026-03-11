// Configuration applicative globale
export const APP_CONFIG = {
  name: 'MaTirelire',
  version: '1.0.0',
  consentVersion: '1.0',

  // Gamification
  xpPerMission: 10,
  xpPerLevel: 100,

  // Limites métier
  maxChildrenPerParent: 5,
  maxReward: 9999.99,
  minReward: 0.01,
  maxMissionTitle: 100,
  minChildAge: 5,
  maxChildAge: 18,

  // Pagination
  defaultPageSize: 20,
  transactionsPageSize: 50,
} as const;

// Deep links
export const DEEP_LINKS = {
  resetPassword: 'matirelire://reset-password',
  consentCallback: 'matirelire://consent-callback',
} as const;
