import { router } from 'expo-router';
import { useWelcome } from '../hooks/useWelcome';
import { WelcomeFlow } from './WelcomeFlow';

export function WelcomeReplayScreen() {
  const welcome = useWelcome();
  async function finish(): Promise<boolean> {
    const completed = await welcome.complete();
    if (completed) router.replace('/');
    return completed;
  }
  function continueForNow() {
    welcome.continueForNow();
    router.replace('/');
  }
  return (
    <WelcomeFlow
      saving={welcome.saving || !welcome.ready}
      error={welcome.error}
      onFinish={finish}
      onContinueForNow={continueForNow}
    />
  );
}
