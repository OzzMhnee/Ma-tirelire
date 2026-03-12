import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Button, Card, DestructiveActionCard, InlineAlert, Input } from '@components/ui';
import { useAuthActions } from '@hooks/useAuthActions';
import { useAuthStore } from '@store/authStore';
import { supabase } from '@config/supabase';

export default function ParentAccountScreen() {
  const { t } = useTranslation();
  const { signOut, updatePassword, deleteAccount } = useAuthActions();
  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };
  const user = useAuthStore((s) => s.user);
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleUpdatePassword = async () => {
    if (!currentPassword) {
      setError(t('parent.account.currentPasswordRequired'));
      return;
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    // Vérifier l'ancien mot de passe
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user?.email ?? '',
      password: currentPassword,
    });
    if (signInError) {
      setLoading(false);
      setError(t('parent.account.currentPasswordWrong'));
      return;
    }

    const result = await updatePassword(password);
    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setCurrentPassword('');
    setPassword('');
    setConfirmPassword('');
    setMessage(t('parent.account.passwordUpdated'));
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setError(null);
    setMessage(null);
    const result = await deleteAccount();
    setDeleteLoading(false);

    if (result.error) {
      setError(result.error.message);
    } else {
      router.replace('/(auth)/login');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text variant="headlineSmall" style={styles.title}>{t('parent.account.title')}</Text>
        <InlineAlert message={error ?? message} />

        <Card>
          <Text variant="titleMedium" style={styles.sectionTitle}>{t('tabs.parentAccount')}</Text>
          <Text style={styles.label}>{t('parent.account.email')}</Text>
          <Text style={styles.value}>{user?.email}</Text>
          <Text style={styles.label}>{t('parent.account.username')}</Text>
          <Text style={styles.value}>{user?.username}</Text>
        </Card>

        <Card>
          <Text variant="titleMedium" style={styles.sectionTitle}>{t('parent.account.passwordTitle')}</Text>
          <Input
            label={t('parent.account.currentPassword')}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
          />
          <Input
            label={t('parent.account.newPassword')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Input
            label={t('parent.account.confirmPassword')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          <Button label={t('parent.account.savePassword')} onPress={handleUpdatePassword} loading={loading} style={styles.primaryButton} />
        </Card>

        <Card>
          <Button label={t('common.logout')} variant="outline" onPress={handleSignOut} style={styles.primaryButton} />
        </Card>

        <DestructiveActionCard
          title={t('parent.account.dangerZone')}
          description={t('parent.account.deleteAccountInfo')}
          actionLabel={t('parent.account.deleteAccount')}
          confirmMessage={t('parent.account.deleteAccountConfirm')}
          confirmLabel={t('common.delete')}
          cancelLabel={t('common.cancel')}
          onConfirm={handleDeleteAccount}
          loading={deleteLoading}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fafafa' },
  container: { padding: 16, paddingTop: 48, gap: 16 },
  title: { fontWeight: '700', marginBottom: 8 },
  sectionTitle: { fontWeight: '700', marginBottom: 12 },
  label: { color: '#6b7280', fontSize: 12, marginBottom: 4 },
  value: { color: '#111827', fontSize: 16, marginBottom: 10, fontWeight: '600' },
  primaryButton: { marginTop: 12 },
});