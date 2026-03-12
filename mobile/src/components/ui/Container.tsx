import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/theme/ThemeProvider';

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
};

export function Container({ children, scroll = true }: Props) {
  const { theme: { colors } } = useAppTheme();
  const Wrapper = scroll ? ScrollView : View;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Wrapper
        contentContainerStyle={scroll ? { padding: 16 } : undefined}
        style={!scroll ? { flex: 1, padding: 16 } : undefined}
      >
        <View style={{ gap: 16 }}>{children}</View>
      </Wrapper>
    </SafeAreaView>
  );
}
