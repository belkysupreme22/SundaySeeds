import { StyleSheet, View } from 'react-native';
import type { LessonProgress } from '../../progress/data/progressStorage';
import { ProgressBar } from '../../../shared/ui/ProgressBar';
import { Text } from '../../../shared/ui/Text';

type Props = { readingCount: number; progress?: LessonProgress; color?: string };

export function LessonProgressSummary({ readingCount, progress, color }: Props) {
  // A saved section is a reading position, not proof that every preceding section was read.
  const position = progress ? progress.sectionIndex + 1 : 0;
  const label = progress?.completed
    ? 'Lesson completed'
    : progress
      ? `Reading position · ${position} of ${readingCount}`
      : 'Not started';
  const value = progress?.completed ? 100 : readingCount > 0 ? (position / readingCount) * 100 : 0;

  return (
    <View style={styles.summary}>
      <Text variant="caption" muted>{label}</Text>
      <ProgressBar value={value} color={color} label={label} valueText={label} />
      {progress && !progress.completed && <Text variant="caption" muted>Quiz not finished</Text>}
    </View>
  );
}

const styles = StyleSheet.create({ summary: { gap: 5 } });
