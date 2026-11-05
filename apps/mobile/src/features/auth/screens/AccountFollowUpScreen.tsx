import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { AccountTopBar } from '../components/AccountTopBar';
import { AccountRecoveryHero } from '../components/AccountRecoveryHero';
import { Screen, ContentGroup } from '../../../shared/ui/Screen';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { Text } from '../../../shared/ui/Text';
import { brandColors, colors } from '../../../shared/theme/tokens';
import { createAccountNavigation, type AccountNavigation } from '../navigation';
import type { LocalizedAuthResult } from '../types';

export function AccountFollowUpScreen({
  mode,
  navigation,
  continueLabel,
}: {
  mode: 'verify' | 'reset';
  navigation?: AccountNavigation;
  continueLabel?: string;
}) {
  const { t } = useTranslation();
  const verification = mode === 'verify';
  const navigate =
    navigation ??
    createAccountNavigation(verification ? '/sign-up' : '/forgot-password', 'replace');
  const auth = useAuth();
  const [notice, setNotice] = useState<LocalizedAuthResult | null>(null);
  const [checking, setChecking] = useState<'verification' | 'resend' | null>(null);
  async function check(resend = false) {
    if (checking || auth.busy || !auth.hydrated) return;
    setChecking(resend ? 'resend' : 'verification');
    try {
      const result = resend ? await auth.resendVerification() : await auth.checkVerification();
      setNotice(result);
    } finally {
      setChecking(null);
    }
  }
  return (
    <Screen
      backgroundColor={brandColors.canvas}
      contentStyle={styles.screen}
      loadingMessage={
        auth.busy && checking
          ? checking === 'resend'
            ? t('authScreens.pending.verificationEmail')
            : t('authScreens.pending.verification')
          : undefined
      }
    >
      <AccountTopBar
        label={t(verification ? 'authScreens.emailVerification' : 'authScreens.passwordReset')}
        onBack={navigate.back}
      />
      <AccountRecoveryHero mode={verification ? 'verify' : 'reset-guidance'} />
      <ContentGroup>
        <Card shadow={false} stroke="soft" style={styles.card}>
          <Text variant="title">
            {t(verification ? 'authScreens.confirmEmail' : 'authScreens.openRecoveryEmail')}
          </Text>
          <Text variant="small">
            {t(
              !auth.configured
                ? 'authScreens.accountUnavailable'
                : verification
                  ? 'authScreens.verificationGuidance'
                  : 'authScreens.resetGuidance',
            )}
          </Text>
        </Card>
        {verification && (
          <>
            <Button
              label={t('authScreens.checkVerification')}
              loading={auth.busy && checking === 'verification'}
              disabled={auth.busy || !auth.hydrated}
              onPress={() => void check()}
            />
            <Button
              label={t('authScreens.resendVerification')}
              variant="outline"
              loading={auth.busy && checking === 'resend'}
              disabled={auth.busy || !auth.hydrated}
              onPress={() => void check(true)}
            />
          </>
        )}
        {notice && (
          <Card shadow={false} stroke="soft">
            <Text variant="small" accessibilityLiveRegion="polite">
              {t(notice.messageKey, { defaultValue: notice.message })}
            </Text>
          </Card>
        )}
      </ContentGroup>
      <Button label={t('authScreens.signIn')} onPress={navigate.signIn} />
      <Pressable
        accessibilityRole="link"
        style={styles.link}
        onPress={verification ? navigate.signUp : navigate.recover}
      >
        <Text variant="small" style={styles.accent}>
          {t(verification ? 'authScreens.backToSignUp' : 'authScreens.requestRecoveryEmail')}
        </Text>
      </Pressable>
      <Pressable accessibilityRole="link" style={styles.link} onPress={navigate.continueLearning}>
        <Text variant="small" muted>
          {continueLabel ?? t('authScreens.returnToLearning')}
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 18 },
  availability: { flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  flex: { flex: 1, minWidth: 0 },
  card: { gap: 12 },
  cardTitle: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mailTile: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: brandColors.surface,
  },
  link: { minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  accent: { color: brandColors.forest, textAlign: 'center' },
  error: { color: colors.danger },
});
