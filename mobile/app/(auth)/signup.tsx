import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, Checkbox } from 'react-native-paper';
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { AuthScreenShell } from '@components/common/AuthScreenShell';
import { Input, Button, InlineAlert } from '@components/ui';
import { useAuthActions } from '@hooks/useAuthActions';
import { useAuthStore } from '@store/authStore';
import { signUpSchema, SignUpForm } from '@utils/validators';

export default function SignupScreen() {
  const { t } = useTranslation();
  const { signUp } = useAuthActions();
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const [consentChecked, setConsentChecked] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', username: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: SignUpForm) => {
    if (!consentChecked) return;
    const success = await signUp(data);
    if (success) router.replace('/(parent)/dashboard');
  };

  return (
    <AuthScreenShell
      title={t('auth.signup.title')}
      subtitle={t('auth.signup.subtitle')}
    >

        <InlineAlert message={error} />

        <Controller
          control={control}
          name="username"
          render={({ field: { onChange, value, onBlur } }) => (
            <Input
              label={t('auth.signup.username')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="none"
              error={errors.username?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value, onBlur } }) => (
            <Input
              label={t('auth.signup.email')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="none"
              keyboardType="email-address"
              error={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value, onBlur } }) => (
            <Input
              label={t('auth.signup.password')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              error={errors.password?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, value, onBlur } }) => (
            <Input
              label={t('auth.signup.confirmPassword')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              error={errors.confirmPassword?.message}
            />
          )}
        />

        <View style={styles.consentRow}>
          <Checkbox
            status={consentChecked ? 'checked' : 'unchecked'}
            onPress={() => setConsentChecked(!consentChecked)}
          />
          <Text style={styles.consentText}>
            {t('auth.signup.consentLabel')}{' '}
            <Link href="/(auth)/consent" style={styles.link}>
              {t('auth.signup.consentLink')}
            </Link>
          </Text>
        </View>

        <Button
          label={t('auth.signup.submit')}
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
          disabled={!consentChecked}
          style={styles.submitBtn}
        />

        <Link href="/(auth)/login" style={styles.link}>
          {t('auth.signup.hasAccount')}
        </Link>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  consentRow:  { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  consentText: { flex: 1, fontSize: 13, color: '#444' },
  submitBtn:   { marginTop: 8 },
  link:        { color: '#512da8' },
});
