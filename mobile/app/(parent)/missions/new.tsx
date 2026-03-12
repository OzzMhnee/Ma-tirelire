import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Input, Button, InlineAlert } from '@components/ui';
import { useAuthStore } from '@store/authStore';
import { useChildrenStore } from '@store/childrenStore';
import { useMissionsStore } from '@store/missionsStore';
import { missionsService } from '@services/missions.service';
import { missionTitleSchema, rewardSchema } from '@utils/validators';

const missionFormSchema = z.object({
  title: missionTitleSchema,
  description: z.string().max(500).optional(),
  reward: rewardSchema,
  childIds: z.array(z.string().uuid()).min(1, 'Veuillez sélectionner au moins un enfant.'),
});

type MissionFormInput = z.infer<typeof missionFormSchema>;

export default function NewMissionScreen() {
  const { t } = useTranslation();
  const { childId: childIdParam, lockChild } = useLocalSearchParams<{ childId?: string; lockChild?: string }>();
  const user = useAuthStore((s) => s.user);
  const children = useChildrenStore((s) => s.children);
  const addMission = useMissionsStore((s) => s.addMission);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const lockedChild = typeof childIdParam === 'string' ? childIdParam : undefined;
  const isChildLocked = lockChild === 'true' && Boolean(lockedChild);
  const defaultChildIds = isChildLocked
    ? [lockedChild as string]
    : children.length === 1
      ? [children[0].id]
      : lockedChild
        ? [lockedChild]
        : [];

  const { control, handleSubmit, formState: { errors }, watch, setValue } = useForm<MissionFormInput>({
    resolver: zodResolver(missionFormSchema),
    defaultValues: { title: '', description: '', reward: 0, childIds: defaultChildIds },
  });
  const selectedChildIds = watch('childIds');

  const toggleChild = (childId: string) => {
    const nextValue = selectedChildIds.includes(childId)
      ? selectedChildIds.filter((id) => id !== childId)
      : [...selectedChildIds, childId];
    setValue('childIds', nextValue, { shouldValidate: true });
  };

  const onSubmit = async (data: MissionFormInput) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const res = await missionsService.createMissionForChildren({
      parentId: user.id,
      childIds: data.childIds,
      title: data.title,
      description: data.description,
      reward: data.reward,
    });
    setLoading(false);
    if (res.error) setError(res.error.message ?? t('common.error'));
    else {
      if (res.data) {
        res.data.forEach((mission) => addMission(mission));
      }
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text variant="headlineSmall" style={styles.title}>{t('parent.missions.newTitle')}</Text>
        <InlineAlert message={error} />

        <Controller control={control} name="childIds"
          render={() => (
            <View style={styles.selectorBlock}>
              <Text style={styles.selectorLabel}>
                {isChildLocked ? t('parent.missions.childLockedLabel') : t('parent.missions.childLabel')}
              </Text>
              {children.length === 0 ? (
                <Text style={styles.selectorHelp}>{t('parent.missions.noChildAvailable')}</Text>
              ) : (
                <View style={styles.selectorList}>
                  {children.map((child) => {
                    const isSelected = selectedChildIds.includes(child.id);
                    return (
                      <Button
                        key={child.id}
                        label={child.pseudonym}
                        variant={isSelected ? 'primary' : 'outline'}
                        size="sm"
                        onPress={() => {
                          if (isChildLocked) return;
                          toggleChild(child.id);
                        }}
                        style={styles.selectorButton}
                      />
                    );
                  })}
                </View>
              )}
              {errors.childIds?.message ? (
                <Text style={styles.fieldError}>{errors.childIds.message}</Text>
              ) : null}
            </View>
          )} />

        <Controller control={control} name="title"
          render={({ field: { onChange, value, onBlur } }) => (
            <Input label={t('parent.missions.titleLabel')} value={value} onChangeText={onChange} onBlur={onBlur} error={errors.title?.message} />
          )} />
        <Controller control={control} name="description"
          render={({ field: { onChange, value, onBlur } }) => (
            <Input label={t('parent.missions.descriptionLabel')} value={value} onChangeText={onChange} onBlur={onBlur} multiline numberOfLines={3} error={errors.description?.message} />
          )} />
        <Controller control={control} name="reward"
          render={({ field: { onChange, value, onBlur } }) => (
            <Input label={t('parent.missions.rewardLabel')} value={String(value)} onChangeText={(v) => onChange(Number(v) || 0)} onBlur={onBlur} keyboardType="decimal-pad" error={errors.reward?.message} />
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
  selectorBlock: { marginBottom: 16 },
  selectorLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#374151' },
  selectorHelp: { color: '#6b7280', marginBottom: 8 },
  selectorList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  selectorButton: { marginBottom: 0 },
  fieldError: { color: '#991b1b', fontSize: 12, marginTop: 6 },
  btn:       { marginTop: 8 },
});
