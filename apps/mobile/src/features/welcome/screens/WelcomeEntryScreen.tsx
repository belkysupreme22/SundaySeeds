import { Screen } from '../../../shared/ui/Screen';
import { HomeScreen } from '../../home/screens/HomeScreen';
import { useWelcome } from '../hooks/useWelcome';
import { WelcomeFlow } from './WelcomeFlow';

export function WelcomeEntryScreen() {
  const welcome = useWelcome();
  if (!welcome.ready) {
    return <Screen loadingMessage="Welcome to SundaySeeds…">{null}</Screen>;
  }
  if (welcome.completed) return <HomeScreen />;
  return (
    <WelcomeFlow
      saving={welcome.saving}
      error={welcome.error}
      onFinish={welcome.complete}
      onContinueForNow={welcome.continueForNow}
    />
  );
}
