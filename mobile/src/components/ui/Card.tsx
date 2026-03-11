import React from 'react';
import { Card as PaperCard, CardProps } from 'react-native-paper';
import { StyleSheet } from 'react-native';

interface Props extends CardProps {
  children: React.ReactNode;
}

export function Card({ children, style, ...rest }: Props) {
  return (
    <PaperCard style={[styles.card, style]} {...rest}>
      <PaperCard.Content>{children}</PaperCard.Content>
    </PaperCard>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginVertical: 6,
    elevation: 2,
  },
});
