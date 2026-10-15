import { useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { colors } from '../../../shared/theme/tokens';
import { Screen } from '../../../shared/ui/Screen';
import { Text } from '../../../shared/ui/Text';
import { HomeScreen } from '../../home/screens/HomeScreen';
import { useWelcome } from '../hooks/useWelcome';
import { WelcomeScreen } from './WelcomeScreen';
import { MinimalSetupScreen } from './MinimalSetupScreen';
import { welcomeSlides } from '../data/welcomeSlides';

export function WelcomeEntryScreen() {
  const welcome = useWelcome();
  const [setup, setSetup] = useState(false);
  const [returningToIntroduction, setReturningToIntroduction] = useState(false);
  if (!welcome.ready) {
    return (
      <Screen>
        <ActivityIndicator color={colors.ink} />
        <Text>Welcome to SundaySeeds…</Text>
      </Screen>
    );
  }
  if (welcome.completed) return <HomeScreen />;
  if (setup) {
    return (
      <MinimalSetupScreen
        finishing={welcome.saving}
        finishError={welcome.error}
        onFinish={welcome.complete}
        onContinueForNow={welcome.continueForNow}
        onBack={() => {
          setReturningToIntroduction(true);
          setSetup(false);
        }}
      />
    );
  }
  return (
    <WelcomeScreen
      saving={welcome.saving}
      error={welcome.error}
      initialIndex={returningToIntroduction ? welcomeSlides.length - 1 : 0}
      onFinish={() => setSetup(true)}
      onSkip={() => {
        void welcome.complete();
      }}
      onContinueForNow={welcome.continueForNow}
    />
  );
}
