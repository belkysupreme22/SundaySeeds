import { StyleSheet, View } from 'react-native';
import { Card } from '../../../shared/ui/Card';
import { Icon, type IconName } from '../../../shared/ui/Icon';
import { Text } from '../../../shared/ui/Text';
import type { Pastel } from '../../../shared/theme/tokens';

type ProgressStatsProps = {
  saved: number;
  averageBestScore: number | null;
  scoredLessons: number;
  stacked: boolean;
};

type Stat = {
  label: string;
  value: string;
  detail: string;
  tone: Pastel;
  icon: IconName;
};

export function ProgressStats({
  saved,
  averageBestScore,
  scoredLessons,
  stacked,
}: ProgressStatsProps) {
  const stats: Stat[] = [
    {
      label: 'Saved lessons',
      value: String(saved),
      detail: 'Your bookmarks',
      tone: 'peach',
      icon: 'bookmark',
    },
    {
      label: 'Average best score',
      value: averageBestScore === null ? '—' : `${Math.round(averageBestScore)}%`,
      detail:
        scoredLessons === 0
          ? 'No quizzes yet'
          : `Across ${scoredLessons} ${scoredLessons === 1 ? 'quiz' : 'quizzes'}`,
      tone: 'pink',
      icon: 'bar-chart-2',
    },
  ];

  return (
    <View style={[styles.row, stacked && styles.stacked]}>
      {stats.map((stat) => (
        <Card
          key={stat.label}
          tone={stat.tone}
          shadow={false}
          accessible
          accessibilityLabel={`${stat.label}: ${stat.value}. ${stat.detail}.`}
          style={[styles.tile, stacked && styles.stackedTile]}
        >
          <Text variant="label">{stat.label}</Text>
          <View style={styles.valueRow}>
            <Text variant="heading" style={styles.value}>
              {stat.value}
            </Text>
            <Icon name={stat.icon} size={22} />
          </View>
          <Text variant="caption">{stat.detail}</Text>
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, alignItems: 'stretch' },
  stacked: { flexDirection: 'column' },
  tile: { flex: 1, minWidth: 0, padding: 14, gap: 5, borderRadius: 9 },
  stackedTile: { flexGrow: 0, flexShrink: 0, flexBasis: 'auto' },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  value: { flex: 1, flexShrink: 1 },
});
