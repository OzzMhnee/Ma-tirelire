import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, Checkbox } from 'react-native-paper';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Button, InlineAlert } from '@components/ui';
import { getConsentText, CURRENT_CONSENT_VERSION } from '@utils/consent';

export default function ConsentScreen() {
  const { t } = useTranslation();
  const [accepted, setAccepted] = useState(false);
  const consentText = getConsentText(CURRENT_CONSENT_VERSION);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        {t('auth.consent.title')}
      </Text>

      <View style={styles.textBox}>
        <Text style={styles.body}>{consentText}</Text>
      </View>

      <View style={styles.checkRow}>
        <Checkbox
          status={accepted ? 'checked' : 'unchecked'}
          onPress={() => setAccepted(!accepted)}
        />
        <Text style={styles.checkLabel}>{t('auth.consent.checkLabel')}</Text>
      </View>

      <Button
        label={t('auth.consent.accept')}
        disabled={!accepted}
        onPress={() => router.back()}
        style={styles.btn}
      />

      <Button
        label={t('auth.consent.decline')}
        mode="text"
        onPress={() => router.replace('/(auth)/signup')}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 48 },
  title:     { fontWeight: '700', marginBottom: 16 },
  textBox:   { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 16, marginBottom: 16 },
  body:      { fontSize: 13, lineHeight: 20, color: '#333' },
  checkRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  checkLabel:{ flex: 1, fontSize: 13, color: '#444' },
  btn:       { marginTop: 4 },
});
