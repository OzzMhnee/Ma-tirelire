import React, { forwardRef } from 'react';
import { TextInput, TextInputProps, HelperText } from 'react-native-paper';
import { View } from 'react-native';

interface Props extends TextInputProps {
  error?: string;
}

export const Input = forwardRef<React.ComponentRef<typeof TextInput>, Props>(
  ({ error, style, ...rest }, ref) => {
    return (
      <View style={{ marginVertical: 4 }}>
        <TextInput
          ref={ref}
          mode="outlined"
          error={!!error}
          style={style}
          {...rest}
        />
        {!!error && (
          <HelperText type="error" visible>
            {error}
          </HelperText>
        )}
      </View>
    );
  }
);
Input.displayName = 'Input';
