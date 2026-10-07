import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type PropsWithChildren,
} from 'react';
import { createLearningStore } from '../data/createLearningStore';

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
    resetProgress: () => store.resetProgress(),
  };
}
