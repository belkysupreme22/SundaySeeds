import { useCallback, useEffect, useRef, useState } from 'react';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { BackHandler, StyleSheet, View } from 'react-native';
import { useAuth } from '../../auth/hooks/useAuth';
import { useLearningProfile } from '../hooks/useLearningProfile';
import { emptyLearningPreferences, type LearningPreferencesDraft } from '../types';
import { LearningProfileQuestion } from '../components/LearningProfileQuestion';
import { CourseSuggestions } from '../components/CourseSuggestions';
import { LearningPreferencesSummary } from '../components/LearningPreferencesSummary';
import { Screen } from '../../../shared/ui/Screen';
import { Button, IconButton } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { Text } from '../../../shared/ui/Text';
import { colors } from '../../../shared/theme/tokens';
import { LoadingState } from '../../../shared/ui/LoadingState';

export function LearningProfileScreen() {
  const { user } = useAuth();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  return (
    <LearningProfileForm
      key={`${user?.id ?? 'guest'}:${mode ?? 'setup'}`}
      editing={mode === 'edit'}
    />
  );
}

function LearningProfileForm({ editing }: { editing: boolean }) {
  const { user, hydrated } = useAuth();
  const profile = useLearningProfile();
  const [draft, setDraft] = useState<LearningPreferencesDraft | null>(null);
  const [step, setStep] = useState(0);
  const [flexible, setFlexible] = useState(false);
  const [result, setResult] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const focus = useRef({ active: false, generation: 0 });
  const pending = useRef(false);

  useFocusEffect(
    useCallback(() => {
      focus.current.active = true;
      focus.current.generation += 1;
      return () => {
        focus.current.active = false;
        focus.current.generation += 1;
      };
    }, []),
  );

  useEffect(() => {
    if (draft !== null || !profile.loaded || profile.error || !profile.eligible) return;
    const saved = profile.preferences;
    setDraft(
      saved
        ? {
            intention: saved.intention,
            interests: [...saved.interests],
            familiarity: saved.familiarity,
            sessionMinutes: saved.sessionMinutes,
          }
        : { ...emptyLearningPreferences, interests: [] },
    );
  }, [draft, profile.loaded, profile.error, profile.eligible, profile.preferences]);

  function exit() {
    // Invalidate in-flight screen actions before navigation, including rapid exit/re-entry.
    focus.current.generation += 1;
    profile.continueForNow();
    router.replace(editing ? '/settings' : '/home');
  }

  function skip() {
    // Durable dismissal is best-effort; a slow connection must never hold the exit.
    if (!editing && !pending.current && !profile.busy) void profile.dismiss();
    exit();
  }

  function back() {
    focus.current.generation += 1;
    if (result) {
      setResult(false);
      setStep(3);
    } else if (step > 0) setStep((previous) => previous - 1);
    else if (editing) exit();
    else skip();
  }

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        back();
        return true;
      });
      return () => subscription.remove();
    }),
  );

  async function save() {
    if (!draft || pending.current || profile.busy || profile.conflict || !profile.loaded) return;
    const generation = focus.current.generation;
    pending.current = true;
    setSaving(true);
    setMessage(null);
    try {
      const response = await profile.save(draft);
      if (!focus.current.active || focus.current.generation !== generation) return;
      if (response.ok) setResult(true);
      else setMessage(response.message);
    } finally {
      pending.current = false;
      setSaving(false);
    }
  }

  async function reload() {
    if (pending.current || profile.busy) return;
    const generation = focus.current.generation;
    pending.current = true;
    setMessage(null);
    try {
      await profile.retry();
      if (focus.current.active && focus.current.generation === generation && draft) {
        setMessage(
          'Reload requested. Your answers here have been kept. Save again once the saved profile has loaded.',
        );
      }
    } finally {
      pending.current = false;
    }
  }

  if (!hydrated || !profile.eligible || draft === null) {
    const unavailable = hydrated && (!user || !user.verified);
    return (
      <Screen>
        <Text variant="heading" accessibilityRole="header">
          Your learning profile
        </Text>
        <Card tone={profile.error || unavailable ? 'peach' : 'lavender'} shadow={false}>
          {profile.error || unavailable ? (
            <Text accessibilityLiveRegion="polite">
              {unavailable
                ? user
                  ? 'Verify your email before setting up account learning preferences.'
                  : 'Sign in to save your learning preferences.'
                : profile.error}
            </Text>
          ) : (
            <LoadingState label="Opening your learning profile…" />
          )}
        </Card>
        {profile.error && (
          <Button
            label="Try again"
            icon="refresh-cw"
            disabled={profile.busy}
            onPress={() => void reload()}
          />
        )}
        {unavailable && (
          <Button
            label={user ? 'Verify email' : 'Sign in'}
            onPress={() => router.replace(user ? '/verify-email' : '/sign-in')}
          />
        )}
        <Button
          label={editing ? 'Back to Settings' : 'Continue without setup'}
          variant="outline"
          onPress={exit}
        />
      </Screen>
    );
  }

  if (result)
    return (
      <Screen footer={<Button label="Go to Home" onPress={() => router.replace('/home')} />}>
        <View style={styles.top}>
          <IconButton name="arrow-left" label="Back to preferences" onPress={back} />
          <View style={styles.badge}>
            <Text variant="caption">Preferences saved</Text>
          </View>
        </View>
        <LearningPreferencesSummary preferences={profile.preferences ?? draft} />
        <CourseSuggestions
          preferences={profile.preferences ?? draft}
          onViewCourse={() => router.replace('/lessons/course')}
          onBrowse={() => router.replace('/courses')}
        />
        <Button
          label="Edit preferences"
          variant="outline"
          icon="edit-2"
          onPress={() => {
            setResult(false);
            setStep(0);
          }}
        />
      </Screen>
    );

  return (
    <Screen
      footer={
        <View style={styles.footer}>
          <Button
            loading={profile.busy && saving && step === 3}
            label={
              profile.busy
                ? 'Saving…'
                : step < 3
                  ? 'Continue'
                  : editing
                    ? 'Save preferences'
                    : 'Save & see courses'
            }
            disabled={profile.busy || !profile.loaded || profile.conflict}
            onPress={() => {
              if (step < 3) setStep(step + 1);
              else void save();
            }}
          />
          <Button
            label={
              profile.busy
                ? editing
                  ? 'Return to Settings'
                  : 'Continue to Home'
                : editing
                  ? 'Cancel'
                  : 'Skip for now'
            }
            variant="outline"
            icon={false}
            onPress={() => void skip()}
          />
          {profile.busy && (
            <Text variant="caption" muted>
              Leaving this page does not cancel a save already in progress.
            </Text>
          )}
        </View>
      }
    >
      <View style={styles.top}>
        <IconButton
          name="arrow-left"
          label={
            step
              ? 'Previous question'
              : editing
                ? profile.busy
                  ? 'Back to Settings'
                  : 'Cancel editing'
                : 'Skip setup'
          }
          onPress={back}
        />
        <View style={styles.badge}>
          <Text variant="caption">Step {step + 1} of 4</Text>
        </View>
      </View>
      <View
        style={styles.progress}
        accessibilityRole="progressbar"
        accessibilityLabel="Learning profile questions"
        accessibilityValue={{ min: 1, max: 4, now: step + 1 }}
      >
        {[0, 1, 2, 3].map((index) => (
          <View key={index} style={[styles.segment, index <= step && styles.filled]} />
        ))}
      </View>
      <LearningProfileQuestion
        step={step}
        draft={draft}
        flexible={flexible}
        disabled={profile.busy}
        onChange={(next) => {
          setDraft(next);
          setMessage(null);
        }}
        onFlexible={setFlexible}
      />
      {(profile.error || message || profile.conflict) && (
        <Card tone="peach" shadow={false} style={styles.feedback}>
          <Text accessibilityRole="alert">
            {profile.error ??
              message ??
              'Your saved preferences changed elsewhere. Reload before saving these answers.'}
          </Text>
          {profile.conflict && (
            <Text variant="small">
              Reload keeps your draft here. Saving afterwards replaces the saved preferences with
              these answers.
            </Text>
          )}
          <Button
            label="Reload saved preferences"
            icon="refresh-cw"
            variant="outline"
            disabled={profile.busy}
            onPress={() => void reload()}
          />
          <Button label="Continue without setup" variant="outline" onPress={exit} />
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  badge: {
    backgroundColor: colors.lavender,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  progress: { flexDirection: 'row', gap: 5, marginTop: -10 },
  segment: {
    flex: 1,
    height: 6,
    borderWidth: 0.7,
    borderColor: colors.outline,
    borderRadius: 3,
    backgroundColor: colors.soft,
  },
  filled: { backgroundColor: colors.primary, borderColor: colors.muted },
  footer: { gap: 12 },
  feedback: { gap: 12 },
});
