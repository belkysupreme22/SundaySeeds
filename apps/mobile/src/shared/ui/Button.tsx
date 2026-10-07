import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../theme/tokens';
import { Text } from './Text';
import { Icon, type IconName } from './Icon';

export function Button({
  label,
  onPress,
  icon = 'arrow-right',
  variant = 'primary',
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  icon?: IconName | false;
  variant?: 'primary' | 'dark' | 'outline';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text variant="label" style={[styles.label, variant === 'dark' && { color: colors.white }]}>
        {label}
      </Text>
      {icon && (
        <Icon name={icon} size={19} color={variant === 'dark' ? colors.white : colors.ink} />
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
      <View style={[styles.iconBox, active && { backgroundColor: colors.lavender }]}>
        <Icon name={name} size={19} />
      </View>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  button: {
    minHeight: 52,
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
  primary: { backgroundColor: colors.primary, boxShadow: '2px 3px 0px #26212E' },
  dark: { backgroundColor: colors.ink },
  outline: { backgroundColor: colors.white },
  label: { flexShrink: 1, textAlign: 'center', flexGrow: 1 },
  disabled: { opacity: 0.45, boxShadow: 'none' },
  pressed: { opacity: 0.72, transform: [{ translateY: 1 }] },
  iconTarget: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
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
