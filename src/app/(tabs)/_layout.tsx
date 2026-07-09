import { Pressable, Text } from 'react-native';
import { Link, Tabs } from 'expo-router';

function TabIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 20 }}>{emoji}</Text>;
}

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Garden',
          tabBarIcon: () => <TabIcon emoji="🌱" />,
          headerRight: () => (
            <Link href="/archived" asChild>
              <Pressable hitSlop={8} style={{ marginRight: 16 }}>
                <Text style={{ fontSize: 18 }}>🗄️</Text>
              </Pressable>
            </Link>
          ),
        }}
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
