import { Stack } from 'expo-router';

// No tab bar — history is pushed as a regular stack screen
export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#070C18' },
        animation: 'slide_from_right',
      }}
    />
  );
}
