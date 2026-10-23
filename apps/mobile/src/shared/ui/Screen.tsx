import { BlurTargetView } from 'expo-blur';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/tokens';
import { BottomNav } from './BottomNav';
import { PageLoadingOverlay } from './PageLoadingOverlay';

export function Screen({
  children,
  tabs = false,
  footer,
  contentStyle,
  backgroundColor,
  loadingMessage,
}: {
  children: ReactNode;
  tabs?: boolean;
  footer?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  loadingMessage?: string;
}) {
  const blurTarget = useRef<View | null>(null);
  const [focused, setFocused] = useState(false);
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );
  useEffect(() => {
    if (loadingMessage && focused) Keyboard.dismiss();
  }, [loadingMessage, focused]);
  return (
    <SafeAreaView
      style={[styles.safe, backgroundColor ? { backgroundColor } : undefined]}
      edges={['top', 'left', 'right']}
    >
      <BlurTargetView ref={blurTarget} style={styles.body}>
        <ScrollView
          contentContainerStyle={[styles.content, contentStyle]}
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
      </BlurTargetView>
      {loadingMessage && focused && (
        <PageLoadingOverlay label={loadingMessage} blurTarget={blurTarget} />
      )}
    </SafeAreaView>
  );
}
export function ContentGroup({ children }: { children: ReactNode }) {
  return <View style={styles.group}>{children}</View>;
}
const styles = StyleSheet.create({
  body: { flex: 1 },
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
