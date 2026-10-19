import { useState } from 'react';
import { Keyboard, Pressable, StyleSheet } from 'react-native';
import { PasswordField } from '../components/PasswordField';
import { AccountHero } from '../components/AccountHero';
import { AccountProviders } from '../components/AccountProviders';
import { AccountTopBar } from '../components/AccountTopBar';
import { AccountRecoveryHero } from '../components/AccountRecoveryHero';
import { Screen, ContentGroup } from '../../../shared/ui/Screen';
import { InputField } from '../../../shared/ui/InputField';
import { Text } from '../../../shared/ui/Text';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { colors } from '../../../shared/theme/tokens';
import { createAccountNavigation, type AccountNavigation } from '../navigation';

type Mode = 'sign-in' | 'sign-up' | 'recovery';
type Errors = { email?: string; password?: string; confirmation?: string };
export function AccountScreen({
  mode,
  navigation,
  continueLabel = 'Return to learning',
}: {
  mode: Mode;
  navigation?: AccountNavigation;
  continueLabel?: string;
}) {
  const navigate = navigation ?? createAccountNavigation('/settings');
  const signup = mode === 'sign-up';
  const recovery = mode === 'recovery';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [notice, setNotice] = useState(false);
  const [policy, setPolicy] = useState(false);
  const errors: Errors = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    errors.email = 'Enter a valid email address.';
  if (!recovery && !password) errors.password = 'Enter your password.';
  if (signup && (!confirmation || confirmation !== password))
    errors.confirmation = 'Both passwords must match.';
  function submit() {
    setSubmitted(true);
    setNotice(false);
    if (Object.keys(errors).length) return;
    Keyboard.dismiss();
    setNotice(true);
  }
  function edit() {
    setNotice(false);
  }
  return (
    <Screen contentStyle={styles.screenContent} backgroundColor="#F8F5FC">
      <AccountTopBar
        label={recovery ? 'Account recovery' : signup ? 'Create account' : 'Welcome back'}
        onBack={navigate.back}
      />
      {recovery ? <AccountRecoveryHero mode="request" /> : <AccountHero mode={mode} />}
      <ContentGroup>
        {signup && (
          <ContentGroup>
            <InputField
              appearance="account"
              label="Display name (optional)"
              icon="user"
              accessibilityLabel="Display name, optional"
              placeholder="What should we call you?"
              value={name}
              onChangeText={(value) => {
                setName(value);
                edit();
              }}
              maxLength={40}
              autoComplete="nickname"
            />
          </ContentGroup>
        )}
        <ContentGroup>
          <InputField
            appearance="account"
            label="Email address"
            icon="mail"
            accessibilityLabel="Email address"
            placeholder="you@example.com"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              edit();
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
          />
          {submitted && errors.email && (
            <Text variant="small" accessibilityLiveRegion="polite" style={styles.error}>
              {errors.email}
            </Text>
          )}
        </ContentGroup>
        {!recovery && (
          <ContentGroup>
            <PasswordField
              label="Password"
              value={password}
              newPassword={signup}
              onChangeText={(value) => {
                setPassword(value);
                edit();
              }}
            />
            {submitted && errors.password && (
              <Text variant="small" accessibilityLiveRegion="polite" style={styles.error}>
                {errors.password}
              </Text>
            )}
          </ContentGroup>
        )}
        {signup && (
          <ContentGroup>
            <PasswordField
              label="Confirm password"
              value={confirmation}
              newPassword
              onChangeText={(value) => {
                setConfirmation(value);
                edit();
              }}
            />
            {submitted && errors.confirmation && (
              <Text variant="small" accessibilityLiveRegion="polite" style={styles.error}>
                {errors.confirmation}
              </Text>
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: policy }}
              style={styles.link}
              onPress={() => setPolicy(!policy)}
            >
              <Text variant="small">Terms & privacy information</Text>
            </Pressable>
            {policy && (
              <Card shadow={false} stroke="soft">
                <Text variant="small">
                  The Terms of Service and Privacy Policy are not published yet. Account
                  registration will need the approved documents before it becomes available.
                </Text>
              </Card>
            )}
          </ContentGroup>
        )}
        {!signup && !recovery && (
          <Pressable
            accessibilityRole="link"
            style={[styles.link, styles.forgot]}
            onPress={navigate.recover}
          >
            <Text variant="small" style={styles.accent}>
              Forgot password?
            </Text>
          </Pressable>
        )}
        <Button
          label={recovery ? 'Request password reset' : signup ? 'Create account' : 'Sign in'}
          onPress={submit}
        />
        {submitted && Object.keys(errors).length > 0 && (
          <Text variant="small" accessibilityLiveRegion="polite" style={styles.error}>
            Check the fields above to continue.
          </Text>
        )}
        {notice && (
          <Card
            tone="lavender"
            shadow={false}
            stroke="soft"
            style={styles.group}
            accessibilityLiveRegion="polite"
          >
            <Text variant="label">
              {recovery
                ? 'Recovery is not available yet'
                : signup
                  ? 'Registration is not available yet'
                  : 'Sign-in is not available yet'}
            </Text>
            <Text variant="small">
              {recovery
                ? 'No email has been sent. You can return to your lessons while recovery is unavailable.'
                : 'Your details have not been submitted or saved. You can continue learning without an account.'}
            </Text>
            {(signup || recovery) && (
              <Button
                label={signup ? 'Preview email verification' : 'Preview password reset'}
                variant="outline"
                onPress={signup ? navigate.verify : navigate.reset}
              />
            )}
          </Card>
        )}
      </ContentGroup>
      {!recovery && <AccountProviders />}
      <Pressable
        accessibilityRole="link"
        style={styles.switchLink}
        onPress={signup || recovery ? navigate.signIn : navigate.signUp}
      >
        <Text variant="small" style={styles.center}>
          {signup ? 'Already have an account? ' : recovery ? '' : 'Don’t have an account? '}
          <Text variant="small" style={styles.accent}>
            {signup ? 'Sign in' : recovery ? 'Back to sign in' : 'Sign up'}
          </Text>
        </Text>
      </Pressable>
      <Text variant="caption" muted style={styles.center}>
        Account services are not available yet. You can still explore the lessons.
      </Text>
      <Pressable
        accessibilityRole="link"
        style={styles.switchLink}
        onPress={navigate.continueLearning}
      >
        <Text variant="small" muted>
          {continueLabel}
        </Text>
      </Pressable>
    </Screen>
  );
}
const styles = StyleSheet.create({
  screenContent: { gap: 14 },
  forgot: { alignSelf: 'flex-end' },
  accent: { color: '#75619D' },
  switchLink: { minHeight: 44, justifyContent: 'center', alignItems: 'center', paddingVertical: 8 },
  center: { textAlign: 'center' },
  group: { gap: 10 },
  link: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start', paddingVertical: 8 },
  error: { color: colors.danger },
});
