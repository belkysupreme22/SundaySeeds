import { useState } from 'react';
import { router } from 'expo-router';
import { Image, Keyboard, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { PasswordField } from '../components/PasswordField';
import { Screen, ContentGroup } from '../../../shared/ui/Screen';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { InputField } from '../../../shared/ui/InputField';
import { Text } from '../../../shared/ui/Text';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { colors } from '../../../shared/theme/tokens';

type Mode = 'sign-in' | 'sign-up' | 'recovery';
type Errors = { email?: string; password?: string; confirmation?: string };
const portraits = {
  'sign-in': require('../../../../assets/legacy/auth_login_user.png'),
  'sign-up': require('../../../../assets/legacy/auth_signup_user.png'),
  recovery: require('../../../../assets/legacy/auth_login_user.png'),
};
export function AccountScreen({ mode }: { mode: Mode }) {
  const signup = mode === 'sign-up';
  const recovery = mode === 'recovery';
  const title = recovery ? 'Forgot password?' : signup ? 'Create account' : 'Welcome back';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [notice, setNotice] = useState(false);
  const [policy, setPolicy] = useState(false);
  const { width, fontScale } = useWindowDimensions();
  const stacked = width < 360 || fontScale > 1.2;
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
    <Screen>
      <PageHeader title={recovery ? 'Account recovery' : signup ? 'Sign up' : 'Sign in'} back />
      <View style={[styles.hero, stacked && styles.stacked]}>
        <View style={styles.heroCopy}>
          <Text variant="heading">{title}</Text>
          <Text variant="small">
            {recovery
              ? 'Find your way back to learning.'
              : signup
                ? 'A little faith. A fresh beginning.'
                : 'Make room for a little learning today.'}
          </Text>
        </View>
        <Image
          source={portraits[mode]}
          style={styles.portrait}
          resizeMode="contain"
          accessible={false}
        />
      </View>
      <Card tone="yellow" shadow={false} stroke="soft" style={styles.group}>
        <Text variant="label">Account services are not connected yet</Text>
        <Text variant="small">
          No account is created, no sign-in occurs and no recovery email is sent.
        </Text>
      </Card>
      <ContentGroup>
        {signup && (
          <ContentGroup>
            <Text variant="label">Display name (optional)</Text>
            <InputField
              icon="user"
              accessibilityLabel="Display name, optional"
              placeholder="What should we call you?"
              value={name}
              onChangeText={setName}
              maxLength={40}
              autoComplete="nickname"
            />
          </ContentGroup>
        )}
        <ContentGroup>
          <Text variant="label">Email address</Text>
          <InputField
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
            <Text variant="label">Password</Text>
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
            <Text variant="label">Confirm password</Text>
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
            style={styles.link}
            onPress={() => router.push('/forgot-password')}
          >
            <Text variant="small">Forgot password?</Text>
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
                ? 'No email has been sent. Recovery and email verification still need to be configured.'
                : 'Your fields are ready for this screen preview. Nothing has been submitted or saved to an account.'}
            </Text>
          </Card>
        )}
      </ContentGroup>
      <Button
        label={
          signup
            ? 'Already have an account? Sign in'
            : recovery
              ? 'Back to sign in'
              : 'New here? Create account'
        }
        variant="outline"
        icon={false}
        onPress={() => router.replace(signup || recovery ? '/sign-in' : '/sign-up')}
      />
      <Button
        label="Return to learning"
        variant="outline"
        icon="book-open"
        onPress={() => router.replace('/')}
      />
    </Screen>
  );
}
const styles = StyleSheet.create({
  group: { gap: 10 },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: colors.lavender,
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 8,
    overflow: 'hidden',
  },
  heroCopy: { flex: 1, gap: 8, paddingBottom: 16 },
  portrait: { width: 130, height: 160 },
  stacked: { flexDirection: 'column', alignItems: 'flex-start' },
  link: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start', paddingVertical: 8 },
  error: { color: colors.danger },
});
