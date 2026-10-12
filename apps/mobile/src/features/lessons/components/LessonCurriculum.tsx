import { Pressable, StyleSheet, View } from 'react-native';
import type { Lesson } from '../types';
import type { LessonProgress } from '../../progress/data/progressStorage';
import { colors } from '../../../shared/theme/tokens';
import { Card } from '../../../shared/ui/Card';
import { Icon } from '../../../shared/ui/Icon';
import { Text } from '../../../shared/ui/Text';
import { ContentGroup } from '../../../shared/ui/Screen';

export function LessonCurriculum({
  lesson,
  progress,
  onRead,
  onQuiz,
}: {
  lesson: Lesson;
  progress?: LessonProgress;
  onRead: (index: number) => void;
  onQuiz: () => void;
}) {
  return (
    <ContentGroup>
      <Text variant="title" accessibilityRole="header">
        Inside this lesson
      </Text>
      <Card shadow={false} style={styles.curriculum}>
        <View style={styles.groupHeader}>
          <Icon name="book-open" size={18} />
          <Text variant="label" style={styles.words}>
            Read and reflect
          </Text>
          <Text variant="small">{lesson.sections.length} readings</Text>
        </View>
        {lesson.sections.map((section, index) => {
          const resumeHere = Boolean(
            progress && !progress.completed && progress.sectionIndex === index,
          );
          return (
            <Pressable
              key={section.id}
              accessibilityRole="button"
              accessibilityLabel={`Read ${section.title}${resumeHere ? ', current reading position' : ''}`}
              onPress={() => onRead(index)}
              style={({ pressed }) => [
                styles.row,
                resumeHere && styles.resume,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.number}>
                <Text variant="label">{String(index + 1).padStart(2, '0')}</Text>
              </View>
              <View style={styles.words}>
                <Text variant="label">{section.title}</Text>
                <Text variant="small" muted>
                  {resumeHere ? 'Resume here' : 'Reading and reflection'}
                </Text>
              </View>
              <Icon name="chevron-right" size={18} />
            </Pressable>
          );
        })}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            progress?.completed ? 'Revisit the lesson quiz' : 'Open the lesson quiz'
          }
          onPress={onQuiz}
          style={({ pressed }) => [styles.row, styles.quiz, pressed && styles.pressed]}
        >
          <Icon name={progress?.completed ? 'check-circle' : 'edit-3'} size={22} />
          <View style={styles.words}>
            <Text variant="label">Put it into practice</Text>
            <Text variant="small">{lesson.questions.length} quiz questions</Text>
            {progress?.completed && progress.bestScore !== null && (
              <Text variant="small">Quiz finished · Best {progress.bestScore}%</Text>
            )}
          </View>
          <Icon name="chevron-right" size={18} />
        </Pressable>
      </Card>
    </ContentGroup>
  );
}

const styles = StyleSheet.create({
  curriculum: { padding: 0, borderRadius: 8, overflow: 'hidden' },
  groupHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: colors.soft,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    minHeight: 64,
    borderTopWidth: 1,
    borderColor: colors.line,
  },
  words: { flex: 1, gap: 3 },
  number: { padding: 7, borderRadius: 5, backgroundColor: colors.soft },
  resume: { backgroundColor: colors.lavender },
  quiz: { backgroundColor: colors.mint },
  pressed: { opacity: 0.72 },
});
