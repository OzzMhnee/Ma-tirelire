import { useCallback, useState } from 'react';

/**
 * Hook générique pour expand/collapse de sections dans une liste.
 * Remplace les duplications expand/toggle/getDisplayedItems dans missions et transactions.
 *
 * @param previewCount Nombre d'items affichés quand la section est réduite (défaut: 2)
 */
export function useExpandableList(previewCount = 2) {
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});

  const toggle = useCallback((key: string) => {
    setExpandedKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const isExpanded = useCallback(
    (key: string) => expandedKeys[key] ?? false,
    [expandedKeys],
  );

  const getDisplayedItems = useCallback(
    <T,>(key: string, items: T[]): T[] =>
      isExpanded(key) ? items : items.slice(0, previewCount),
    [isExpanded, previewCount],
  );

  return { toggle, isExpanded, getDisplayedItems };
}
