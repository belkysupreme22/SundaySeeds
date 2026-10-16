import { StyleSheet, View } from 'react-native';
import { IconButton } from '../../../shared/ui/Button';
import { Text } from '../../../shared/ui/Text';
import { colors } from '../../../shared/theme/tokens';

export function AccountTopBar({ label, onBack }: { label: string; onBack: () => void }) {
  return (
    <View style={styles.row}>
      <IconButton name="arrow-left" label="Go back" onPress={onBack} />
      <View style={styles.badge}>
        <Text variant="caption">{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  badge: {
    backgroundColor: colors.lavender,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    flexShrink: 1,
  },
});
