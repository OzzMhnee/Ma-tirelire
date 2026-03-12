const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix: empêcher Metro de charger les fichiers ESM (.mjs) des packages comme
// zustand v5 qui contiennent `import.meta.env` (invalide hors module ES).
// On retire la condition 'import' pour forcer la résolution CJS ('require' / 'react-native').
config.resolver.unstable_conditionNames = [
  'browser',
  'require',
  'react-native',
  'default',
];

module.exports = config;
