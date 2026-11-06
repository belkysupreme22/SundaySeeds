import { useCallback, useState } from 'react';
import { BackHandler } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AccountScreen } from '../../auth/screens/AccountScreen';
import { AccountFollowUpScreen } from '../../auth/screens/AccountFollowUpScreen';
import type { AccountNavigation } from '../../auth/navigation';
import { useAuth } from '../../auth/hooks/useAuth';
import { welcomeSlides } from '../data/welcomeSlides';
import { AccountChoiceScreen } from './AccountChoiceScreen';
import { WelcomeScreen } from './WelcomeScreen';

type Step =
  | 'introduction'
  | 'account'
  | 'sign-in'
  | 'sign-up'
  | 'recovery'
  | 'verify-from-sign-in'
  | 'verify-from-sign-up'
  | 'reset';

const previousStep: Record<Exclude<Step, 'introduction'>, Step> = {
  account: 'introduction',
  'sign-in': 'account',
  'sign-up': 'account',
  recovery: 'sign-in',
  'verify-from-sign-in': 'sign-in',
  'verify-from-sign-up': 'sign-up',
  reset: 'recovery',
};

// First launch and Settings replay share the same optional steps.
// Only the host decides when to save the welcome preference and leave the flow.
export function WelcomeFlow({
  saving,
  error,
  onFinish,
  onContinueForNow,
}: {
  saving: boolean;
  error: string | null;
  onFinish: () => Promise<boolean>;
  onContinueForNow: () => void;
}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('introduction');
  const [introductionPage, setIntroductionPage] = useState(0);
  const back = useCallback(() => {
    if (saving || step === 'introduction') return;
    if (step === 'account') setIntroductionPage(welcomeSlides.length - 1);
    setStep(previousStep[step]);
  }, [saving, step]);

  useFocusEffect(
    useCallback(() => {
      if (step === 'introduction') return;
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        back();
        return true;
      });
      return () => subscription.remove();
    }, [step, back]),
  );

  function skipAccount() {
    // Show welcome-save recovery on account choice if persistence fails.
    setStep('account');
    void onFinish();
  }

  const navigation: AccountNavigation = {
    back,
    signIn: () => setStep('sign-in'),
    signUp: () => setStep('sign-up'),
    recover: () => setStep('recovery'),
    verify: () => setStep(step === 'sign-in' ? 'verify-from-sign-in' : 'verify-from-sign-up'),
    reset: () => setStep('reset'),
    continueLearning: skipAccount,
  };

  if (step === 'sign-in' || step === 'sign-up' || step === 'recovery') {
    return (
      <AccountScreen
        key={step}
        mode={step}
        navigation={navigation}
        continueLabel={t('authScreens.skipForNow')}
      />
    );
  }
  if (step === 'verify-from-sign-in' || step === 'verify-from-sign-up' || step === 'reset') {
    return (
      <AccountFollowUpScreen
        key={step}
        mode={step === 'reset' ? 'reset' : 'verify'}
        navigation={navigation}
        continueLabel={t('authScreens.skipForNow')}
      />
    );
  }
  if (step === 'account') {
    return (
      <AccountChoiceScreen
        saving={saving}
        error={error}
        onBack={back}
        onSignUp={navigation.signUp}
        onSignIn={navigation.signIn}
        onSkip={skipAccount}
        onContinueForNow={onContinueForNow}
      />
    );
  }
  return (
    <WelcomeScreen
      saving={saving}
      error={error}
      initialIndex={introductionPage}
      onFinish={() => {
        if (user) void onFinish();
        else setStep('account');
      }}
      onSkip={() => void onFinish()}
      onContinueForNow={onContinueForNow}
    />
  );
}
