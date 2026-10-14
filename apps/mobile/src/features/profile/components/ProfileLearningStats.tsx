import { StyleSheet, View } from 'react-native';
import { colors, type Pastel } from '../../../shared/theme/tokens';
import { Card } from '../../../shared/ui/Card';
import { Icon, type IconName } from '../../../shared/ui/Icon';
import { Text } from '../../../shared/ui/Text';

type Props = { completed: number; inProgress: number; saved: number; stacked: boolean };

export function ProfileLearningStats({ completed, inProgress, saved, stacked }: Props) {
  const stats: { label: string; value: number; icon: IconName; tone: Pastel }[] = [
    { label: 'Completed', value: completed, icon: 'check-circle', tone: 'mint' },
    { label: 'In progress', value: inProgress, icon: 'book-open', tone: 'yellow' },
    { label: 'Saved', value: saved, icon: 'bookmark', tone: 'lavender' },
  ];
  return (
    <View style={[styles.row, stacked && styles.stacked]}>
      {stats.map((stat) => (
        <Card
          key={stat.label}
          shadow={false}
          stroke="subtle"
          style={[styles.tile, stacked && styles.stackedTile]}
          accessible
          accessibilityLabel={`${stat.value} lessons ${stat.label.toLowerCase()}`}
        >
          <View style={styles.valueRow}>
            <View style={[styles.icon, { backgroundColor: colors[stat.tone] }]}>
              <Icon name={stat.icon} size={16} />
            </View>
            <Text variant="label" style={styles.value}>
              {stat.value}
            </Text>
          </View>
          <Text variant="caption" style={styles.label}>
            {stat.label}
          </Text>
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  stacked: { flexDirection: 'column' },
  tile: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 6,
    paddingVertical: 10,
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  stackedTile: { flex: 0 },
  valueRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  icon: { padding: 3, borderRadius: 5 },
  value: { flexShrink: 1 },
  label: { textAlign: 'center' },
});
