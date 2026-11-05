import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AccountTopBar } from '../components/AccountTopBar';
import { AccountRecoveryHero } from '../components/AccountRecoveryHero';
import { PasswordField } from '../components/PasswordField';
import { useEmailProof } from '../hooks/useEmailProof';
import { Screen, ContentGroup } from '../../../shared/ui/Screen';
import { Text } from '../../../shared/ui/Text';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { brandColors } from '../../../shared/theme/tokens';

export function EmailActionScreen({
  kind,
  tokenHash,
  type,
}: {
  kind: 'confirmation' | 'recovery';
  tokenHash: unknown;
  type: unknown;
}) {
  const { t } = useTranslation();
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
    <Screen
      backgroundColor={brandColors.canvas}
      loadingMessage={
        proof.busy
          ? proof.stage === 'password'
            ? t('authScreens.pending.passwordChange')
            : t('authScreens.pending.emailLink')
          : undefined
      }
    >
      <AccountTopBar
        label={t(
          kind === 'confirmation' ? 'authScreens.confirmEmailBadge' : 'authScreens.recoverAccount',
        )}
        onBack={() => router.replace('/sign-in')}
      />
      <AccountRecoveryHero mode={kind === 'confirmation' ? 'verify' : 'reset'} />
      {proof.stage === 'ready' && (
        <ContentGroup>
          <Text>
            {t(
              kind === 'confirmation'
                ? 'authScreens.continueConfirmation'
                : 'authScreens.continueRecovery',
            )}
          </Text>
          <Button
            label={t(
              proof.busy ? 'authScreens.pending.emailLink' : 'authScreens.continueEmailLink',
            )}
            loading={proof.busy}
            disabled={proof.busy}
            onPress={() => void proof.begin()}
          />
        </ContentGroup>
      )}
      {proof.stage === 'password' && (
        <ContentGroup>
          <Text variant="label">{t('authScreens.resetPasswordFor', { email: proof.email })}</Text>
          <PasswordField
            label={t('authScreens.newPassword')}
            value={password}
            newPassword
            onChangeText={setPassword}
          />
          <PasswordField
            label={t('authScreens.confirmNewPassword')}
            value={confirmation}
            newPassword
            onChangeText={setConfirmation}
          />
          <Text variant="small">{t('authScreens.passwordLength')}</Text>
          {submitted && !validPassword && (
            <Text accessibilityRole="alert">{t('authScreens.passwordRequirements')}</Text>
          )}
          <Button
            label={t(
              proof.busy ? 'authScreens.pending.passwordChange' : 'authScreens.resetPassword',
            )}
            loading={proof.busy}
            disabled={proof.busy}
            onPress={() => void reset()}
          />
        </ContentGroup>
      )}
      {proof.message && (
        <Card tone="lavender" shadow={false} stroke="soft">
          <Text accessibilityLiveRegion="polite">
            {proof.messageKey
              ? t(proof.messageKey, { defaultValue: proof.message })
              : proof.message}
            {proof.messageKey && proof.deviceMessageKey ? ` ${t(proof.deviceMessageKey)}` : null}
          </Text>
        </Card>
      )}
      {proof.stage === 'invalid' && (
        <Button
          label={t(
            kind === 'confirmation'
              ? 'authScreens.backToSignUp'
              : 'authScreens.requestRecoveryEmail',
          )}
          variant="outline"
          onPress={() => router.replace(kind === 'confirmation' ? '/sign-up' : '/forgot-password')}
        />
      )}
      <Button
        label={t('authScreens.returnToSignIn')}
        variant="outline"
        onPress={() => router.replace('/sign-in')}
      />
    </Screen>
  );
}
