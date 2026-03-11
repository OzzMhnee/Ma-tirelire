import React from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Input, Button, InlineAlert } from '@components/ui';
import { authService } from '@services/auth.service';
import { useAuthStore } from '@store/authStore';

const resetSchema = z.object({
  email: z.string().email('Email invalide'),
});
type ResetInput = z.infer<typeof resetSchema>;

export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const { isLoading, setLoading, setError, error } = useAuthStore(s => ({
    isLoading: s.isLoading,
    error: s.error,
    setLoading: s.setLoading,
    setError: s.setError,
  }));

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetInput>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async ({ email }: ResetInput) => {
    setLoading(true);
    setError(null);
    const result = await authService.sendPasswordResetEmail(email);
    setLoading(false);
    if (!result.success) {
      setError(result.error?.message ?? 'Erreur inconnue');
    } else {
      router.replace('/(auth)/login');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>
          {t('auth.resetPassword.title')}
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          {t('auth.resetPassword.subtitle')}
        </Text>

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
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex:      { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 24, paddingTop: 48 },
  title:     { fontWeight: '700', marginBottom: 8 },
  subtitle:  { color: '#666', marginBottom: 24 },
  btn:       { marginTop: 8 },
});
