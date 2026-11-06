import { router, usePathname, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { motion, shape } from '../theme/motion';
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
  const [focusedKey, setFocusedKey] = useState<string | null>(null);
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
              onFocus={() => setFocusedKey(tab.labelKey)}
              onBlur={() => setFocusedKey((current) => (current === tab.labelKey ? null : current))}
              style={({ pressed }) => [
                styles.tab,
                selected && styles.active,
                pressed && styles.pressed,
              ]}
            >
              <Icon
                name={tab.icon}
                size={21}
                color={selected ? brandColors.onForest : colors.ink}
              />
              <Text variant="caption" style={[styles.label, selected && styles.activeLabel]}>
                {label}
              </Text>
              {focusedKey === tab.labelKey && (
                <View
                  aria-hidden
                  pointerEvents="none"
                  style={[styles.focusRing, selected && styles.activeFocusRing]}
                />
              )}
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: {
    backgroundColor: brandColors.canvas,
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
    backgroundColor: brandColors.surface,
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
  pressed: { opacity: motion.pressedOpacity },
  focusRing: {
    position: 'absolute',
    top: 2,
    right: 2,
    bottom: 2,
    left: 2,
    borderRadius: 4,
    borderWidth: shape.stroke.focus,
    borderColor: brandColors.forest,
  },
  activeFocusRing: { borderColor: brandColors.onForest },
  compactSafe: { paddingHorizontal: 4 },
  compactBar: { padding: 2, gap: 0 },
});
