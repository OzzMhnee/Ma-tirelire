import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { useAppTheme } from '@/theme/ThemeProvider';

type Props = {
  title: string;
  subtitle?: string;
  value?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  onPress?: () => void;
};

export function ListItem({ title, subtitle, value, left, right, onPress }: Props) {
  const { theme: { colors } } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.outline }]}
    >
      {left ? <View>{left}</View> : null}
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text, fontWeight: '700' }}>{title}</Text>
        {subtitle ? <Text style={{ color: colors.muted, marginTop: 2 }}>{subtitle}</Text> : null}
      </View>
      {value ? <Text style={{ color: colors.text, fontWeight: '600' }}>{value}</Text> : null}
      {right ? <View>{right}</View> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 4,
  },
});
