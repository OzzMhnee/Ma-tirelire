import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/theme/ThemeProvider';

type Props = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  scroll?: boolean;
  footer?: React.ReactNode;
};

export function MainLayout({
  children,
  title,
  subtitle,
  scroll = true,
  footer,
}: Props) {
  const { theme: { colors } } = useAppTheme();
  const Container = scroll ? ScrollView : View;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Container
        contentContainerStyle={scroll ? { padding: 16, gap: 16 } : undefined}
        style={!scroll ? { padding: 16 } : undefined}
      >
        {(title || subtitle) ? (
          <View style={styles.header}>
            {title ? <Text style={{ color: colors.text, fontSize: 24, fontWeight: '700' }}>{title}</Text> : null}
            {subtitle ? <Text style={{ color: colors.muted, fontSize: 14 }}>{subtitle}</Text> : null}
          </View>
        ) : null}
        <View style={styles.content}>{children}</View>
        {footer ? <View style={{ marginTop: 24 }}>{footer}</View> : null}
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { gap: 4, marginBottom: 4 },
  content: { gap: 16 },
});
