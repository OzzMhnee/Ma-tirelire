import React, { useState } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { Button } from './Button';
import { Card } from './Card';

type Props = {
  title: string;
  description: string;
  actionLabel: string;
  confirmMessage: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function DestructiveActionCard({
  title,
  description,
  actionLabel,
  confirmMessage,
  confirmLabel,
  cancelLabel,
  onConfirm,
  loading = false,
  style,
}: Props) {
  const [isConfirming, setIsConfirming] = useState(false);

  return (
    <Card style={style}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      {isConfirming ? (
        <View style={styles.confirmationBox}>
          <Text style={styles.confirmationText}>{confirmMessage}</Text>
          <View style={styles.actionsRow}>
            <Button
              label={cancelLabel}
              variant="ghost"
              onPress={() => setIsConfirming(false)}
              style={styles.secondaryAction}
            />
            <Button
              label={confirmLabel}
              onPress={onConfirm}
              loading={loading}
              style={styles.confirmAction}
            />
          </View>
        </View>
      ) : (
        <Button
          label={actionLabel}
          variant="outline"
          onPress={() => setIsConfirming(true)}
          loading={loading}
          style={styles.triggerButton}
        />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    color: '#991b1b',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  description: {
    color: '#6b7280',
    lineHeight: 20,
  },
  triggerButton: {
    marginTop: 12,
    borderColor: '#ef4444',
  },
  confirmationBox: {
    marginTop: 12,
    borderRadius: 12,
    borderColor: '#fecaca',
    borderWidth: 1,
    backgroundColor: '#fef2f2',
    padding: 12,
    gap: 12,
  },
  confirmationText: {
    color: '#991b1b',
    lineHeight: 20,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryAction: {
    flex: 1,
  },
  confirmAction: {
    flex: 1,
    backgroundColor: '#dc2626',
  },
});