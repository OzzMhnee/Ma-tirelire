import React from 'react';
import { Text, View } from 'react-native';
import { useAppTheme } from '@/theme/ThemeProvider';

type Props = {
  children: React.ReactNode;
  required?: boolean;
};

export function Label({ children, required }: Props) {
  const { theme: { colors } } = useAppTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Text
        style={{
          color: '#111827',
          fontSize: 17,
          lineHeight: 22,
          fontWeight: '600',
          paddingHorizontal: 6,
          paddingVertical: 2,
          borderRadius: 6,
        }}
      >
        {children}
      </Text>
      {required ? <Text style={{ color: colors.danger }}>*</Text> : null}
    </View>
  );
}
