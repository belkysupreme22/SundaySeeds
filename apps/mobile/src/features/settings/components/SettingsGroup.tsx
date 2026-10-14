import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors } from '../../../shared/theme/tokens';
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
  icon,
  divider = false,
  onPress,
}: {
  title: string;
  description: string;
  icon: IconName;
  divider?: boolean;
  onPress?: () => void;
}) {
  const content = (
    <>
      <View style={styles.icon}>
        <Icon name={icon} size={19} />
      </View>
      <View style={styles.words}>
        <Text variant="label">{title}</Text>
        <Text variant="small" muted>
          {description}
        </Text>
      </View>
      {onPress ? <Icon name="arrow-right" size={17} /> : null}
    </>
  );

  return onPress ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${description}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, divider && styles.divider, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  ) : (
    <View style={[styles.row, divider && styles.divider]}>{content}</View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 9 },
  heading: { fontSize: 13, lineHeight: 20 },
  group: {
    borderWidth: 1.2,
    borderColor: colors.ink,
    borderRadius: 8,
    backgroundColor: colors.white,
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
  pressed: { backgroundColor: colors.soft },
  icon: { width: 23, alignItems: 'center', flexShrink: 0 },
  words: { flex: 1, minWidth: 0, gap: 2 },
});
