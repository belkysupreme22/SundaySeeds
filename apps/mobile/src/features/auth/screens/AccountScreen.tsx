import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
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
  const auth = useAuth();
  const mounted = useRef(true);
  const request = useRef(0);
  useFocusEffect(
    useCallback(() => {
      mounted.current = true;
      return () => {
        mounted.current = false;
        ++request.current;
      };
    }, []),
  );
  const signup = mode === 'sign-up';
  const recovery = mode === 'recovery';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [policy, setPolicy] = useState(false);
  const errors: Errors = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    errors.email = 'Enter a valid email address.';
  if (!recovery && !password) errors.password = 'Enter your password.';
  if (signup && password.length < 15)
    errors.password = 'Use at least 15 characters. Spaces are welcome.';
  if (signup && (!confirmation || confirmation !== password))
    errors.confirmation = 'Both passwords must match.';
  async function submit() {
    setSubmitted(true);
    setNotice(null);
    if (Object.keys(errors).length || auth.busy || !auth.hydrated) return;
    Keyboard.dismiss();
    setSubmitting(true);
    const version = ++request.current;
    const result = recovery
      ? await auth.requestRecovery(email.trim())
      : signup
        ? await auth.signUp(email.trim(), password, name)
        : await auth.signIn(email.trim(), password);
    setSubmitting(false);
    if (!mounted.current || request.current !== version) return;
    setNotice(result.message);
    if (result.ok) {
      setPassword('');
      setConfirmation('');
      if (signup) navigate.verify();
      else if (!recovery) navigate.continueLearning();
    }
  }
  function edit() {
    setNotice(null);
  }
  return (
    <Screen
      contentStyle={styles.screenContent}
      backgroundColor="#F8F5FC"
      loadingMessage={
        submitting && auth.busy
          ? recovery
            ? 'Sending your recovery request…'
            : signup
              ? 'Creating your account…'
              : 'Signing you in…'
          : undefined
      }
    >
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
                  The Terms of Service and Privacy Policy are not published yet. They must be
                  approved before a public launch.
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
          loading={auth.busy}
          disabled={auth.busy || !auth.hydrated}
          onPress={() => void submit()}
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
            <Text variant="small">{notice}</Text>
            {auth.pendingEmail && !recovery && (
              <Button
                label="Email verification options"
                variant="outline"
                onPress={navigate.verify}
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
        {auth.configured
          ? 'An account is optional. You can keep exploring the sample lessons.'
          : 'Account setup is not configured yet. You can still explore the lessons.'}
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
