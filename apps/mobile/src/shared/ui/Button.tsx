import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { brandColors, colors } from '../theme/tokens';
import { motion, targets } from '../theme/motion';
import { Text } from './Text';
import { Icon, type IconName } from './Icon';

export function Button({
  label,
  onPress,
  icon = 'arrow-right',
  variant = 'primary',
  disabled,
  loading = false,
  style,
}: {
  label: string;
  onPress: () => void;
  icon?: IconName | false;
  variant?: 'primary' | 'dark' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        disabled && !loading && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text variant="label" style={[styles.label, variant !== 'outline' && styles.filledLabel]}>
        {label}
      </Text>
      {icon && (
        <Icon
          name={icon}
          size={19}
          color={variant !== 'outline' ? brandColors.onForest : colors.ink}
        />
      )}
    </Pressable>
  );
}
export function IconButton({
  name,
  label,
  onPress,
  active = false,
}: {
  name: IconName;
  label: string;
  onPress: () => void;
  active?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [styles.iconTarget, pressed && styles.pressed]}
    >
      <View style={[styles.iconBox, active && { backgroundColor: brandColors.surface }]}>
        <Icon name={name} size={19} />
      </View>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  button: {
    minHeight: targets.primaryHeight,
    borderWidth: 1.2,
    borderColor: colors.ink,
    borderRadius: 9,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  primary: { backgroundColor: brandColors.forest, boxShadow: '2px 3px 0px #26212E' },
  dark: { backgroundColor: brandColors.forest },
  outline: { backgroundColor: colors.white },
  label: { flexShrink: 1, textAlign: 'center', flexGrow: 1 },
  filledLabel: { color: brandColors.onForest },
  disabled: { opacity: motion.disabledOpacity, boxShadow: 'none' },
  pressed: { opacity: motion.pressedOpacity, transform: [{ translateY: motion.distance.press }] },
  iconTarget: {
    minWidth: targets.minimum,
    minHeight: targets.minimum,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {
    width: 35,
    height: 35,
    borderWidth: 1.1,
    borderColor: colors.ink,
    borderRadius: 8,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
