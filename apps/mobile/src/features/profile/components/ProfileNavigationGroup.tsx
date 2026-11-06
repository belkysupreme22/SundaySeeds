import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { motion } from '../../../shared/theme/motion';
import { brandColors, colors, type Pastel } from '../../../shared/theme/tokens';
import { Icon, type IconName } from '../../../shared/ui/Icon';
import { Text } from '../../../shared/ui/Text';

type ProfileNavigationItem = {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  tone: Pastel;
  onPress: () => void;
};

export function ProfileNavigationGroup({ items }: { items: readonly ProfileNavigationItem[] }) {
  const [focusedItem, setFocusedItem] = useState<string | null>(null);
  return (
    <View style={styles.group}>
      {items.map((item, index) => (
        <Pressable
          key={item.id}
          accessibilityRole="button"
          accessibilityLabel={`${item.title}. ${item.description}`}
          onPress={item.onPress}
          onFocus={() => setFocusedItem(item.id)}
          onBlur={() => setFocusedItem((current) => (current === item.id ? null : current))}
          style={({ pressed }) => [
            styles.row,
            index > 0 && styles.divider,
            focusedItem === item.id && styles.focused,
            pressed && styles.pressed,
          ]}
        >
          {focusedItem === item.id && (
            <View style={styles.focusMark} pointerEvents="none" aria-hidden />
          )}
          <View style={[styles.icon, { backgroundColor: colors[item.tone] }]}>
            <Icon name={item.icon} size={18} />
          </View>
          <View style={styles.words}>
            <Text variant="label">{item.title}</Text>
            <Text variant="small" muted={focusedItem !== item.id}>
              {item.description}
            </Text>
          </View>
          <Icon
            name="chevron-right"
            size={18}
            color={focusedItem === item.id ? brandColors.forest : colors.ink}
          />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    borderWidth: 1,
    borderColor: brandColors.surfaceEdge,
    borderRadius: 9,
    backgroundColor: brandColors.surfaceRaised,
    overflow: 'hidden',
  },
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
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
  pressed: { opacity: motion.pressedOpacity, backgroundColor: colors.soft },
  icon: {
    width: 34,
    height: 34,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  words: { flex: 1, gap: 2 },
});
