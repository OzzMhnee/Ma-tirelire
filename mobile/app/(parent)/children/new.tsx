import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Input, Button, InlineAlert } from '@components/ui';
import { useAuthStore } from '@store/authStore';
import { childrenService } from '@services/children.service';
import { childCreateSchema, ChildCreateInput } from '@utils/validators';

export default function NewChildScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<ChildCreateInput>({
    resolver: zodResolver(childCreateSchema),
    defaultValues: { name: '', username: '', age: '', pin: '' },
  });

  const onSubmit = async (data: ChildCreateInput) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const res = await childrenService.createChild({
      parent_id: user.id,
      name: data.name,
      username: data.username,
      age: data.age ? Number(data.age) : undefined,
      pin_hash: data.pin,
    });
    setLoading(false);
    if (!res.success) {
      setError(res.error?.message ?? t('common.error'));
    } else {
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text variant="headlineSmall" style={styles.title}>{t('parent.children.newTitle')}</Text>
        <InlineAlert message={error} />

        <Controller control={control} name="name"
          render={({ field: { onChange, value, onBlur } }) => (
            <Input label={t('parent.children.nameLabel')} value={value} onChangeText={onChange} onBlur={onBlur} error={errors.name?.message} />
          )} />
        <Controller control={control} name="username"
          render={({ field: { onChange, value, onBlur } }) => (
            <Input label={t('parent.children.usernameLabel')} value={value} onChangeText={onChange} onBlur={onBlur} autoCapitalize="none" error={errors.username?.message} />
          )} />
        <Controller control={control} name="age"
          render={({ field: { onChange, value, onBlur } }) => (
            <Input label={t('parent.children.ageLabel')} value={value} onChangeText={onChange} onBlur={onBlur} keyboardType="number-pad" error={errors.age?.message} />
          )} />
        <Controller control={control} name="pin"
          render={({ field: { onChange, value, onBlur } }) => (
            <Input label={t('parent.children.pinLabel')} value={value} onChangeText={onChange} onBlur={onBlur} keyboardType="number-pad" secureTextEntry maxLength={4} error={errors.pin?.message} />
          )} />

        <Button label={t('common.save')} onPress={handleSubmit(onSubmit)} loading={loading} style={styles.btn} />
        <Button label={t('common.cancel')} mode="text" onPress={() => router.back()} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex:      { flex: 1, backgroundColor: '#fff' },
  container: { padding: 24, paddingTop: 48 },
  title:     { fontWeight: '700', marginBottom: 16 },
  btn:       { marginTop: 8 },
});
