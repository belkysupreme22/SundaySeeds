import '../i18n/i18n';
import { useCallback, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n/i18n';
import { AuthProvider } from '../features/auth/hooks/useAuth';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
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
import { AnimatedSplash } from '../shared/ui/AnimatedSplash';

// Keep the native splash visible while fonts load.
SplashScreen.preventAutoHideAsync().catch(() => {});

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
  const [splashDone, setSplashDone] = useState(false);
  const [layoutReady, setLayoutReady] = useState(false);
  const [splashReady, setSplashReady] = useState(false);
  const [nativeSplashHidden, setNativeSplashHidden] = useState(false);
  const fontsReady = loaded || !!error;

  const onLayoutReady = useCallback(() => setLayoutReady(true), []);
  const handleSplashReady = useCallback(() => setSplashReady(true), []);

  useEffect(() => {
    if (!fontsReady || !layoutReady || !splashReady) return;
    // Font readiness can change after the root's only layout event. Gate the
    // native handoff on state, including the replacement splash's actual layout.
    try {
      SplashScreen.hide();
    } catch {
      // Web/preview environments may have no native splash to hide.
    }
    setNativeSplashHidden(true);
  }, [fontsReady, layoutReady, splashReady]);

  const handleSplashComplete = useCallback(() => setSplashDone(true), []);
  // RN Web forwards inert to the DOM. Keep the screen painted for the dissolve
  // while preventing keyboard focus; aria-hidden alone does not prevent focus.
  const webFocusGuard = Platform.OS === 'web' ? { inert: !splashDone } : {};

  return (
    <SafeAreaProvider>
      <View style={styles.backdrop} onLayout={onLayoutReady}>
        <View style={styles.app}>
          <StatusBar style={splashDone ? 'dark' : 'light'} />
          <View
            {...webFocusGuard}
            style={styles.content}
            pointerEvents={splashDone ? 'auto' : 'none'}
            accessibilityElementsHidden={!splashDone}
            importantForAccessibility={splashDone ? 'auto' : 'no-hide-descendants'}
            aria-hidden={!splashDone}
          >
            {!fontsReady ? (
              <View style={styles.loading}>
                <LoadingState label="Preparing SundaySeeds…" bootstrap />
              </View>
            ) : (
              <I18nextProvider i18n={i18n}>
                <LearningProgressProvider>
                  <AuthProvider>
                    <LearnerProfileProvider>
                      <LearningProfileProvider>
                        <AppNavigator />
                      </LearningProfileProvider>
                    </LearnerProfileProvider>
                  </AuthProvider>
                </LearningProgressProvider>
              </I18nextProvider>
            )}
          </View>
          {fontsReady && !splashDone && (
            <AnimatedSplash
              ready={nativeSplashHidden}
              onReady={handleSplashReady}
              onComplete={handleSplashComplete}
            />
          )}
        </View>
      </View>
    </SafeAreaProvider>
  );
}
const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.paper, alignItems: 'center' },
  app: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 480 : undefined,
    backgroundColor: colors.paper,
  },
  content: { flex: 1 },
  loading: { flex: 1, gap: 16, justifyContent: 'center', alignItems: 'center' },
});
