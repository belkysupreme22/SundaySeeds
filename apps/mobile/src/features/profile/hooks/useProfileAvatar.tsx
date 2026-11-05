import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { avatarStorage } from '../data/profileStorage';
import type { AvatarId } from '../types/avatar';

type AvatarSnapshot =
  | { scope: string; status: 'ready'; avatarId: AvatarId | null }
  | { scope: string; status: 'error' };

type AvatarPreference = {
  avatarId: AvatarId | null;
  status: 'loading' | AvatarSnapshot['status'];
  reload: () => void;
  saveAvatar: (avatarId: AvatarId | null) => Promise<boolean>;
};

const AvatarContext = createContext<AvatarPreference | null>(null);

export function ProfileAvatarProvider({ children }: PropsWithChildren) {
  const { hydrated, user } = useAuth();
  const scope = user ? `account.${user.id}` : 'guest';
  const [snapshot, setSnapshot] = useState<AvatarSnapshot | null>(null);
  const [attempt, setAttempt] = useState(0);
  const writing = useRef(new Set<string>());
  const current = hydrated && snapshot?.scope === scope ? snapshot : null;

  useEffect(() => {
    if (!hydrated) return;
    let active = true;
    setSnapshot(null);
    void avatarStorage.read(scope).then(
      (avatarId) => {
        if (active) setSnapshot({ scope, status: 'ready', avatarId });
      },
      () => {
        if (active) setSnapshot({ scope, status: 'error' });
      },
    );
    return () => {
      active = false;
    };
  }, [attempt, hydrated, scope]);

  async function saveAvatar(avatarId: AvatarId | null) {
    if (current?.status !== 'ready' || writing.current.has(scope)) return false;
    writing.current.add(scope);
    try {
      await avatarStorage.write(scope, avatarId);
      setSnapshot((value) =>
        value?.scope === scope ? { scope, status: 'ready', avatarId } : value,
      );
      return true;
    } catch {
      return false;
    } finally {
      writing.current.delete(scope);
    }
  }

  return (
    <AvatarContext.Provider
      value={{
        avatarId: current?.status === 'ready' ? current.avatarId : null,
        status: current?.status ?? 'loading',
        reload: () => setAttempt((value) => value + 1),
        saveAvatar,
      }}
    >
      {children}
    </AvatarContext.Provider>
  );
}

export function useProfileAvatar() {
  const preference = useContext(AvatarContext);
  if (!preference) throw new Error('useProfileAvatar must be used inside ProfileAvatarProvider.');
  return preference;
}
