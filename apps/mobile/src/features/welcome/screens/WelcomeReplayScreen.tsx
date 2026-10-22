import { useCallback, useRef } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { useWelcome } from '../hooks/useWelcome';
import { WelcomeFlow } from './WelcomeFlow';

export function WelcomeReplayScreen() {
  const welcome = useWelcome();
  const focused = useRef(false);
  const finishAttempt = useRef(0);
  const finishInFlight = useRef(false);
  useFocusEffect(
    useCallback(() => {
      focused.current = true;
      return () => {
        focused.current = false;
        ++finishAttempt.current;
      };
    }, []),
  );
  async function finish(): Promise<boolean> {
    if (finishInFlight.current || !focused.current) return false;
    finishInFlight.current = true;
    const attempt = ++finishAttempt.current;
    try {
      const completed = await welcome.complete();
      if (completed && focused.current && finishAttempt.current === attempt) router.replace('/');
      return completed;
    } finally {
      finishInFlight.current = false;
    }
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
