import { useState } from 'react';
import { router } from 'expo-router';
import { useWelcome } from '../hooks/useWelcome';
import { WelcomeScreen } from './WelcomeScreen';
import { MinimalSetupScreen } from './MinimalSetupScreen';
import { welcomeSlides } from '../data/welcomeSlides';

export function WelcomeReplayScreen() {
  const welcome = useWelcome();
  const [setup, setSetup] = useState(false);
  const [returningToIntroduction, setReturningToIntroduction] = useState(false);
  async function finish(): Promise<boolean> {
    const completed = await welcome.complete();
    if (completed) router.replace('/');
    return completed;
  }
  function continueForNow() {
    welcome.continueForNow();
    router.replace('/');
  }
  if (setup) {
    return (
      <MinimalSetupScreen
        finishing={welcome.saving}
        finishError={welcome.error}
        onFinish={finish}
        onContinueForNow={continueForNow}
        onBack={() => {
          setReturningToIntroduction(true);
          setSetup(false);
        }}
      />
    );
  }
  return (
    <WelcomeScreen
      saving={welcome.saving || !welcome.ready}
      error={welcome.error}
      initialIndex={returningToIntroduction ? welcomeSlides.length - 1 : 0}
      onFinish={() => setSetup(true)}
      onSkip={() => {
        void finish();
      }}
      onContinueForNow={continueForNow}
    />
  );
}
