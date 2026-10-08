import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { ActivityIndicator, Platform, StyleSheet, View, Text as NativeText } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  LearningProgressProvider,
  useLearningProgress,
} from '../features/progress/hooks/useLearningProgress';
import { colors } from '../shared/theme/tokens';
import { LearnerProfileProvider } from '../features/profile/hooks/useLearnerProfile';
import { Text } from '../shared/ui/Text';

function AppNavigator() {
  const { hydrated, error } = useLearningProgress();
  if (!hydrated)
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.ink} />
        <Text>Opening your learning space…</Text>
      </View>
    );
  return (
    <>
      {error && (
        <View style={styles.error} accessibilityRole="alert">
          <Text variant="small">{error}</Text>
        </View>
      )}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.paper },
          animation: 'slide_from_right',
        }}
      />
    </>
  );
}
export default function RootLayout() {
  const [loaded, error] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });
  return (
    <SafeAreaProvider>
      <View style={styles.backdrop}>
        <View style={styles.app}>
          <StatusBar style="dark" />
          {!loaded && !error ? (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.ink} />
              <NativeText>Preparing SundaySeeds…</NativeText>
            </View>
          ) : (
            <LearningProgressProvider>
              <LearnerProfileProvider>
                <AppNavigator />
              </LearnerProfileProvider>
            </LearningProgressProvider>
          )}
        </View>
      </View>
    </SafeAreaProvider>
  );
}
const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#EEEBF2', alignItems: 'center' },
  app: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 480 : undefined,
    backgroundColor: colors.paper,
  },
  loading: { flex: 1, gap: 16, justifyContent: 'center', alignItems: 'center' },
  error: { backgroundColor: colors.peach, padding: 12 },
});
