import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '@/theme/ThemeProvider';
import { Badge, Button } from '@components/ui';
import { formatCurrency } from '@utils/format';
import type { Mission } from '@/types/domain.types';

type Props = {
  mission: Mission;
  completeLabel: string;
  onComplete?: (id: string) => void;
};

export function MissionCard({ mission, completeLabel, onComplete }: Props) {
  const { theme: { colors } } = useAppTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {mission.title}
        </Text>
        <Badge label={formatCurrency(mission.reward)} tone="success" />
      </View>

      {mission.description ? (
        <Text style={[styles.description, { color: colors.muted }]} numberOfLines={2}>
          {mission.description}
        </Text>
      ) : null}

      {mission.status === 'pending' && onComplete ? (
        <Button
          label={completeLabel}
          variant="primary"
          size="sm"
          onPress={() => onComplete(mission.id)}
          style={styles.btn}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  description: {
    fontSize: 13,
    marginTop: 4,
  },
  btn: {
    marginTop: 10,
    alignSelf: 'flex-end',
  },
});
