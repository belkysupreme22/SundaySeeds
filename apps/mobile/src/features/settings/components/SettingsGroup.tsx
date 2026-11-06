import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { motion } from '../../../shared/theme/motion';
import { brandColors, colors } from '../../../shared/theme/tokens';
import { Icon, type IconName } from '../../../shared/ui/Icon';
import { Text } from '../../../shared/ui/Text';

export function SettingsGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" variant="label" style={styles.heading}>
        {title}
      </Text>
      <View style={styles.group}>{children}</View>
    </View>
  );
}

export function SettingsRow({
  title,
  description,
  value,
  icon,
  divider = false,
  onPress,
}: {
  title: string;
  description?: string;
  value?: string;
  icon: IconName;
  divider?: boolean;
  onPress?: () => void;
}) {
  const { width, fontScale } = useWindowDimensions();
  const stackValue = width < 350 || fontScale >= 1.5;
  const [focused, setFocused] = useState(false);
  const content = (
    <>
      <View style={styles.icon}>
        <Icon name={icon} size={19} />
      </View>
      <View style={styles.words}>
        <View style={[styles.titleRow, stackValue && styles.stacked]}>
          <Text variant="label" style={styles.title}>
            {title}
          </Text>
          {value ? (
            <Text
              variant="caption"
              style={[
                styles.value,
                stackValue && styles.stackedValue,
                focused && styles.focusValue,
              ]}
            >
              {value}
            </Text>
          ) : null}
        </View>
        {description ? (
          <Text variant="small" muted={!focused}>
            {description}
          </Text>
        ) : null}
      </View>
      {onPress ? <Icon name="arrow-right" size={17} /> : null}
    </>
  );

  return onPress ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={[title, value, description].filter(Boolean).join('. ')}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.row,
        divider && styles.divider,
        focused && styles.focused,
        pressed && styles.pressed,
      ]}
    >
      {content}
      {focused && <View style={styles.focusMark} pointerEvents="none" aria-hidden />}
    </Pressable>
  ) : (
    <View style={[styles.row, divider && styles.divider]}>{content}</View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 9 },
  heading: { fontSize: 13, lineHeight: 20, color: brandColors.forest },
  group: {
    borderWidth: 1,
    borderColor: brandColors.surfaceEdge,
    borderRadius: 8,
    backgroundColor: brandColors.surfaceRaised,
    boxShadow: `0px 1px 0px ${brandColors.surfaceEdge}`,
    overflow: 'hidden',
  },
  row: {
    minHeight: 62,
    paddingHorizontal: 13,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  divider: { borderTopWidth: 1, borderTopColor: colors.line },
  focused: { backgroundColor: brandColors.surface },
  focusMark: {
    position: 'absolute',
    left: 1,
    top: 8,
    bottom: 8,
    width: 3,
    borderRadius: 2,
    backgroundColor: brandColors.forest,
  },
  pressed: { opacity: motion.pressedOpacity },
  icon: { width: 23, alignItems: 'center', flexShrink: 0 },
  words: { flex: 1, minWidth: 0, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { flex: 1 },
  value: { color: colors.muted, flexShrink: 1, maxWidth: '48%', textAlign: 'right' },
  focusValue: { color: brandColors.forest },
  stacked: { flexDirection: 'column', alignItems: 'stretch', gap: 2 },
  stackedValue: { maxWidth: '100%', textAlign: 'left' },
});
