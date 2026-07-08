import { Text } from 'react-native';
import { Tabs } from 'expo-router';

function TabIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 20 }}>{emoji}</Text>;
}

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{ title: 'Garden', tabBarIcon: () => <TabIcon emoji="🌱" /> }}
      />
      <Tabs.Screen
        name="today"
        options={{ title: 'Today', tabBarIcon: () => <TabIcon emoji="⏰" /> }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{ title: 'Dashboard', tabBarIcon: () => <TabIcon emoji="📊" /> }}
      />
    </Tabs>
  );
}
