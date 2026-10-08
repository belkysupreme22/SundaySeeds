import AsyncStorage from '@react-native-async-storage/async-storage';

const WELCOME_KEY = 'sundayseeds.welcome.v1';
let completedThisSession = false;

export const welcomeStorage = {
  async hasCompleted(): Promise<boolean> {
    if (completedThisSession) return true;
    completedThisSession = (await AsyncStorage.getItem(WELCOME_KEY)) === 'complete';
    return completedThisSession;
  },
  async complete(): Promise<void> {
    await AsyncStorage.setItem(WELCOME_KEY, 'complete');
    completedThisSession = true;
  },
  continueForNow(): void {
    // Storage failure must not trap the learner in the introduction on every tab visit.
    completedThisSession = true;
  },
};
