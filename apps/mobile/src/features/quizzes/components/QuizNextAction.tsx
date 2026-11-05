import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { motion } from '../../../shared/theme/motion';
import { brandColors, colors, type Pastel } from '../../../shared/theme/tokens';
import { Icon, type IconName } from '../../../shared/ui/Icon';
import { Text } from '../../../shared/ui/Text';

type QuizNextActionProps = {
  title: string;
  description: string;
  icon: IconName;
  tone: Pastel;
  expanded?: boolean;
  onPress: () => void;
};

export function QuizNextAction({
  title,
  description,
  icon,
  tone,
  expanded,
  onPress,
}: QuizNextActionProps) {
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${description}`}
      accessibilityState={expanded === undefined ? undefined : { expanded }}
      aria-expanded={expanded}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [styles.row, focused && styles.focused, pressed && styles.pressed]}
    >
      <View style={[styles.icon, { backgroundColor: colors[tone] }]}>
        <Icon name={icon} size={20} />
      </View>
      <View style={styles.copy}>
        <Text variant="label">{title}</Text>
        <Text variant="small" muted>
          {description}
        </Text>
      </View>
      <Icon
        name={expanded === undefined ? 'arrow-right' : expanded ? 'chevron-up' : 'chevron-down'}
        size={18}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    minHeight: 64,
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: 9,
    backgroundColor: colors.white,
  },
  focused: { borderColor: brandColors.forest },
  pressed: { backgroundColor: colors.soft, transform: [{ translateY: motion.distance.press }] },
  icon: { padding: 8, borderWidth: 1, borderColor: colors.ink, borderRadius: 5 },
  copy: { flex: 1, gap: 2 },
});
