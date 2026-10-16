import { useState, type ReactNode } from 'react';
import { Platform, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { colors, fonts } from '../theme/tokens';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export function InputField({
  icon,
  label,
  trailing,
  appearance = 'outlined',
  onFocus,
  onBlur,
  editable = true,
  style,
  ...props
}: TextInputProps & {
  icon?: IconName;
  label?: string;
  trailing?: ReactNode;
  appearance?: 'outlined' | 'soft' | 'account';
}) {
  const [focused, setFocused] = useState(false);
  const input = (
    <TextInput
      placeholderTextColor={colors.muted}
      selectionColor={colors.primary}
      cursorColor={colors.ink}
      {...props}
      editable={editable}
      underlineColorAndroid="transparent"
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      style={[
        styles.input,
        label && styles.labeledInput,
        style,
        styles.noInnerBorder,
        Platform.OS === 'web' && styles.noWebOutline,
      ]}
    />
  );
  return (
    <View
      style={[
        styles.frame,
        appearance === 'account' && styles.account,
        appearance === 'soft' && styles.soft,
        focused && editable && (appearance === 'soft' ? styles.softFocused : styles.focused),
        focused && editable && appearance === 'account' && styles.accountFocused,
        !editable && styles.disabled,
      ]}
    >
      {icon && <Icon name={icon} size={20} />}
      {label ? (
        <View style={styles.inputColumn}>
          <Text
            variant="caption"
            style={[styles.insideLabel, appearance === 'account' && styles.accountLabel]}
          >
            {label}
          </Text>
          {input}
        </View>
      ) : (
        input
      )}
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  inputColumn: { flex: 1, minWidth: 0 },
  insideLabel: { fontSize: 10, lineHeight: 14, paddingTop: 6 },
  labeledInput: { flex: 0, minHeight: 28, paddingTop: 0, paddingBottom: 6, fontSize: 12 },
  // Reference 03 uses a finer charcoal field outline than its dark CTA outline.
  account: { borderColor: '#6B6672' },
  accountLabel: { fontFamily: fonts.semibold },
  accountFocused: { borderColor: '#75619D', backgroundColor: colors.white },
  frame: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: 8,
    backgroundColor: colors.white,
    paddingHorizontal: 13,
    paddingVertical: 1,
  },
  focused: {
    borderWidth: 2,
    backgroundColor: colors.soft,
    // Keep the field and its contents stationary when the stroke thickens.
    paddingHorizontal: 12,
    paddingVertical: 0,
  },
  disabled: { borderColor: colors.muted, backgroundColor: colors.soft },
  soft: {
    borderWidth: 0,
    paddingHorizontal: 14,
    paddingVertical: 2,
    backgroundColor: colors.soft,
  },
  softFocused: { backgroundColor: colors.lavender },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 50,
    paddingHorizontal: 0,
    paddingVertical: 12,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.ink,
    backgroundColor: 'transparent',
  },
  noInnerBorder: { borderWidth: 0, borderColor: 'transparent' },
  // Reset the browser's automatic focus-ring style as well as its width.
  // Focus remains visible on the surrounding field, never on an inner rectangle.
  noWebOutline: {
    outlineStyle: 'solid',
    outlineWidth: 0,
    outlineColor: 'transparent',
    outlineOffset: 0,
    boxShadow: 'none',
  },
});
