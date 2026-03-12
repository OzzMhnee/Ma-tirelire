import React from 'react';
import { TextInput, TextInputProps, View, Text } from 'react-native';
import { useAppTheme } from '@/theme/ThemeProvider';
import { Label } from './Label';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  required?: boolean;
};

export function Input({ label, error, required, ...props }: Props) {
  const { theme: { colors } } = useAppTheme();

  return (
    <View style={{ gap: 4 }}>
      {label ? <Label required={required}>{label}</Label> : null}
      <TextInput
        style={{
          borderColor: error ? colors.danger : colors.outline,
          backgroundColor: 'rgba(255,255,255,0.96)',
          color: '#000000',
          fontSize: 16,
          lineHeight: 22,
          fontWeight: '600',
          textAlignVertical: 'center',
          borderRadius: 50,
          minHeight: 54,
          paddingHorizontal: 16,
          paddingVertical: 12,
          width: '100%',
          borderWidth: 1,
        }}
        placeholderTextColor="#6b7280"
        {...props}
      />
      {error ? (
        <Text style={{ color: '#991b1b', fontSize: 12, paddingHorizontal: 6 }}>{error}</Text>
      ) : null}
    </View>
  );
}
