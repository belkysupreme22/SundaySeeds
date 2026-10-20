import { StyleSheet, View } from 'react-native';
import { colors } from '../../../shared/theme/tokens';
import { Icon } from '../../../shared/ui/Icon';
import { Text } from '../../../shared/ui/Text';
import { LearningChoiceCards } from './LearningChoiceCards';
import {
  familiarities,
  intentions,
  interests,
  questionPages,
  sessionTimes,
} from '../data/questions';
import type { LearningPreferencesDraft } from '../types';

export function LearningProfileQuestion({
  step,
  draft,
  flexible,
  disabled,
  onChange,
  onFlexible,
}: {
  step: number;
  draft: LearningPreferencesDraft;
  flexible: boolean;
  disabled: boolean;
  onChange: (draft: LearningPreferencesDraft) => void;
  onFlexible: (value: boolean) => void;
}) {
  const page = questionPages[step];
  return (
    <>
      <View style={styles.hero}>
        <View style={[styles.symbol, { backgroundColor: colors[page.tone] }]}>
          <Icon name={page.icon} size={35} />
        </View>
        <Text variant="caption" style={styles.eyebrow}>
          YOUR LEARNING JOURNEY
        </Text>
        <Text variant="heading" accessibilityRole="header">
          {page.title}
        </Text>
        <Text muted>{page.subtitle}</Text>
      </View>
      {step === 0 && (
        <LearningChoiceCards
          choices={intentions}
          disabled={disabled}
          selected={draft.intention ? [draft.intention] : []}
          onSelect={(value) =>
            onChange({ ...draft, intention: draft.intention === value ? null : value })
          }
        />
      )}
      {step === 1 && (
        <>
          <Text variant="label" accessibilityLiveRegion="polite">
            {draft.interests.length} of 3 selected
          </Text>
          <LearningChoiceCards
            choices={interests}
            multiple
            disabled={disabled}
            selected={draft.interests}
            onSelect={(value) =>
              onChange({
                ...draft,
                interests: draft.interests.includes(value)
                  ? draft.interests.filter((interest) => interest !== value)
                  : [...draft.interests, value].slice(0, 3),
              })
            }
          />
        </>
      )}
      {step === 2 && (
        <LearningChoiceCards
          choices={familiarities}
          disabled={disabled}
          selected={draft.familiarity ? [draft.familiarity] : []}
          onSelect={(value) =>
            onChange({ ...draft, familiarity: draft.familiarity === value ? null : value })
          }
        />
      )}
      {step === 3 && (
        <LearningChoiceCards
          choices={sessionTimes}
          disabled={disabled}
          selected={flexible ? ['flexible'] : draft.sessionMinutes ? [draft.sessionMinutes] : []}
          onSelect={(value) => {
            onFlexible(value === 'flexible' && !flexible);
            onChange({
              ...draft,
              sessionMinutes: value === 'flexible' || draft.sessionMinutes === value ? null : value,
            });
          }}
        />
      )}
      <Text variant="small" muted>
        {page.note}
      </Text>
      <Text variant="caption" muted>
        Every question is optional. Tap a selected answer to clear it. Edit later in Settings.
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  hero: { gap: 10 },
  symbol: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  eyebrow: { color: colors.muted, letterSpacing: 1.2, marginTop: 5 },
});
