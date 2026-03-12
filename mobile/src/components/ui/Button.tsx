import React from 'react';
import {
  Pressable,
  Text,
  View,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useAppTheme } from '@/theme/ThemeProvider';

type Variant = 'primary' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

type Props = {
  /** Texte du bouton ("label" est accepté comme alias) */
  title?: string;
  label?: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: Variant;
  /** Alias Paper pour la rétro-compatibilité ("text"→ghost, "outlined"→outline) */
  mode?: string;
  size?: Size;
  fontSize?: number;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  width?: number | string;
};

export function Button({
  title,
  label,
  onPress,
  disabled,
  loading,
  variant,
  mode,
  size = 'md',
  leftIcon,
  rightIcon,
  fontSize,
  style,
  width,
}: Props) {
  const { theme: { colors } } = useAppTheme();

  const displayTitle = title ?? label ?? '';

  // mode Paper → variant (rétro-compat)
  const resolvedVariant: Variant =
    variant ??
    (mode === 'text' ? 'ghost' : mode === 'outlined' ? 'outline' : 'primary');

  const textColor = resolvedVariant === 'primary' ? '#ffffff' : colors.text;

  const paddingStyle =
    size === 'sm'
      ? { paddingHorizontal: 12, paddingVertical: 8 }
      : size === 'lg'
        ? { paddingHorizontal: 20, paddingVertical: 14 }
        : { paddingHorizontal: 16, paddingVertical: 12 };

  const variantStyle: StyleProp<ViewStyle> =
    resolvedVariant === 'primary'
      ? {
          backgroundColor: colors.primary,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 2,
        }
      : resolvedVariant === 'outline'
        ? { backgroundColor: 'transparent', borderColor: colors.outline, borderWidth: 1 }
        : { backgroundColor: 'transparent' };

  const widthStyle = width !== undefined ? ({ width } as ViewStyle) : undefined;

  const renderIcon = (icon?: React.ReactNode) => {
    if (icon === null || icon === undefined) return null;
    if (typeof icon === 'string') return <Text style={{ color: textColor }}>{icon}</Text>;
    return icon;
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessible
      accessibilityRole="button"
      accessibilityLabel={displayTitle}
      style={[
        {
          borderRadius: 24,
          minHeight: 52,
          paddingVertical: 6,
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
          gap: 6,
          opacity: disabled || loading ? 0.6 : 1,
        },
        paddingStyle,
        variantStyle,
        widthStyle as StyleProp<ViewStyle>,
        style,
      ]}
    >
      {leftIcon ? <View>{renderIcon(leftIcon)}</View> : null}
      {loading ? <ActivityIndicator color={textColor} style={{ marginRight: 4 }} /> : null}
      <Text
        style={{
          color: textColor,
          fontSize: fontSize ?? 16,
          fontWeight: '700',
          textAlign: 'center',
        }}
      >
        {displayTitle}
      </Text>
      {rightIcon ? <View>{renderIcon(rightIcon)}</View> : null}
    </Pressable>
  );
}
