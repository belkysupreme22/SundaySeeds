import { Pressable, StyleSheet, View } from 'react-native';
import { colors } from '../../../shared/theme/tokens';
import { Icon } from '../../../shared/ui/Icon';
import { Text } from '../../../shared/ui/Text';

type QuizChoiceProps = {
  label: string;
  index: number;
  selected: boolean;
  checked: boolean;
  correct: boolean;
  onSelect: () => void;
};

export function QuizChoice({
  label,
  index,
  selected,
  checked,
  correct,
  onSelect,
}: QuizChoiceProps) {
  const revealedCorrect = checked && correct;
  const revealedIncorrect = checked && selected && !correct;
  const status = revealedCorrect
    ? selected
      ? 'Your answer · Correct'
      : 'Correct answer'
    : revealedIncorrect
      ? 'Your answer · Incorrect'
      : '';

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={`${label}${status ? `, ${status}` : ''}`}
      accessibilityState={{ checked: selected, disabled: checked }}
      disabled={checked}
      onPress={onSelect}
      style={({ pressed }) => [
        styles.option,
        selected && styles.selected,
        revealedCorrect && styles.correct,
        revealedIncorrect && styles.incorrect,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.letter, selected && styles.selectedLetter]}>
        <Text variant="label" style={selected && styles.selectedLetterText}>
          {String.fromCharCode(65 + index)}
        </Text>
      </View>
      <View style={styles.copy}>
        <Text>{label}</Text>
        {!!status && <Text variant="caption">{status}</Text>}
      </View>
      {(revealedCorrect || selected) && (
        <Icon
          name={revealedIncorrect ? 'x-circle' : 'check-circle'}
          size={18}
          color={revealedIncorrect ? colors.danger : revealedCorrect ? colors.success : colors.ink}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  option: {
    borderWidth: 1,
    borderColor: colors.outline,
    backgroundColor: colors.white,
    borderRadius: 9,
    padding: 12,
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selected: { backgroundColor: colors.lavender },
  correct: { backgroundColor: colors.mint },
  incorrect: { backgroundColor: colors.peach },
  pressed: { opacity: 0.8 },
  letter: {
    minWidth: 30,
    minHeight: 30,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  selectedLetter: { backgroundColor: colors.ink },
  selectedLetterText: { color: colors.white },
  copy: { flex: 1, gap: 4 },
});
