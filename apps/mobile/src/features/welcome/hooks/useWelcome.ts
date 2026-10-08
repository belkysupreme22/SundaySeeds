import { useEffect, useRef, useState } from 'react';
import { welcomeStorage } from '../data/welcomeStorage';

export function useWelcome() {
  const [ready, setReady] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saveInFlight = useRef(false);

  useEffect(() => {
    let active = true;
    welcomeStorage
      .hasCompleted()
      .then((value) => {
        if (active) setCompleted(value);
      })
      .catch(() => {
        if (active) setError('We could not load your welcome preference. You can still explore.');
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  async function complete(): Promise<boolean> {
    if (saveInFlight.current) return false;
    saveInFlight.current = true;
    setSaving(true);
    setError(null);
    try {
      await welcomeStorage.complete();
      setCompleted(true);
      return true;
    } catch {
      setError('We could not remember this choice. Try again, or continue for now.');
      return false;
    } finally {
      saveInFlight.current = false;
      setSaving(false);
    }
  }

  function continueForNow() {
    welcomeStorage.continueForNow();
    setCompleted(true);
  }

  return { ready, completed, saving, error, complete, continueForNow };
}
