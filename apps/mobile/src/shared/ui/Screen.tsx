import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/tokens';
import { BottomNav } from './BottomNav';

export function Screen({
  children,
  tabs = false,
  footer,
}: {
  children: ReactNode;
  tabs?: boolean;
  footer?: ReactNode;
}) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
      {footer && (
        <SafeAreaView edges={['bottom']} style={styles.footer}>
          {footer}
        </SafeAreaView>
      )}
      {tabs && <BottomNav />}
    </SafeAreaView>
  );
}
export function ContentGroup({ children }: { children: ReactNode }) {
  return <View style={styles.group}>{children}</View>;
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  content: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 28, gap: 22 },
  group: { gap: 12 },
  footer: {
    padding: 18,
    borderTopWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
  },
});
