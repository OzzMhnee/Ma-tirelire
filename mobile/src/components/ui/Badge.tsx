import React from 'react';
import { Chip, ChipProps } from 'react-native-paper';

type Variant = 'success' | 'warning' | 'error' | 'info' | 'default';

const VARIANT_COLORS: Record<Variant, string> = {
  success: '#4caf50',
  warning: '#ff9800',
  error:   '#f44336',
  info:    '#2196f3',
  default: '#9e9e9e',
};

interface Props extends Omit<ChipProps, 'children'> {
  label: string;
  variant?: Variant;
}

export function Badge({ label, variant = 'default', style, ...rest }: Props) {
  const color = VARIANT_COLORS[variant];
  return (
    <Chip
      style={[{ backgroundColor: color + '22' }, style]}
      textStyle={{ color, fontSize: 11, fontWeight: '600' }}
      {...rest}
    >
      {label}
    </Chip>
  );
}
