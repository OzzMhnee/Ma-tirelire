import React from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';

import { Assets } from '@config/assets';
import { ParallaxBackground } from '@components/common/ParallaxBackground';
import { THEMES } from '@constants/colors';

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function AuthScreenShell({ title, subtitle, children }: Props) {
  const theme = THEMES.light;

  return (
    <View style={styles.root}>
      <ParallaxBackground />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Image source={Assets.logos.title} resizeMode="contain" style={styles.titleLogo} />
            <Text variant="headlineMedium" style={[styles.title, { color: theme.text }]}>
              {title}
            </Text>
            {subtitle ? (
              <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.textSecondary }]}>
                {subtitle}
              </Text>
            ) : null}
          </View>

          <View style={styles.card}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#EAF3FF',
  },
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 28,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 18,
  },
  titleLogo: {
    width: 260,
    height: 86,
    marginBottom: 6,
  },
  title: {
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    textAlign: 'center',
    maxWidth: 360,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.90)',
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.75)',
    shadowColor: '#0F172A',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
});