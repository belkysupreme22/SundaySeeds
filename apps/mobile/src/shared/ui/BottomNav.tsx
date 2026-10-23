import { router, usePathname, type Href } from 'expo-router';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/tokens';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

const tabs: { label: string; href: Href; icon: IconName }[] = [
  { label: 'Home', href: '/home', icon: 'home' },
  { label: 'Lessons', href: '/lessons', icon: 'book-open' },
  { label: 'Progress', href: '/progress', icon: 'bar-chart-2' },
  { label: 'Profile', href: '/profile', icon: 'user' },
];
export function BottomNav() {
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const compact = width < 320;
  return (
    <SafeAreaView edges={['bottom']} style={[styles.safe, compact && styles.compactSafe]}>
      <View style={[styles.bar, compact && styles.compactBar]}>
        {tabs.map((tab) => {
          const selected =
            pathname === tab.href ||
            (tab.href === '/home' && pathname === '/') ||
            (tab.href === '/lessons' && pathname.startsWith('/lessons/')) ||
            (tab.href === '/lessons' &&
              (pathname === '/courses' || pathname.startsWith('/courses/'))) ||
            (tab.href === '/profile' && pathname === '/settings');
          return (
            <Pressable
              key={tab.label}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              aria-selected={selected}
              accessibilityLabel={tab.label}
              onPress={() => {
                if (pathname !== tab.href) router.replace(tab.href);
              }}
              style={[styles.tab, selected && styles.active]}
            >
              <Icon name={tab.icon} size={21} />
              <Text variant="caption" style={styles.label}>
                {tab.label}
              </Text>
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
    borderColor: colors.line,
    borderRadius: 10,
    backgroundColor: colors.white,
  },
  tab: {
    flex: 1,
    minWidth: 0,
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 58,
    paddingVertical: 6,
    borderRadius: 6,
  },
  label: { alignSelf: 'stretch', textAlign: 'center' },
  active: { backgroundColor: colors.lavender },
  compactSafe: { paddingHorizontal: 4 },
  compactBar: { padding: 2, gap: 0 },
});
