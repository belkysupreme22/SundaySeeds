import { router, usePathname, type Href } from 'expo-router';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { brandColors, colors } from '../theme/tokens';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

type TabConfig = { labelKey: string; href: Href; icon: IconName };

const tabs: TabConfig[] = [
  { labelKey: 'nav.home', href: '/home', icon: 'home' },
  { labelKey: 'nav.lessons', href: '/lessons', icon: 'book-open' },
  { labelKey: 'nav.progress', href: '/progress', icon: 'bar-chart-2' },
  { labelKey: 'nav.profile', href: '/profile', icon: 'user' },
];
export function BottomNav() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const compact = width < 320;
  return (
    <SafeAreaView edges={['bottom']} style={[styles.safe, compact && styles.compactSafe]}>
      <View style={[styles.bar, compact && styles.compactBar]}>
        {tabs.map((tab) => {
          const label = t(tab.labelKey);
          const selected =
            pathname === tab.href ||
            (tab.href === '/home' && pathname === '/') ||
            (tab.href === '/lessons' && pathname.startsWith('/lessons/')) ||
            (tab.href === '/lessons' &&
              (pathname === '/courses' || pathname.startsWith('/courses/'))) ||
            (tab.href === '/profile' && pathname === '/settings');
          return (
            <Pressable
              key={tab.labelKey}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              aria-selected={selected}
              accessibilityLabel={label}
              onPress={() => {
                if (pathname !== tab.href) router.replace(tab.href);
              }}
              style={[styles.tab, selected && styles.active]}
            >
              <Icon
                name={tab.icon}
                size={21}
                color={selected ? brandColors.onForest : colors.ink}
              />
              <Text variant="caption" style={[styles.label, selected && styles.activeLabel]}>
                {label}
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
  active: { backgroundColor: brandColors.forest },
  activeLabel: { color: brandColors.onForest },
  compactSafe: { paddingHorizontal: 4 },
  compactBar: { padding: 2, gap: 0 },
});
