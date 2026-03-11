import { supabase } from '@config/supabase';
import { safeCall } from '@utils/safeCall';
import {
  CURRENT_CONSENT_VERSION,
  getConsentText,
} from '@utils/consent';
import type {
  ParentUser,
  ConsentData,
  ServiceResult,
} from '@types/domain.types';

function dbRowToParent(row: {
  id: string;
  email: string;
  username: string | null;
  settings: unknown;
  created_at: string;
}): ParentUser {
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    settings: row.settings as ParentUser['settings'],
    createdAt: row.created_at,
  };
}

export const authService = {
  async signUpParent(
    email: string,
    password: string,
    username: string
  ): Promise<ServiceResult<ParentUser>> {
    return safeCall(async () => {
      // 1. Créer le compte dans Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.signUp({ email, password });

      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error('Aucun utilisateur retourné.');

      // 2. Insérer le profil parent (id = auth.uid())
      const { data: parent, error: dbError } = await supabase
        .from('parents')
        .insert({ id: authData.user.id, email, username })
        .select()
        .single();

      if (dbError) throw new Error(dbError.message);

      // 3. Enregistrer le consentement RGPD
      await authService.recordConsent({
        parentId: parent.id,
        consentVersion: CURRENT_CONSENT_VERSION,
        consentText: getConsentText(),
        consentMethod: 'email_code',
        email,
      });

      return dbRowToParent(parent);
    });
  },

  async signInParent(
    identifier: string,
    password: string
  ): Promise<ServiceResult<ParentUser>> {
    return safeCall(async () => {
      // Résoudre l'email depuis l'identifiant (email ou username)
      let email = identifier;

      if (!identifier.includes('@')) {
        const { data: parent, error } = await supabase
          .from('parents')
          .select('email')
          .eq('username', identifier)
          .single();

        if (error || !parent) {
          throw new Error("Nom d'utilisateur introuvable.");
        }
        email = parent.email;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw new Error(error.message);
      if (!data.user) throw new Error('Connexion échouée.');

      const { data: parent, error: dbError } = await supabase
        .from('parents')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (dbError || !parent) {
        throw new Error('Profil parent introuvable.');
      }

      return dbRowToParent(parent);
    });
  },

  async signOut(): Promise<ServiceResult<void>> {
    return safeCall(async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message);
    });
  },

  async requestPasswordReset(email: string): Promise<ServiceResult<void>> {
    return safeCall(async () => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'matirelire://reset-password',
      });
      if (error) throw new Error(error.message);
    });
  },

  async updatePassword(newPassword: string): Promise<ServiceResult<void>> {
    return safeCall(async () => {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw new Error(error.message);
    });
  },

  async recordConsent(data: ConsentData): Promise<ServiceResult<void>> {
    return safeCall(async () => {
      const { error } = await supabase.from('consents').insert({
        parent_id: data.parentId,
        consent_version: data.consentVersion,
        consent_text: data.consentText,
        consent_method: data.consentMethod,
        email: data.email,
        user_agent: data.userAgent,
      });
      if (error) throw new Error(error.message);
    });
  },

  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  onAuthStateChange(
    callback: (event: string, session: unknown) => void
  ) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
