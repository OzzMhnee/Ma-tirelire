import React from 'react';
import { Button as PaperButton, ButtonProps } from 'react-native-paper';
import { StyleSheet } from 'react-native';

interface Props extends Omit<ButtonProps, 'children'> {
  label: string;
  loading?: boolean;
  className?: string;
}

export function Button({ label, loading = false, mode = 'contained', style, ...rest }: Props) {
  return (
    <PaperButton
      mode={mode}
      loading={loading}
      disabled={loading || rest.disabled}
      style={[styles.base, style]}
      {...rest}
    >
      {label}
    </PaperButton>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    marginVertical: 4,
  },
});
