import { Redirect } from 'expo-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Screen } from '../../../shared/ui/Screen';
import { useAuth } from '../hooks/useAuth';

export function AccountAccess({
  children,
  signedOut,
}: {
  children: ReactNode;
  signedOut?: ReactNode;
}) {
  const { hydrated, user } = useAuth();
  const { t } = useTranslation();

  if (!hydrated) return <Screen loadingMessage={t('settings.statusLoading')}>{null}</Screen>;
  if (!user) return signedOut ?? <Redirect href="/profile" />;
  return <>{children}</>;
}
