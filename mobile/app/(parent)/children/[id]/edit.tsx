import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Button, DestructiveActionCard, InlineAlert, Input } from '@components/ui';
import { useChildrenStore } from '@store/childrenStore';
import { useMissionsStore } from '@store/missionsStore';
import { childrenService } from '@services/children.service';

export default function EditChildScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const child = useChildrenStore((s) => s.children.find((item) => item.id === id) ?? null);
  const updateChildInStore = useChildrenStore((s) => s.updateChild);
  const removeChildFromStore = useChildrenStore((s) => s.removeChild);
  const [pseudonym, setPseudonym] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (child) {
      setPseudonym(child.pseudonym);
    }
  }, [child]);

  if (!child) {
    return <ScrollView contentContainerStyle={styles.container}><Text>{t('common.loading')}</Text></ScrollView>;
  }

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    if (pseudonym.trim().length < 2) {
      setIsSaving(false);
      setError(t('parent.children.nameLabel'));
      return;
    }

    const profileResult = await childrenService.updateChild(child.id, {
      pseudonym: pseudonym.trim(),
    });

    if (profileResult.error) {
      setIsSaving(false);
      setError(profileResult.error.message);
      return;
    }

    if (pin || confirmPin) {
      if (!/^\d{4}$/.test(pin)) {
        setIsSaving(false);
        setError(t('parent.children.pinInvalid'));
        return;
      }
      if (pin !== confirmPin) {
        setIsSaving(false);
        setError(t('parent.children.pinMismatch'));
        return;
      }

      const pinResult = await childrenService.setChildPin(child.id, pin);
      if (pinResult.error) {
        setIsSaving(false);
        setError(pinResult.error.message);
        return;
      }
    }

    updateChildInStore(child.id, {
      pseudonym: pseudonym.trim(),
      pinConfigured: pin ? true : child.pinConfigured,
      pinUpdatedAt: pin ? new Date().toISOString() : child.pinUpdatedAt,
    });
    setIsSaving(false);
    router.back();
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    const result = await childrenService.deleteChild(child.id);
    setIsDeleting(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    removeChildFromStore(child.id);
    // Purger les missions orphelines du store
    const currentMissions = useMissionsStore.getState().missions;
    useMissionsStore.getState().setMissions(currentMissions.filter((m) => m.childId !== child.id));
    router.replace('/(parent)/dashboard');
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text variant="headlineSmall" style={styles.title}>{t('parent.children.editTitle')}</Text>
        <InlineAlert message={error} />

        <Input
          label={t('parent.children.editNameLabel')}
          value={pseudonym}
          onChangeText={setPseudonym}
        />
        <Input
          label={t('parent.children.pinLabel')}
          value={pin}
          onChangeText={setPin}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={4}
        />
        <Input
          label={t('parent.children.pinConfirmLabel')}
          value={confirmPin}
          onChangeText={setConfirmPin}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={4}
        />

        <Button label={t('parent.children.saveProfile')} onPress={handleSave} loading={isSaving} style={styles.primaryButton} />
        <DestructiveActionCard
          title={t('parent.children.deleteChild')}
          description={t('parent.children.deleteChildInfo')}
          actionLabel={t('parent.children.deleteChild')}
          confirmMessage={t('parent.children.deleteConfirm')}
          confirmLabel={t('common.delete')}
          cancelLabel={t('common.cancel')}
          onConfirm={handleDelete}
          loading={isDeleting}
          style={styles.dangerCard}
        />
        <Button label={t('common.back')} variant="ghost" onPress={() => router.back()} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 24, paddingTop: 48, gap: 12 },
  title: { fontWeight: '700', marginBottom: 8 },
  primaryButton: { marginTop: 8 },
  dangerCard: { marginBottom: 0 },
});