import { useCallback, useEffect, useRef, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { authMessage, type AuthMessage } from '../data/authMessages';
import { createEmailProof } from '../data/emailProof';
import { useAuth } from './useAuth';

type ProofNotice = AuthMessage & { deviceMessageKey?: AuthMessage['messageKey'] };

function validProof(
  kind: 'confirmation' | 'recovery',
  token: unknown,
  type: unknown,
): token is string {
  return (
    typeof token === 'string' &&
    /^[a-zA-Z0-9_-]{20,512}$/.test(token) &&
    type === (kind === 'confirmation' ? 'email' : 'recovery')
  );
}

export function useEmailProof(kind: 'confirmation' | 'recovery', token: unknown, type: unknown) {
  const auth = useAuth();
  const initial = validProof(kind, token, type) ? token : null;
  const proofToken = useRef(initial);
  const seenToken = useRef(initial);
  const controller = useRef<ReturnType<typeof createEmailProof> | null>(null);
  const [stage, setStage] = useState<'ready' | 'password' | 'done' | 'invalid'>(
    initial ? 'ready' : 'invalid',
  );
  const [notice, setNotice] = useState<ProofNotice | null>(
    initial ? null : authMessage('openLatestEmailLink'),
  );
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const active = useRef(true);
  const request = useRef(0);
  const inFlight = useRef(false);
  const consumed = useRef(false);
  useEffect(() => {
    if (!validProof(kind, token, type)) return;
    if (token !== seenToken.current) {
      ++request.current;
      controller.current?.dispose();
      controller.current = null;
      proofToken.current = token;
      seenToken.current = token;
      inFlight.current = false;
      consumed.current = false;
      setBusy(false);
      setEmail('');
      setNotice(null);
      setStage('ready');
    }
    // Capture only in memory, then remove parameters without consuming the proof.
    // Let the parent navigation/linking listeners mount before changing params
    // on a directly opened link; otherwise the browser URL can retain the proof.
    const cleanup = setTimeout(() => {
      if (active.current) router.setParams({ token_hash: undefined, type: undefined });
    }, 0);
    return () => clearTimeout(cleanup);
  }, [kind, token, type]);
  useFocusEffect(
    useCallback(() => {
      active.current = true;
      if (consumed.current && !controller.current) {
        inFlight.current = false;
        setBusy(false);
        setStage('invalid');
        setNotice(authMessage('openNewLink'));
      }
      return () => {
        active.current = false;
        ++request.current;
        controller.current?.dispose();
        controller.current = null;
        // An unconsumed proof remains only in memory until this route unmounts.
        // Keeping it here also tolerates StrictMode setup/cleanup repetition.
      };
    }, []),
  );
  async function perform(password?: string) {
    if (!active.current || inFlight.current) return false;
    if (!controller.current && proofToken.current) {
      consumed.current = true;
      controller.current = createEmailProof(kind, proofToken.current);
      proofToken.current = null;
    }
    const proof = controller.current;
    if (!proof) {
      setStage('invalid');
      setNotice(authMessage('openNewLink'));
      return false;
    }
    const version = ++request.current;
    inFlight.current = true;
    setBusy(true);
    const result = password === undefined ? await proof.begin() : await proof.reset(password);
    let deviceMessageKey: AuthMessage['messageKey'] | undefined;
    if (password !== undefined && result.ok && result.userId) {
      const signedOut = await auth.signOut(result.userId);
      if (!signedOut.ok && auth.user?.id === result.userId) {
        deviceMessageKey = authMessage('deviceSignOutUnconfirmed').messageKey;
      }
    }
    if (active.current && request.current === version) {
      setNotice({
        message: result.message,
        messageKey: result.messageKey,
        deviceMessageKey,
      });
      if (result.email) setEmail(result.email);
      setStage(
        result.ok
          ? kind === 'recovery' && password === undefined
            ? 'password'
            : 'done'
          : password === undefined
            ? 'invalid'
            : 'password',
      );
      setBusy(false);
      inFlight.current = false;
    }
    return result.ok && active.current && request.current === version;
  }
  return {
    stage,
    message: notice?.message ?? null,
    messageKey: notice?.messageKey ?? null,
    deviceMessageKey: notice?.deviceMessageKey ?? null,
    email,
    busy,
    begin: () => perform(),
    reset: (password: string) => perform(password),
  };
}
