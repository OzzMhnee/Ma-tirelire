import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, SegmentedButtons } from 'react-native-paper';
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Input, Button, InlineAlert } from '@components/ui';
import { useAuthActions } from '@hooks/useAuthActions';
import { useAuthStore } from '@store/authStore';
import { loginSchema, LoginInput } from '@utils/validators';

type Role = 'parent' | 'child';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { signIn } = useAuthActions();
  const { isLoading, error } = useAuthStore();
  const [role, setRole] = useState<Role>('parent');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  });

  const onSubmit = async (data: LoginInput) => {
    await signIn(data.identifier, data.password);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text variant="headlineMedium" style={styles.title}>
          {t('common.appName')}
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          {t('auth.login.subtitle')}
        </Text>

        <SegmentedButtons
          value={role}
          onValueChange={(v) => setRole(v as Role)}
          buttons={[
            { value: 'parent', label: t('auth.login.parent') },
            { value: 'child',  label: t('auth.login.child')  },
          ]}
          style={styles.segment}
        />

        <InlineAlert message={error} />

        <Controller
          control={control}
          name="identifier"
          render={({ field: { onChange, value, onBlur } }) => (
            <Input
              label={role === 'parent' ? t('auth.login.email') : t('auth.login.username')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="none"
              keyboardType={role === 'parent' ? 'email-address' : 'default'}
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
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
          style={styles.submitBtn}
        />

        <Link href="/(auth)/reset-password" style={styles.link}>
          {t('auth.login.forgotPassword')}
        </Link>

        <Link href="/(auth)/signup" style={[styles.link, styles.signupLink]}>
          {t('auth.login.noAccount')}
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex:       { flex: 1, backgroundColor: '#fff' },
  container:  { padding: 24, paddingTop: 64 },
  title:      { textAlign: 'center', fontWeight: '700', marginBottom: 4 },
  subtitle:   { textAlign: 'center', color: '#666', marginBottom: 24 },
  segment:    { marginBottom: 16 },
  submitBtn:  { marginTop: 8 },
  link:       { textAlign: 'center', marginTop: 16, color: '#512da8' },
  signupLink: { fontWeight: '600' },
});
