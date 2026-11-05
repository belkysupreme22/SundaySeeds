import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { Keyboard, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
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
import { brandColors, colors } from '../../../shared/theme/tokens';
import { createAccountNavigation, type AccountNavigation } from '../navigation';
import type { LocalizedAuthResult } from '../types';

type Mode = 'sign-in' | 'sign-up' | 'recovery';
type Errors = { email?: string; password?: string; confirmation?: string };
export function AccountScreen({
  mode,
  navigation,
  continueLabel,
}: {
  mode: Mode;
  navigation?: AccountNavigation;
  continueLabel?: string;
}) {
  const { t } = useTranslation();
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
  const [notice, setNotice] = useState<LocalizedAuthResult | null>(null);
  const [policy, setPolicy] = useState(false);
  const errors: Errors = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    errors.email = t('authScreens.invalidEmail');
  if (!recovery && !password) errors.password = t('authScreens.requiredPassword');
  if (signup && password.length < 15) errors.password = t('authScreens.passwordLength');
  if (signup && (!confirmation || confirmation !== password))
    errors.confirmation = t('authScreens.passwordsMustMatch');
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
    setNotice(result);
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
      backgroundColor={brandColors.canvas}
      loadingMessage={
        submitting && auth.busy
          ? recovery
            ? t('authScreens.pending.recovery')
            : signup
              ? t('authScreens.pending.signUp')
              : t('authScreens.pending.signIn')
          : undefined
      }
    >
      <AccountTopBar
        label={t(
          recovery
            ? 'authScreens.accountRecovery'
            : signup
              ? 'authScreens.createAccount'
              : 'authScreens.welcomeBack',
        )}
        onBack={navigate.back}
      />
      {recovery ? <AccountRecoveryHero mode="request" /> : <AccountHero mode={mode} />}
      <ContentGroup>
        {signup && (
          <ContentGroup>
            <InputField
              appearance="account"
              label={t('authScreens.displayName')}
              icon="user"
              accessibilityLabel={t('authScreens.displayName')}
              placeholder={t('authScreens.displayNamePlaceholder')}
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
            label={t('authScreens.emailAddress')}
            icon="mail"
            accessibilityLabel={t('authScreens.emailAddress')}
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
              label={t('authScreens.password')}
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
              label={t('authScreens.confirmPassword')}
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
              <Text variant="small">{t('authScreens.termsAndPrivacy')}</Text>
            </Pressable>
            {policy && (
              <Card shadow={false} stroke="soft">
                <Text variant="small">{t('authScreens.policyNotice')}</Text>
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
              {t('authScreens.forgotPassword')}
            </Text>
          </Pressable>
        )}
        <Button
          label={t(
            recovery
              ? 'authScreens.requestPasswordReset'
              : signup
                ? 'authScreens.createAccount'
                : 'authScreens.signIn',
          )}
          loading={auth.busy}
          disabled={auth.busy || !auth.hydrated}
          onPress={() => void submit()}
        />
        {submitted && Object.keys(errors).length > 0 && (
          <Text variant="small" accessibilityLiveRegion="polite" style={styles.error}>
            {t('authScreens.checkFields')}
          </Text>
        )}
        {notice && (
          <Card
            shadow={false}
            stroke="soft"
            style={styles.group}
            accessibilityLiveRegion="polite"
          >
            <Text variant="small">{t(notice.messageKey, { defaultValue: notice.message })}</Text>
            {auth.pendingEmail && !recovery && (
              <Button
                label={t('authScreens.verificationOptions')}
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
          {!recovery && `${t(signup ? 'authScreens.existingAccount' : 'authScreens.newAccount')} `}
          <Text variant="small" style={styles.accent}>
            {t(
              signup
                ? 'authScreens.signIn'
                : recovery
                  ? 'authScreens.backToSignIn'
                  : 'authScreens.signUp',
            )}
          </Text>
        </Text>
      </Pressable>
      <Text variant="caption" muted style={styles.center}>
        {t(auth.configured ? 'authScreens.accountOptional' : 'authScreens.accountUnavailable')}
      </Text>
      <Pressable
        accessibilityRole="link"
        style={styles.switchLink}
        onPress={navigate.continueLearning}
      >
        <Text variant="small" muted>
          {continueLabel ?? t('authScreens.returnToLearning')}
        </Text>
      </Pressable>
    </Screen>
  );
}
const styles = StyleSheet.create({
  screenContent: { gap: 14 },
  forgot: { alignSelf: 'flex-end' },
  accent: { color: brandColors.forest },
  switchLink: { minHeight: 44, justifyContent: 'center', alignItems: 'center', paddingVertical: 8 },
  center: { textAlign: 'center' },
  group: { gap: 10 },
  link: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start', paddingVertical: 8 },
  error: { color: colors.danger },
});
