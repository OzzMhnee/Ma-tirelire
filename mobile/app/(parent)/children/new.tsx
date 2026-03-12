import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Input, Button, InlineAlert } from '@components/ui';
import { useAuthStore } from '@store/authStore';
import { useChildrenStore } from '@store/childrenStore';
import { childrenService } from '@services/children.service';
import { pseudonymSchema, birthYearSchema } from '@utils/validators';

// Schéma formulaire : pseudonym (requis) + birthYear optionnel.
// Le resolver peut déjà fournir un nombre, donc on accepte string ou number.
const childFormSchema = z.object({
  pseudonym: pseudonymSchema,
  birthYear: z.preprocess((value) => {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }
    if (typeof value === 'string') {
      const trimmedValue = value.trim();
      return trimmedValue === '' ? undefined : Number(trimmedValue);
    }
    return value;
  }, birthYearSchema.optional()),
  parentNickname: z.string().optional(),
  pin: z.string().regex(/^\d{4}$/, 'Le code PIN doit contenir exactement 4 chiffres.'),
  confirmPin: z.string(),
}).refine((data) => data.pin === data.confirmPin, {
  message: 'Les codes PIN ne correspondent pas.',
  path: ['confirmPin'],
});
type ChildFormInput = {
  pseudonym: string;
  birthYear?: string | number;
  parentNickname?: string;
  pin: string;
  confirmPin: string;
};

export default function NewChildScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const addChild = useChildrenStore((s) => s.addChild);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<ChildFormInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(childFormSchema) as any,
    defaultValues: { pseudonym: '', birthYear: '', parentNickname: '', pin: '', confirmPin: '' },
  });

  const onSubmit = async (data: ChildFormInput) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const output = childFormSchema.parse(data);
    const res = await childrenService.createChild(user.id, {
      pseudonym: output.pseudonym,
      birthYear: output.birthYear,
      pin: output.pin,
      parentNickname: output.parentNickname || undefined,
    });
    setLoading(false);
    if (res.error) {
      setError(res.error.message ?? t('common.error'));
    } else {
      if (res.data) addChild({ ...res.data, balance: 0 });
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text variant="headlineSmall" style={styles.title}>{t('parent.children.newTitle')}</Text>
        <InlineAlert message={error} />

        <Controller control={control} name="pseudonym"
          render={({ field: { onChange, value, onBlur } }) => (
            <Input label={t('parent.children.nameLabel')} value={value} onChangeText={onChange} onBlur={onBlur} error={errors.pseudonym?.message} />
          )} />
        <Controller control={control} name="birthYear"
          render={({ field: { onChange, value, onBlur } }) => (
            <Input label={t('parent.children.birthYearLabel')} value={value === undefined ? '' : String(value)} onChangeText={onChange} onBlur={onBlur} keyboardType="number-pad" error={errors.birthYear?.message} />
          )} />
        <Controller control={control} name="parentNickname"
          render={({ field: { onChange, value, onBlur } }) => (
            <Input label={t('parent.children.parentNicknameLabel')} value={value ?? ''} onChangeText={onChange} onBlur={onBlur} placeholder={t('parent.children.parentNicknamePlaceholder')} error={errors.parentNickname?.message} />
          )} />
        <Controller control={control} name="pin"
          render={({ field: { onChange, value, onBlur } }) => (
            <Input label={t('parent.children.pinLabel')} value={value} onChangeText={onChange} onBlur={onBlur} keyboardType="number-pad" secureTextEntry maxLength={4} error={errors.pin?.message} />
          )} />
        <Controller control={control} name="confirmPin"
          render={({ field: { onChange, value, onBlur } }) => (
            <Input label={t('parent.children.pinConfirmLabel')} value={value} onChangeText={onChange} onBlur={onBlur} keyboardType="number-pad" secureTextEntry maxLength={4} error={errors.confirmPin?.message} />
          )} />

        <Button label={t('common.save')} onPress={handleSubmit(onSubmit)} loading={loading} style={styles.btn} />
        <Button label={t('common.cancel')} variant="ghost" onPress={() => router.back()} />
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
