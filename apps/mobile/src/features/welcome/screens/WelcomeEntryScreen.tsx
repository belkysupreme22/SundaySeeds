import { ActivityIndicator } from 'react-native';
import { colors } from '../../../shared/theme/tokens';
import { Screen } from '../../../shared/ui/Screen';
import { Text } from '../../../shared/ui/Text';
import { HomeScreen } from '../../home/screens/HomeScreen';
import { useWelcome } from '../hooks/useWelcome';
import { WelcomeScreen } from './WelcomeScreen';

export function WelcomeEntryScreen() {
  const welcome = useWelcome();
  if (!welcome.ready) {
    return (
      <Screen>
        <ActivityIndicator color={colors.ink} />
        <Text>Welcome to SundaySeeds…</Text>
      </Screen>
    );
  }
  if (welcome.completed) return <HomeScreen />;
  return (
    <WelcomeScreen
      saving={welcome.saving}
      error={welcome.error}
      onFinish={() => {
        void welcome.complete();
      }}
      onContinueForNow={welcome.continueForNow}
    />
  );
}
