import React from 'react';
import { View, Pressable, StyleSheet, StyleProp, ViewStyle, PressableProps } from 'react-native';
import { useAppTheme } from '@/theme/ThemeProvider';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
} & PressableProps;

export function Card({ children, style, ...pressableProps }: Props) {
  const { theme: { colors } } = useAppTheme();
  const isPressable = typeof pressableProps.onPress === 'function';

  const cardStyle = [
    styles.card,
    { backgroundColor: colors.surface, borderColor: colors.outline },
    style,
  ];

  if (isPressable) {
    return (
      <Pressable
        {...pressableProps}
        style={({ pressed }) => [cardStyle, pressed ? styles.pressed : null]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
    elevation: 1,
  },
  pressed: {
    opacity: 0.9,
  },
});
