// Types domaine MaTirelire — couche métier (indépendants de la DB)

export type AppRole = 'parent' | 'child';

export type AppFont = 'arial' | 'dyslexic';
export type AppLanguage = 'fr' | 'en';
export type AppThemeName = 'light' | 'dark' | 'kids';

// ─── Parent ──────────────────────────────────────────────────
export interface ParentUser {
  id: string;
  email: string;
  username: string | null;
  settings: ParentSettings;
  createdAt: string;
}

export interface ParentSettings {
  language: AppLanguage;
  notifications: boolean;
  theme: AppThemeName;
}

// ─── Enfant ──────────────────────────────────────────────────
export interface Child {
  id: string;
  parentId: string;
  pseudonym: string;
  birthYear: number | null;
  pinConfigured?: boolean;
  pinUpdatedAt?: string | null;
  avatarId: string;
  themeId: string;
  level: number;
  experience: number;
  parentNickname: string | null;
  settings: ChildSettings;
  createdAt: string;
  // Calculé via la vue child_balances
  balance?: number;
}

export interface ChildSettings {
  font: AppFont;
  language: AppLanguage;
}

// ─── Mission ─────────────────────────────────────────────────
export type MissionStatus = 'pending' | 'completed' | 'validated' | 'rejected';

export interface Mission {
  id: string;
  parentId: string;
  childId: string;
  title: string;
  description: string | null;
  reward: number;
  status: MissionStatus;
  createdAt: string;
  completedAt: string | null;
  validatedAt: string | null;
  validatedBy: string | null;
}

// ─── Transaction (ledger) ────────────────────────────────────
export type TransactionType =
  | 'mission_reward'
  | 'manual_deposit'
  | 'manual_withdrawal'
  | 'goal_purchase';

export interface Transaction {
  id: string;
  childId: string;
  type: TransactionType;
  amount: number;
  description: string;
  referenceId: string | null;
  createdAt: string;
  createdBy: string | null;
}

// ─── Wishlist ────────────────────────────────────────────────
export interface WishlistItem {
  id: string;
  childId: string;
  productName: string;
  productImageUrl: string | null;
  productPrice: number;
  productCurrency: string;
  productSource: string | null;
  productRef: string | null;
  addedAt: string;
  purchasedAt: string | null;
  notes: string | null;
  // Calculé via la vue wishlist_progress
  currentBalance?: number;
  progressPercent?: number;
  canAfford?: boolean;
}

// ─── Achievement ─────────────────────────────────────────────
export type AchievementType = 'badge' | 'avatar' | 'theme';

export interface Achievement {
  id: string;
  childId: string;
  type: AchievementType;
  itemId: string;
  unlockedAt: string;
}

// ─── Consentement ─────────────────────────────────────────────
export interface ConsentData {
  parentId: string;
  consentVersion: string;
  consentText: string;
  consentMethod: 'email_code' | 'pin' | 'magic_link';
  email: string;
  userAgent?: string;
}

// ─── Résultat de service générique ───────────────────────────
export interface ServiceResult<T = void> {
  data?: T;
  error?: AppError;
}

export interface AppError {
  code: string;
  message: string;
}
