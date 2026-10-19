import { useAuth } from '../../auth/hooks/useAuth';
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { profileStorage } from '../data/profileStorage';

type LearnerProfile = {
  displayName: string;
  hydrated: boolean;
  loadError: string | null;
  saveError: string | null;
  saving: boolean;
  retryLoad: () => void;
  saveName: (value: string) => Promise<boolean>;
};

const ProfileContext = createContext<LearnerProfile | null>(null);

export function LearnerProfileProvider({ children }: PropsWithChildren) {
  const [displayName, setDisplayName] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const saveInFlight = useRef(false);

  useEffect(() => {
    let active = true;
    setHydrated(false);
    setLoadError(null);
    void profileStorage.readName().then(
      (name) => {
        if (!active) return;
        setDisplayName(name);
        setHydrated(true);
      },
      () => {
        if (!active) return;
        setLoadError('Your saved name could not be loaded. Try again before editing it.');
        setHydrated(true);
      },
    );
    return () => {
      active = false;
    };
  }, [loadAttempt]);

  async function saveName(value: string): Promise<boolean> {
    // Preserve existing storage after a failed read, and allow only one write at a time.
    if (!hydrated || loadError || saveInFlight.current) return false;
    saveInFlight.current = true;
    setSaving(true);
    setSaveError(null);
    try {
      const name = await profileStorage.writeName(value);
      setDisplayName(name);
      return true;
    } catch {
      setSaveError('Your name could not be saved. Your changes are still here; please try again.');
      return false;
    } finally {
      saveInFlight.current = false;
      setSaving(false);
    }
  }

  return (
    <ProfileContext.Provider
      value={{
        displayName,
        hydrated,
        loadError,
        saveError,
        saving,
        saveName,
        retryLoad: () => setLoadAttempt((attempt) => attempt + 1),
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useLearnerProfile(): LearnerProfile {
  const guest = useContext(ProfileContext);
  const auth = useAuth();
  const [saveError, setSaveError] = useState<string | null>(null);
  useEffect(() => {
    setSaveError(null);
  }, [auth.user?.id]);
  if (!guest) throw new Error('useLearnerProfile must be used inside LearnerProfileProvider.');
  if (!auth.user) return { ...guest, hydrated: guest.hydrated && auth.hydrated };
  return {
    displayName: auth.profile?.displayName ?? '',
    hydrated: auth.hydrated && Boolean(auth.profile || auth.profileError || auth.error),
    loadError: !auth.profile ? auth.profileError || auth.error : null,
    saveError: saveError || (auth.profile ? auth.profileError : null),
    saving: auth.busy,
    retryLoad: () => {
      setSaveError(null);
      void (auth.profile ? auth.retryProfile() : auth.checkVerification());
    },
    saveName: async (name) => {
      const result = await auth.saveProfileName(name);
      setSaveError(result.ok ? null : result.message);
      return result.ok;
    },
  };
}
