import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type PropsWithChildren,
} from 'react';
import { AppState } from 'react-native';
import { createLearningStore } from '../data/createLearningStore';
import { getStudyBadgeProgress, type StudyActivity } from '../data/studyActivity';

type LearningStore = ReturnType<typeof createLearningStore>;
const LearningContext = createContext<LearningStore | null>(null);

export function LearningProgressProvider({ children }: PropsWithChildren) {
  const [store] = useState(() => createLearningStore(AsyncStorage));
  useEffect(() => {
    void store.hydrate();
  }, [store]);
  return <LearningContext.Provider value={store}>{children}</LearningContext.Provider>;
}

export function useLearningProgress() {
  const store = useContext(LearningContext);
  if (!store) throw new Error('useLearningProgress must be used inside LearningProgressProvider.');
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  return {
    ...snapshot,
    setSection: store.setSection,
    completeQuiz: store.completeQuiz,
    toggleBookmark: store.toggleBookmark,
    retryStorage: store.retryStorage,
    resetProgress: () => store.resetProgress(),
  };
}

export function useStudyBadgeProgress(activity: StudyActivity) {
  const [now, setNow] = useState(() => new Date());

  useFocusEffect(
    useCallback(() => {
      let rollover: ReturnType<typeof setTimeout> | undefined;

      function stopClock() {
        if (rollover !== undefined) clearTimeout(rollover);
      }

      function refreshClock() {
        stopClock();
        const current = new Date();
        setNow(current);
        const midnight = new Date(current.getTime());
        midnight.setHours(24, 0, 0, 0);
        rollover = setTimeout(refreshClock, midnight.getTime() - current.getTime());
      }

      const subscription = AppState.addEventListener('change', (state) => {
        if (state === 'active') refreshClock();
        else stopClock();
      });
      if (AppState.currentState === 'active' || AppState.currentState == null) refreshClock();

      return () => {
        subscription.remove();
        stopClock();
      };
    }, []),
  );

  return useMemo(() => getStudyBadgeProgress(activity, now), [activity, now]);
}
