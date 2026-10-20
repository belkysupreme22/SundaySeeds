import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { colors } from '../../../shared/theme/tokens';
import { Icon } from '../../../shared/ui/Icon';
import { Text } from '../../../shared/ui/Text';
import type { LearningChoice } from '../data/questions';

export function LearningChoiceCards<Value extends string | number>({
  choices,
  selected,
  onSelect,
  multiple = false,
  disabled = false,
}: {
  choices: LearningChoice<Value>[];
  selected: Value[];
  onSelect: (value: Value) => void;
  multiple?: boolean;
  disabled?: boolean;
}) {
  const { width, fontScale } = useWindowDimensions();
  const columns = width >= 370 && fontScale < 1.4;
  return (
    <View style={styles.grid}>
      {choices.map((choice) => {
        const checked = selected.includes(choice.value);
        const unavailable = disabled || (multiple && selected.length >= 3 && !checked);
        return (
          <Pressable
            key={choice.value}
            accessibilityRole="checkbox"
            accessibilityLabel={choice.label}
            accessibilityHint={checked ? 'Tap again to clear this answer.' : choice.description}
            accessibilityState={{ checked, disabled: unavailable }}
            disabled={unavailable}
            onPress={() => onSelect(choice.value)}
            style={({ pressed }) => [
              styles.card,
              columns && styles.column,
              { backgroundColor: colors[choice.tone] },
              checked && styles.selected,
              unavailable && styles.disabled,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.top}>
              <Icon name={choice.icon} size={25} />
              <View style={[styles.check, checked && styles.checked]}>
                {checked && <Icon name="check" color={colors.white} size={13} />}
              </View>
            </View>
            <Text variant="label">{choice.label}</Text>
            {choice.description && <Text variant="small">{choice.description}</Text>}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: '100%',
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: 9,
    padding: 14,
    gap: 7,
  },
  column: { width: '48%', flexGrow: 1, flexBasis: '45%' },
  selected: { borderColor: colors.ink, boxShadow: '1px 2px 0px #26212E' },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  check: {
    width: 19,
    height: 19,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.outline,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: { borderColor: colors.ink, backgroundColor: colors.ink },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.75 },
});
