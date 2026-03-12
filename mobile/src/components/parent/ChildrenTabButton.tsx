import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useChildrenStore } from '@store/childrenStore';

type TabButtonProps = {
  accessibilityState?: { selected?: boolean };
};

export function ChildrenTabButton({ accessibilityState }: TabButtonProps) {
  const { t } = useTranslation();
  const children = useChildrenStore((s) => s.children);
  const [open, setOpen] = useState(false);

  const labelColor = accessibilityState?.selected ? '#3B82F6' : '#9CA3AF';

  const orderedChildren = useMemo(
    () => [...children].sort((left, right) => left.pseudonym.localeCompare(right.pseudonym)),
    [children]
  );

  const handleMainPress = () => {
    if (orderedChildren.length <= 1) {
      if (orderedChildren.length === 1) {
        router.push(`/(parent)/children/${orderedChildren[0].id}`);
        return;
      }
      router.push('/(parent)/children/index');
      return;
    }

    setOpen((previousState) => !previousState);
  };

  const goToChild = (childId?: string) => {
    setOpen(false);
    if (!childId) {
      router.push('/(parent)/children/index');
      return;
    }
    router.push(`/(parent)/children/${childId}`);
  };

  return (
    <View style={styles.wrapper}>
      {open ? (
        <View style={styles.menu}>
          <Pressable style={styles.menuItem} onPress={() => goToChild()}>
            <Text style={styles.menuItemText}>{t('tabs.allChildren')}</Text>
          </Pressable>
          {orderedChildren.map((child) => (
            <Pressable key={child.id} style={styles.menuItem} onPress={() => goToChild(child.id)}>
              <Text style={styles.menuItemText}>{child.pseudonym}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      <Pressable style={styles.button} onPress={handleMainPress}>
        <Text style={[styles.label, { color: labelColor }]}>{t('tabs.children')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    minWidth: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    minHeight: 44,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
  menu: {
    position: 'absolute',
    bottom: 44,
    minWidth: 170,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 6,
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  menuItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  menuItemText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
  },
});