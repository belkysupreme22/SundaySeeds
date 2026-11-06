import { router, useLocalSearchParams, type Href } from 'expo-router';

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
  afterSignIn?: () => void;
};

const courseReturnPattern = /^\/courses\/([\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12})$/i;

function returnDestination(returnTo: string | string[] | undefined): Href | undefined {
  if (returnTo === '/profile' || returnTo === '/settings' || returnTo === '/progress')
    return returnTo;
  const course = typeof returnTo === 'string' ? courseReturnPattern.exec(returnTo) : null;
  if (course) return { pathname: '/courses/[id]', params: { id: course[1] } };
}

export function useAccountRouteNavigation(
  fallback: '/home' | '/sign-up' | '/forgot-password',
  recoveryNavigation: 'push' | 'replace' = 'push',
): AccountNavigation {
  const { returnTo } = useLocalSearchParams<{ returnTo?: string | string[] }>();
  const destination = returnDestination(returnTo);
  const params = destination && typeof returnTo === 'string' ? { returnTo } : {};
  const guestDestination =
    destination === '/profile' || destination === '/settings' ? '/home' : (destination ?? '/home');
  return {
    back: () => (router.canGoBack() ? router.back() : router.replace(destination ?? fallback)),
    signIn: () => router.replace({ pathname: '/sign-in', params }),
    signUp: () => router.replace({ pathname: '/sign-up', params }),
    recover: () =>
      recoveryNavigation === 'replace'
        ? router.replace({ pathname: '/forgot-password', params })
        : router.push({ pathname: '/forgot-password', params }),
    verify: () => router.push({ pathname: '/verify-email', params }),
    reset: () => router.push({ pathname: '/reset-password', params }),
    continueLearning: () => router.dismissTo(guestDestination),
    afterSignIn: () => router.dismissTo(destination ?? '/home'),
  };
}
