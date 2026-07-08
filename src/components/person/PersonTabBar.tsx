import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

export type PersonTab = 'overview' | 'settings' | 'notes';

const TABS: { key: PersonTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'settings', label: 'Settings' },
  { key: 'notes', label: 'Notes' },
];

interface PersonTabBarProps {
  active: PersonTab;
  onChange: (tab: PersonTab) => void;
}

export function PersonTabBar({ active, onChange }: PersonTabBarProps) {
  return (
    <View style={styles.row}>
      {TABS.map((tab) => (
        <Pressable
          key={tab.key}
          onPress={() => onChange(tab.key)}
          style={[styles.tab, active === tab.key && styles.tabActive]}
        >
          <ThemedText type={active === tab.key ? 'smallBold' : 'small'}>{tab.label}</ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#7CB342',
  },
});
