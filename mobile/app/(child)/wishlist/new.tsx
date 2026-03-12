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
import { wishlistService } from '@services/wishlist.service';
import { childAuthService } from '@services/childAuth.service';

const wishSchema = z.object({
  name:          z.string().min(1, 'Nom requis'),
  targetAmount:  z.string().regex(/^\d+([.,]\d{1,2})?$/, 'Montant invalide'),
  imageUrl:      z.string().url('URL invalide').optional().or(z.literal('')),
});
type WishInput = z.infer<typeof wishSchema>;

export default function NewWishScreen() {
  const { t } = useTranslation();
  const activeChild = useAuthStore((s) => s.activeChild);
  const user = useAuthStore((s) => s.user);
  const isStandaloneChild = !user && !!activeChild;
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<WishInput>({
    resolver: zodResolver(wishSchema),
    defaultValues: { name: '', targetAmount: '', imageUrl: '' },
  });

  const onSubmit = async (data: WishInput) => {
    if (!activeChild) return;
    setLoading(true);
    setError(null);
    const price = Number(data.targetAmount.replace(',', '.'));
    const res = isStandaloneChild
      ? await childAuthService.addWishlistItem(activeChild.id, data.name, price, data.imageUrl || undefined)
      : await wishlistService.addToWishlist({
          childId: activeChild.id,
          productName: data.name,
          productPrice: price,
          productImageUrl: data.imageUrl || undefined,
        });
    setLoading(false);
    if (res.error) setError(res.error?.message ?? t('common.error'));
    else router.back();
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text variant="headlineSmall" style={styles.title}>{t('child.wishlist.newTitle')}</Text>
        <InlineAlert message={error} />

        <Controller control={control} name="name"
          render={({ field: { onChange, value, onBlur } }) => (
            <Input label={t('child.wishlist.nameLabel')} value={value} onChangeText={onChange} onBlur={onBlur} error={errors.name?.message} />
          )} />
        <Controller control={control} name="targetAmount"
          render={({ field: { onChange, value, onBlur } }) => (
            <Input label={t('child.wishlist.amountLabel')} value={value} onChangeText={onChange} onBlur={onBlur} keyboardType="decimal-pad" error={errors.targetAmount?.message} />
          )} />
        <Controller control={control} name="imageUrl"
          render={({ field: { onChange, value, onBlur } }) => (
            <Input label={t('child.wishlist.imageUrlLabel')} value={value} onChangeText={onChange} onBlur={onBlur} autoCapitalize="none" keyboardType="url" error={errors.imageUrl?.message} />
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
  title:     { fontWeight: '700', marginBottom: 16, color: '#512da8' },
  btn:       { marginTop: 8 },
});
