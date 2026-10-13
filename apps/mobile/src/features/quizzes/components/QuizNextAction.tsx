import { Pressable, StyleSheet, View } from 'react-native';
import { colors, type Pastel } from '../../../shared/theme/tokens';
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
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${description}`}
      accessibilityState={expanded === undefined ? undefined : { expanded }}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
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
      <Icon name={expanded ? 'chevron-up' : 'arrow-right'} size={18} />
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
    borderWidth: 1.2,
    borderColor: colors.ink,
    borderRadius: 9,
    backgroundColor: colors.white,
  },
  pressed: { backgroundColor: colors.soft },
  icon: { padding: 8, borderWidth: 1, borderColor: colors.ink, borderRadius: 5 },
  copy: { flex: 1, gap: 2 },
});
