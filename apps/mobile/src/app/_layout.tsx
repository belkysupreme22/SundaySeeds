import { AuthProvider } from '../features/auth/hooks/useAuth';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  LearningProgressProvider,
  useLearningProgress,
} from '../features/progress/hooks/useLearningProgress';
import { colors } from '../shared/theme/tokens';
import { LearnerProfileProvider } from '../features/profile/hooks/useLearnerProfile';
import { LoadingState } from '../shared/ui/LoadingState';
import { LearningStorageNotice } from '../features/progress/components/LearningStorageNotice';
import { LearningProfileProvider } from '../features/learning-profile/hooks/useLearningProfile';

function AppNavigator() {
  const { hydrated } = useLearningProgress();
  if (!hydrated)
    return (
      <View style={styles.loading}>
        <LoadingState label="Opening your learning space…" />
      </View>
    );
  return (
    <>
      <LearningStorageNotice />
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
              <LoadingState label="Preparing SundaySeeds…" bootstrap />
            </View>
          ) : (
            <LearningProgressProvider>
              <AuthProvider>
                <LearnerProfileProvider>
                  <LearningProfileProvider>
                    <AppNavigator />
                  </LearningProfileProvider>
                </LearnerProfileProvider>
              </AuthProvider>
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
});
