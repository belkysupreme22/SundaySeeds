import { router } from 'expo-router';

// The same forms can be steps in onboarding or standalone Settings routes.
// These callbacks carry destinations only, never credentials or session state.
export type AccountNavigation = {
  back: () => void;
  signIn: () => void;
  signUp: () => void;
  recover: () => void;
  verify: () => void;
  reset: () => void;
  continueLearning: () => void;
};

export function createAccountNavigation(
  fallback: '/settings' | '/sign-up' | '/forgot-password',
  recoveryNavigation: 'push' | 'replace' = 'push',
): AccountNavigation {
  return {
    back: () => (router.canGoBack() ? router.back() : router.replace(fallback)),
    signIn: () => router.replace('/sign-in'),
    signUp: () => router.replace('/sign-up'),
    recover: () =>
      recoveryNavigation === 'replace'
        ? router.replace('/forgot-password')
        : router.push('/forgot-password'),
    verify: () => router.push('/verify-email'),
    reset: () => router.push('/reset-password'),
    continueLearning: () => router.replace('/'),
  };
}
