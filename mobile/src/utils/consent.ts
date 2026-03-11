// Texte légal du consentement parental — version 1.0
// ⚠️ Ce texte est versionnée. Toute modification crée une nouvelle version.
export const CONSENT_TEXTS: Record<string, string> = {
  '1.0': `En créant ce compte, vous (le parent ou tuteur légal) consentez à :
• La collecte et le traitement de votre adresse e-mail pour la gestion du compte.
• La création de profils enfants identifiés uniquement par un pseudonyme (aucun nom réel).
• L'utilisation de MaTirelire comme outil éducatif virtuel (aucun argent réel, aucune publicité).
• La conservation de votre consentement avec horodatage, version et méthode de vérification, conformément au RGPD.

Vous disposez d'un droit d'accès, de rectification et de suppression de vos données.
Pour exercer ces droits ou pour toute question : contact@matirelire.app

MaTirelire — Version CGU : 1.0 — Date : 2025-01-01`,
};

export const CURRENT_CONSENT_VERSION = '1.0';

export function getConsentText(version: string = CURRENT_CONSENT_VERSION): string {
  return CONSENT_TEXTS[version] ?? CONSENT_TEXTS[CURRENT_CONSENT_VERSION];
}
