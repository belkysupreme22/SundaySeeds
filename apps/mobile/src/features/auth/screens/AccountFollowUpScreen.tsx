import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { AccountTopBar } from '../components/AccountTopBar';
import { AccountRecoveryHero } from '../components/AccountRecoveryHero';
import { Screen, ContentGroup } from '../../../shared/ui/Screen';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { Text } from '../../../shared/ui/Text';
import { colors } from '../../../shared/theme/tokens';
import { createAccountNavigation, type AccountNavigation } from '../navigation';

export function AccountFollowUpScreen({
  mode,
  navigation,
  continueLabel = 'Return to learning',
}: {
  mode: 'verify' | 'reset';
  navigation?: AccountNavigation;
  continueLabel?: string;
}) {
  const verification = mode === 'verify';
  const navigate =
    navigation ??
    createAccountNavigation(verification ? '/sign-up' : '/forgot-password', 'replace');
  const auth = useAuth();
  const [notice, setNotice] = useState<string | null>(null);
  async function check(resend = false) {
    const result = resend ? await auth.resendVerification() : await auth.checkVerification();
    setNotice(result.message);
  }
  return (
    <Screen backgroundColor="#F8F5FC" contentStyle={styles.screen}>
      <AccountTopBar
        label={verification ? 'Email verification' : 'Password reset'}
        onBack={navigate.back}
      />
      <AccountRecoveryHero mode={mode} />
      <ContentGroup>
        <Card shadow={false} stroke="soft" style={styles.card}>
          <Text variant="title">
            {verification ? 'Confirm your email' : 'Open your recovery email'}
          </Text>
          <Text variant="small">
            {!auth.configured
              ? 'Account setup is not configured yet. You can keep exploring the lessons.'
              : verification
                ? 'Open the confirmation link in your email, confirm it, then sign in here. An accepted request does not guarantee delivery; check spam or request another email.'
                : 'Use the latest password recovery link to choose a new password. After changing it, return here and sign in.'}
          </Text>
        </Card>
        {verification && (
          <>
            <Button
              label="Check verification"
              disabled={auth.busy || !auth.hydrated}
              onPress={() => void check()}
            />
            <Button
              label="Resend verification email"
              variant="outline"
              disabled={auth.busy || !auth.hydrated}
              onPress={() => void check(true)}
            />
          </>
        )}
        {notice && (
          <Card tone="lavender" shadow={false} stroke="soft">
            <Text variant="small" accessibilityLiveRegion="polite">
              {notice}
            </Text>
          </Card>
        )}
      </ContentGroup>
      <Button label="Sign in" onPress={navigate.signIn} />
      <Pressable
        accessibilityRole="link"
        style={styles.link}
        onPress={verification ? navigate.signUp : navigate.recover}
      >
        <Text variant="small" style={styles.accent}>
          {verification ? 'Back to sign up' : 'Request a recovery email'}
        </Text>
      </Pressable>
      <Pressable accessibilityRole="link" style={styles.link} onPress={navigate.continueLearning}>
        <Text variant="small" muted>
          {continueLabel}
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
    backgroundColor: colors.lavender,
  },
  link: { minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  accent: { color: '#75619D', textAlign: 'center' },
  error: { color: colors.danger },
});
