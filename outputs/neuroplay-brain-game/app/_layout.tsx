import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { palette, typography } from '@/theme/tokens';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: palette.primary },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontSize: typography.heading, fontWeight: typography.weightBold },
          contentStyle: { backgroundColor: palette.bg },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'NeuroPlay 大腦訓練' }} />
        <Stack.Screen name="games/flash-locate" options={{ title: '閃現定位' }} />
        <Stack.Screen name="games/palace" options={{ title: '記憶宮殿' }} />
        <Stack.Screen name="games/semantic-fluency" options={{ title: '語意流暢' }} />
        <Stack.Screen name="progress" options={{ title: '訓練紀錄' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
