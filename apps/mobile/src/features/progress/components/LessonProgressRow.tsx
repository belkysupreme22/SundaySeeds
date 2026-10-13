import { Pressable, StyleSheet, View } from 'react-native';
import type { Lesson } from '../../lessons/types';
import type { LessonProgress } from '../data/progressStorage';
import { LessonArtwork } from '../../lessons/components/LessonArtwork';
import { LessonProgressSummary } from '../../lessons/components/LessonProgressSummary';
import { colors } from '../../../shared/theme/tokens';
import { Icon } from '../../../shared/ui/Icon';
import { Text } from '../../../shared/ui/Text';

type LessonProgressRowProps = {
  lesson: Lesson;
  progress?: LessonProgress;
  saved: boolean;
  stacked: boolean;
  onPress: () => void;
};

export function LessonProgressRow({
  lesson,
  progress,
  saved,
  stacked,
  onPress,
}: LessonProgressRowProps) {
  const status = progress?.completed ? 'Completed' : progress ? 'In progress' : 'Not started';
  const score = progress?.bestScore;
  const position =
    progress && !progress.completed
      ? ` Reading position ${progress.sectionIndex + 1} of ${lesson.sections.length}. Quiz not finished.`
      : '';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${lesson.title}. ${status}.${position}${saved ? ' Saved lesson.' : ''}${score != null ? ` Best quiz score ${score}%.` : ''}`}
      accessibilityHint="Opens the lesson overview."
      onPress={onPress}
      style={({ pressed }) => [styles.row, stacked && styles.stacked, pressed && styles.pressed]}
    >
      <LessonArtwork id={lesson.id} tone={lesson.color} />
      <View style={[styles.copy, stacked && styles.stackedCopy]}>
        <View style={styles.meta}>
          <Text variant="caption" muted style={styles.category}>
            {lesson.category}
          </Text>
          {saved && <Icon name="bookmark" size={14} />}
        </View>
        <Text variant="label">{lesson.title}</Text>
        <LessonProgressSummary
          readingCount={lesson.sections.length}
          progress={progress}
          color={colors[lesson.color]}
        />
        {score != null && <Text variant="caption">Best quiz score · {score}%</Text>}
        <View style={styles.action}>
          <Text variant="caption" style={styles.actionLabel}>
            {progress?.completed ? 'Revisit lesson' : progress ? 'Continue lesson' : 'Start lesson'}
          </Text>
          <Icon name="arrow-right" size={16} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderWidth: 1.2,
    borderColor: colors.ink,
    borderRadius: 9,
    backgroundColor: colors.white,
  },
  pressed: { backgroundColor: colors.soft },
  copy: { flex: 1, gap: 7 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  category: { flex: 1 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionLabel: { flex: 1 },
  stacked: { flexDirection: 'column', alignItems: 'stretch' },
  stackedCopy: { flex: 0 },
});
