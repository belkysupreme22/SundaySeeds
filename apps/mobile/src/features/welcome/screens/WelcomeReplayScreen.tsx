import { router } from 'expo-router';
import { useWelcome } from '../hooks/useWelcome';
import { WelcomeScreen } from './WelcomeScreen';

export function WelcomeReplayScreen() {
  const welcome = useWelcome();
  async function finish() {
    if (await welcome.complete()) router.replace('/');
  }
  return (
    <WelcomeScreen
      saving={welcome.saving || !welcome.ready}
      error={welcome.error}
      onFinish={() => {
        void finish();
      }}
      onContinueForNow={() => {
        welcome.continueForNow();
        router.replace('/');
      }}
    />
  );
}
