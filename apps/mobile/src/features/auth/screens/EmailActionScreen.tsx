import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { AccountTopBar } from '../components/AccountTopBar';
import { AccountRecoveryHero } from '../components/AccountRecoveryHero';
import { PasswordField } from '../components/PasswordField';
import { useEmailProof } from '../hooks/useEmailProof';
import { Screen, ContentGroup } from '../../../shared/ui/Screen';
import { Text } from '../../../shared/ui/Text';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';

export function EmailActionScreen({
  kind,
  tokenHash,
  type,
}: {
  kind: 'confirmation' | 'recovery';
  tokenHash: unknown;
  type: unknown;
}) {
  const proof = useEmailProof(kind, tokenHash, type);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    if (proof.stage !== 'password') {
      setPassword('');
      setConfirmation('');
      setSubmitted(false);
    }
  }, [proof.stage]);
  const validPassword = password.length >= 15 && password === confirmation;
  async function reset() {
    setSubmitted(true);
    if (!validPassword) return;
    if (await proof.reset(password)) {
      setPassword('');
      setConfirmation('');
    }
  }
  return (
    <Screen backgroundColor="#F8F5FC">
      <AccountTopBar
        label={kind === 'confirmation' ? 'Confirm email' : 'Recover account'}
        onBack={() => router.replace('/sign-in')}
      />
      <AccountRecoveryHero mode={kind === 'confirmation' ? 'verify' : 'reset'} />
      {proof.stage === 'ready' && (
        <ContentGroup>
          <Text>
            Continue to {kind === 'confirmation' ? 'verify your email' : 'open password recovery'}.
            Your current signed-in account will be kept.
          </Text>
          <Button
            label={proof.busy ? 'Checking link…' : 'Continue with email link'}
            disabled={proof.busy}
            onPress={() => void proof.begin()}
          />
        </ContentGroup>
      )}
      {proof.stage === 'password' && (
        <ContentGroup>
          <Text variant="label">Reset password for {proof.email}</Text>
          <PasswordField
            label="New password"
            value={password}
            newPassword
            onChangeText={setPassword}
          />
          <PasswordField
            label="Confirm new password"
            value={confirmation}
            newPassword
            onChangeText={setConfirmation}
          />
          <Text variant="small">Use at least 15 characters. Spaces are welcome.</Text>
          {submitted && !validPassword && (
            <Text accessibilityRole="alert">
              Use at least 15 characters and match both passwords.
            </Text>
          )}
          <Button
            label={proof.busy ? 'Changing password…' : 'Reset password'}
            disabled={proof.busy}
            onPress={() => void reset()}
          />
        </ContentGroup>
      )}
      {proof.message && (
        <Card tone="lavender" shadow={false} stroke="soft">
          <Text accessibilityLiveRegion="polite">{proof.message}</Text>
        </Card>
      )}
      {proof.stage === 'invalid' && (
        <Button
          label="Request a new email"
          variant="outline"
          onPress={() => router.replace(kind === 'confirmation' ? '/sign-up' : '/forgot-password')}
        />
      )}
      <Button
        label="Return to sign in"
        variant="outline"
        onPress={() => router.replace('/sign-in')}
      />
    </Screen>
  );
}
