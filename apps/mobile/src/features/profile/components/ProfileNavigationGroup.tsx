import { Pressable, StyleSheet, View } from 'react-native';
import { colors, type Pastel } from '../../../shared/theme/tokens';
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
  return (
    <View style={styles.group}>
      {items.map((item, index) => (
        <Pressable
          key={item.id}
          accessibilityRole="button"
          accessibilityLabel={`${item.title}. ${item.description}`}
          onPress={item.onPress}
          style={({ pressed }) => [
            styles.row,
            index > 0 && styles.divider,
            pressed && styles.pressed,
          ]}
        >
          <View style={[styles.icon, { backgroundColor: colors[item.tone] }]}>
            <Icon name={item.icon} size={18} />
          </View>
          <View style={styles.words}>
            <Text variant="label">{item.title}</Text>
            <Text variant="small" muted>
              {item.description}
            </Text>
          </View>
          <Icon name="chevron-right" size={18} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 9,
    backgroundColor: colors.white,
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
  pressed: { backgroundColor: colors.soft },
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
