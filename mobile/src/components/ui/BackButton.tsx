import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Props {
  onPress: () => void;
  accessibilityLabel?: string;
  style?: ViewStyle;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
}

export function BackButton({ onPress, accessibilityLabel = 'Retour', style, top, left, right, bottom }: Props) {
  const positionStyle: ViewStyle = { top, left, right, bottom };

  return (
    <TouchableOpacity
      style={[styles.container, positionStyle, style]}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      activeOpacity={0.8}
    >
      <Icon name="arrow-back" size={26} color="#111" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 26,
    left: 26,
    padding: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    zIndex: 5,
  },
});
