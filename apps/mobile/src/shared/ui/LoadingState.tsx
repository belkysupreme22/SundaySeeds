import { StyleSheet, Text as NativeText, View } from 'react-native';
import { colors } from '../theme/tokens';
import { LoadingIndicator } from './LoadingIndicator';
import { Text } from './Text';

export function LoadingState({
  label,
  compact = false,
  bootstrap = false,
}: {
  label: string;
  compact?: boolean;
  bootstrap?: boolean;
}) {
  return (
    <View
      accessible
      accessibilityLabel={label}
      accessibilityLiveRegion="polite"
      accessibilityState={{ busy: true }}
      style={[styles.status, compact && styles.compact]}
    >
      <LoadingIndicator small={compact} />
      {bootstrap ? (
        <NativeText style={styles.bootstrap}>{label}</NativeText>
      ) : (
        <Text variant="small" style={styles.copy}>
          {label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  status: { alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 12 },
  compact: { flexDirection: 'row', gap: 10, paddingVertical: 4 },
  copy: { textAlign: 'center', flexShrink: 1 },
  bootstrap: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    flexShrink: 1,
  },
});
