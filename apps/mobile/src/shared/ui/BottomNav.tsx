import { router, usePathname, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/tokens';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

const tabs: { label: string; href: Href; icon: IconName }[] = [
  { label: 'Home', href: '/', icon: 'home' },
  { label: 'Lessons', href: '/lessons', icon: 'book-open' },
  { label: 'Progress', href: '/progress', icon: 'bar-chart-2' },
  { label: 'Profile', href: '/profile', icon: 'user' },
];
export function BottomNav() {
  const pathname = usePathname();
  return (
    <SafeAreaView edges={['bottom']} style={styles.safe}>
      <View style={styles.bar}>
        {tabs.map((tab) => {
          const selected = pathname === tab.href;
          return (
            <Pressable
              key={tab.label}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={tab.label}
              onPress={() => {
                if (!selected) router.replace(tab.href);
              }}
              style={[styles.tab, selected && styles.active]}
            >
              <Icon name={tab.icon} size={21} />
              <Text variant="caption">{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.paper,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopColor: colors.line,
    borderTopWidth: 1,
  },
  bar: {
    flexDirection: 'row',
    gap: 4,
    padding: 5,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: 10,
    backgroundColor: colors.white,
  },
  tab: {
    flex: 1,
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 58,
    paddingVertical: 6,
    borderRadius: 6,
  },
  active: { backgroundColor: colors.lavender },
});
