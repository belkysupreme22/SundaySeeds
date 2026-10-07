import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from './Text';

export function SectionHeading({
  title,
  action,
  onPress,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <View style={styles.row}>
      <Text variant="title" style={styles.title}>
        {title}
      </Text>
      {action && onPress && (
        <Pressable accessibilityRole="button" onPress={onPress} style={styles.action}>
          <Text variant="small">{action} →</Text>
        </Pressable>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { flexShrink: 1 },
  action: { minHeight: 44, justifyContent: 'center' },
});
