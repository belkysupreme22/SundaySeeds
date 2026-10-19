import { useCallback, useState } from 'react';
import { BackHandler } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { AccountScreen } from '../../auth/screens/AccountScreen';
import { AccountFollowUpScreen } from '../../auth/screens/AccountFollowUpScreen';
import type { AccountNavigation } from '../../auth/navigation';
import { useLearnerProfile } from '../../profile/hooks/useLearnerProfile';
import { welcomeSlides } from '../data/welcomeSlides';
import { AccountChoiceScreen } from './AccountChoiceScreen';
import { MinimalSetupScreen } from './MinimalSetupScreen';
import { WelcomeScreen } from './WelcomeScreen';

type Step =
  'introduction' | 'account' | 'sign-in' | 'sign-up' | 'recovery' | 'verify' | 'reset' | 'setup';

const previousStep: Record<Exclude<Step, 'introduction'>, Step> = {
  account: 'introduction',
  'sign-in': 'account',
  'sign-up': 'account',
  recovery: 'sign-in',
  verify: 'sign-up',
  reset: 'recovery',
  setup: 'account',
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
  const [step, setStep] = useState<Step>('introduction');
  const [introductionPage, setIntroductionPage] = useState(0);
  const { saving: savingName } = useLearnerProfile();
  const back = useCallback(() => {
    if (saving || savingName || step === 'introduction') return;
    if (step === 'account') setIntroductionPage(welcomeSlides.length - 1);
    setStep(previousStep[step]);
  }, [saving, savingName, step]);

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
    verify: () => setStep('verify'),
    reset: () => setStep('reset'),
    continueLearning: skipAccount,
  };

  if (step === 'sign-in' || step === 'sign-up' || step === 'recovery') {
    return (
      <AccountScreen key={step} mode={step} navigation={navigation} continueLabel="Skip for now" />
    );
  }
  if (step === 'verify' || step === 'reset') {
    return (
      <AccountFollowUpScreen
        key={step}
        mode={step}
        navigation={navigation}
        continueLabel="Skip for now"
      />
    );
  }
  if (step === 'setup') {
    return (
      <MinimalSetupScreen
        finishing={saving}
        finishError={error}
        onFinish={onFinish}
        onContinueForNow={onContinueForNow}
        onBack={back}
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
        onSetupName={() => setStep('setup')}
        onContinueForNow={onContinueForNow}
      />
    );
  }
  return (
    <WelcomeScreen
      saving={saving}
      error={error}
      initialIndex={introductionPage}
      onFinish={() => setStep('account')}
      onSkip={() => void onFinish()}
      onContinueForNow={onContinueForNow}
    />
  );
}
