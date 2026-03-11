import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Input, Button, InlineAlert } from '@components/ui';
import { useAuthStore } from '@store/authStore';
import { useChildrenStore } from '@store/childrenStore';
import { missionsService } from '@services/missions.service';
import { missionCreateSchema, MissionCreateInput } from '@utils/validators';

export default function NewMissionScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const children = useChildrenStore((s) => s.children);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<MissionCreateInput>({
    resolver: zodResolver(missionCreateSchema),
    defaultValues: { title: '', description: '', rewardAmount: '', childId: children[0]?.id ?? '' },
  });

  const onSubmit = async (data: MissionCreateInput) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const res = await missionsService.createMission({
      parent_id: user.id,
      child_id: data.childId,
      title: data.title,
      description: data.description,
      reward_amount: Number(data.rewardAmount),
    });
    setLoading(false);
    if (!res.success) setError(res.error?.message ?? t('common.error'));
    else router.back();
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text variant="headlineSmall" style={styles.title}>{t('parent.missions.newTitle')}</Text>
        <InlineAlert message={error} />

        <Controller control={control} name="title"
          render={({ field: { onChange, value, onBlur } }) => (
            <Input label={t('parent.missions.titleLabel')} value={value} onChangeText={onChange} onBlur={onBlur} error={errors.title?.message} />
          )} />
        <Controller control={control} name="description"
          render={({ field: { onChange, value, onBlur } }) => (
            <Input label={t('parent.missions.descriptionLabel')} value={value} onChangeText={onChange} onBlur={onBlur} multiline numberOfLines={3} error={errors.description?.message} />
          )} />
        <Controller control={control} name="rewardAmount"
          render={({ field: { onChange, value, onBlur } }) => (
            <Input label={t('parent.missions.rewardLabel')} value={value} onChangeText={onChange} onBlur={onBlur} keyboardType="decimal-pad" error={errors.rewardAmount?.message} />
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
