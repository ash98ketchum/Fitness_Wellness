import { Tabs } from 'expo-router';
import { Activity, Calendar } from 'lucide-react-native';

export default function AppLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: '#000', borderTopColor: '#27272a' }, tabBarActiveTintColor: '#10b981', tabBarInactiveTintColor: '#71717a' }}>
      <Tabs.Screen name="dashboard" options={{ title: 'Today', tabBarIcon: ({ color }) => <Activity color={color} size={24} /> }} />
      <Tabs.Screen name="planner" options={{ title: 'Planner', tabBarIcon: ({ color }) => <Calendar color={color} size={24} /> }} />
      <Tabs.Screen name="meal/[id]" options={{ href: null }} />
    </Tabs>
  );
}
