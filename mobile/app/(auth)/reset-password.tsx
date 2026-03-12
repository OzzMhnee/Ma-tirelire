import React from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { AuthScreenShell } from '@components/common/AuthScreenShell';
import { Input, Button, InlineAlert } from '@components/ui';
import { authService } from '@services/auth.service';
import { useAuthStore } from '@store/authStore';

const resetSchema = z.object({
  email: z.string().email('Email invalide'),
});
type ResetInput = z.infer<typeof resetSchema>;

export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetInput>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async ({ email }: ResetInput) => {
    const { setLoading, setError } = useAuthStore.getState();
    setLoading(true);
    setError(null);
    const result = await authService.requestPasswordReset(email);
    setLoading(false);
    if (result.error) {
      setError(result.error?.message ?? 'Erreur inconnue');
    } else {
      router.replace('/(auth)/login');
    }
  };

  return (
    <AuthScreenShell
      title={t('auth.resetPassword.title')}
      subtitle={t('auth.resetPassword.subtitle')}
    >

        <InlineAlert message={error} />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value, onBlur } }) => (
            <Input
              label={t('auth.resetPassword.email')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="none"
              keyboardType="email-address"
              error={errors.email?.message}
            />
          )}
        />

        <Button
          label={t('auth.resetPassword.submit')}
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
          style={styles.btn}
        />
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  btn:       { marginTop: 8 },
});
