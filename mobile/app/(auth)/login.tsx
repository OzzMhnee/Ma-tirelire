import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Modal, Pressable } from 'react-native';
import { Text, SegmentedButtons } from 'react-native-paper';
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { AuthScreenShell } from '@components/common/AuthScreenShell';
import { Input, Button, InlineAlert } from '@components/ui';
import { useAuthActions } from '@hooks/useAuthActions';
import { useAuthStore } from '@store/authStore';
import { childAuthService } from '@services/childAuth.service';
import { loginSchema, LoginForm } from '@utils/validators';

type Role = 'parent' | 'child';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { signIn } = useAuthActions();
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const [role, setRole] = useState<Role>('parent');

  // ─── Parent form (react-hook-form) ───
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  });

  const onSubmitParent = async (data: LoginForm) => {
    const success = await signIn(data);
    if (success) router.replace('/(parent)/dashboard');
  };

  // ─── Child form (local state) ───
  const [childPseudonym, setChildPseudonym] = useState('');
  const [childPin, setChildPin] = useState('');
  const [childLoading, setChildLoading] = useState(false);
  const [childError, setChildError] = useState<string | null>(null);
  const [showNoAccountDialog, setShowNoAccountDialog] = useState(false);

  const onSubmitChild = async () => {
    if (!childPseudonym.trim() || !/^\d{4}$/.test(childPin)) {
      setChildError(t('auth.login.childPin'));
      return;
    }
    setChildLoading(true);
    setChildError(null);
    const result = await childAuthService.loginChild(childPseudonym.trim(), childPin);
    setChildLoading(false);
    if (result.error) {
      setChildError(result.error.message);
      return;
    }
    if (result.data) {
      const { setRole: storeSetRole, setActiveChild } = useAuthStore.getState();
      storeSetRole('child');
      setActiveChild(result.data);
      router.replace('/(child)/dashboard');
    }
  };

  return (
    <AuthScreenShell
      title={t('common.appName')}
      subtitle={t('auth.login.subtitle')}
    >
        <SegmentedButtons
          value={role}
          onValueChange={(v) => setRole(v as Role)}
          buttons={[
            { value: 'parent', label: t('auth.login.parent') },
            { value: 'child',  label: t('auth.login.child')  },
          ]}
          style={styles.segment}
        />

        {role === 'parent' ? (
          <>
            <InlineAlert message={error} />

            <Controller
              control={control}
              name="identifier"
              render={({ field: { onChange, value, onBlur } }) => (
                <Input
                  label={t('auth.login.email')}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  error={errors.identifier?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value, onBlur } }) => (
                <Input
                  label={t('auth.login.password')}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry
                  error={errors.password?.message}
                />
              )}
            />

            <Button
              label={t('auth.login.submit')}
              onPress={handleSubmit(onSubmitParent)}
              loading={isLoading}
              style={styles.submitBtn}
            />

            <Link href="/(auth)/reset-password" style={styles.link}>
              {t('auth.login.forgotPassword')}
            </Link>

            <Link href="/(auth)/signup" style={StyleSheet.flatten([styles.link, styles.signupLink])}>
              {t('auth.login.noAccount')}
            </Link>
          </>
        ) : (
          <>
            <InlineAlert message={childError} />

            <Input
              label={t('auth.login.childPseudonym')}
              value={childPseudonym}
              onChangeText={setChildPseudonym}
              autoCapitalize="none"
            />

            <Input
              label={t('auth.login.childPin')}
              value={childPin}
              onChangeText={setChildPin}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
            />

            <Button
              label={t('auth.login.submit')}
              onPress={onSubmitChild}
              loading={childLoading}
              style={styles.submitBtn}
            />

            <Button
              label={t('auth.childNoAccount.title')}
              variant="ghost"
              onPress={() => setShowNoAccountDialog(true)}
              style={styles.submitBtn}
            />

            <Modal
              visible={showNoAccountDialog}
              transparent
              animationType="fade"
              onRequestClose={() => setShowNoAccountDialog(false)}
            >
              <Pressable style={styles.modalBackdrop} onPress={() => setShowNoAccountDialog(false)}>
                <Pressable style={styles.modalCard} onPress={() => undefined}>
                  <Text variant="titleLarge" style={styles.modalTitle}>
                    {t('auth.childNoAccount.title')}
                  </Text>
                  <Text style={styles.modalMessage}>{t('auth.childNoAccount.message')}</Text>
                  <Button
                    label={t('auth.childNoAccount.ok')}
                    onPress={() => setShowNoAccountDialog(false)}
                    style={styles.modalButton}
                  />
                </Pressable>
              </Pressable>
            </Modal>
          </>
        )}
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  segment:    { marginBottom: 16 },
  submitBtn:  { marginTop: 8 },
  link:       { textAlign: 'center', marginTop: 16, color: '#512da8' },
  signupLink: { fontWeight: '600' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  modalTitle: {
    fontWeight: '700',
    color: '#111827',
  },
  modalMessage: {
    color: '#374151',
    lineHeight: 22,
  },
  modalButton: {
    marginTop: 4,
  },
});
