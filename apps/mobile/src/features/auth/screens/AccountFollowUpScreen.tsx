import { useState } from 'react';
import { Keyboard, Pressable, StyleSheet, View } from 'react-native';
import { AccountTopBar } from '../components/AccountTopBar';
import { AccountRecoveryHero } from '../components/AccountRecoveryHero';
import { PasswordField } from '../components/PasswordField';
import { Screen, ContentGroup } from '../../../shared/ui/Screen';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { Icon } from '../../../shared/ui/Icon';
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
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const passwordError = !password ? 'Enter a new password.' : undefined;
  const confirmationError =
    !confirmation || confirmation !== password ? 'Both passwords must match.' : undefined;

  function submitPassword() {
    setSubmitted(true);
    setNotice(null);
    if (passwordError || confirmationError) return;
    Keyboard.dismiss();
    setNotice('Password reset is not connected yet. Your password has not been changed or saved.');
  }

  return (
    <Screen backgroundColor="#F8F5FC" contentStyle={styles.screen}>
      <AccountTopBar
        label={verification ? 'Email verification' : 'Password reset'}
        onBack={navigate.back}
      />
      <AccountRecoveryHero mode={mode} />
      <View style={styles.availability}>
        <Icon name="info" size={17} color={colors.muted} />
        <Text variant="small" muted style={styles.flex}>
          {verification
            ? 'Email verification is not available yet. No verification email has been sent.'
            : 'Password reset is not available yet. Your password will not be changed.'}
        </Text>
      </View>
      {verification ? (
        <ContentGroup>
          <Card shadow={false} stroke="soft" style={styles.card}>
            <View style={styles.cardTitle}>
              <View style={styles.mailTile}>
                <Icon name="mail" size={22} />
              </View>
              <Text variant="title" style={styles.flex}>
                Email verification
              </Text>
            </View>
            <Text variant="small" muted>
              This is where you’ll check whether your account email has been verified and request
              another email if needed.
            </Text>
          </Card>
          <Button
            label="Check verification"
            onPress={() =>
              setNotice(
                'Verification status is unavailable until account services are connected. No verification check has been performed.',
              )
            }
          />
          <Pressable
            accessibilityRole="button"
            style={styles.link}
            onPress={() =>
              setNotice('Email delivery is not connected yet. No verification email has been sent.')
            }
          >
            <Text variant="small" style={styles.accent}>
              Resend verification email
            </Text>
          </Pressable>
        </ContentGroup>
      ) : (
        <ContentGroup>
          <ContentGroup>
            <PasswordField
              label="New password"
              value={password}
              newPassword
              onChangeText={(value) => {
                setPassword(value);
                setNotice(null);
              }}
            />
            {submitted && passwordError && (
              <Text variant="small" style={styles.error} accessibilityLiveRegion="polite">
                {passwordError}
              </Text>
            )}
          </ContentGroup>
          <ContentGroup>
            <PasswordField
              label="Confirm new password"
              value={confirmation}
              newPassword
              onChangeText={(value) => {
                setConfirmation(value);
                setNotice(null);
              }}
            />
            {submitted && confirmationError && (
              <Text variant="small" style={styles.error} accessibilityLiveRegion="polite">
                {confirmationError}
              </Text>
            )}
          </ContentGroup>
          <Button label="Reset password" onPress={submitPassword} />
        </ContentGroup>
      )}
      {notice && (
        <Card tone="lavender" shadow={false} stroke="soft" accessibilityLiveRegion="polite">
          <Text variant="small">{notice}</Text>
        </Card>
      )}
      <Pressable
        accessibilityRole="link"
        style={styles.link}
        onPress={verification ? navigate.signUp : navigate.recover}
      >
        <Text variant="small" style={styles.accent}>
          {verification ? 'Back to sign up' : 'Back to account recovery'}
        </Text>
      </Pressable>
      <Pressable accessibilityRole="link" style={styles.link} onPress={navigate.signIn}>
        <Text variant="small" muted>
          Back to sign in
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
