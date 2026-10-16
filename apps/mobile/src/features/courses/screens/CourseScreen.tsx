import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { sampleCourse } from '../data/sampleCourse';
import { getLesson } from '../../lessons/data/lessons';
import { useLearningProgress } from '../../progress/hooks/useLearningProgress';
import { Screen } from '../../../shared/ui/Screen';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { Card } from '../../../shared/ui/Card';
import { Text } from '../../../shared/ui/Text';
import { Button } from '../../../shared/ui/Button';
import { Icon } from '../../../shared/ui/Icon';
import { colors } from '../../../shared/theme/tokens';

export function CourseScreen() {
  const { progress, hydrated, errorKind } = useLearningProgress();
  const lessons = sampleCourse.modules
    .flatMap((module) => module.lessonIds.map(getLesson))
    .filter((lesson) => lesson !== undefined);
  const available = hydrated && errorKind !== 'load';
  const completed = lessons.filter((lesson) => progress[lesson.id]?.completed).length;
  const next =
    lessons.find((lesson) => progress[lesson.id] && !progress[lesson.id].completed) ??
    lessons.find((lesson) => !progress[lesson.id]?.completed) ??
    lessons[0];
  return (
    <Screen tabs>
      <PageHeader title="Course overview" back />
      <Card tone="lavender" style={styles.group}>
        <Text variant="small">SAMPLE COURSE · 2 MODULES</Text>
        <Text variant="heading">{sampleCourse.title}</Text>
        <Text>{sampleCourse.description}</Text>
        <Text variant="small">
          {lessons.length} lessons ·{' '}
          {lessons.reduce((sum, lesson) => sum + lesson.durationMinutes, 0)} min of reading
        </Text>
      </Card>
      <Card shadow={false} stroke="soft" style={styles.group}>
        <Text variant="title">Your course journey</Text>
        <Text variant="small">
          {available
            ? `${completed} of ${lessons.length} lesson quizzes finished`
            : hydrated
              ? 'Progress unavailable. Use the recovery notice to try again.'
              : 'Loading your progress…'}
        </Text>
        {available && (
          <View
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: lessons.length, now: completed }}
            style={styles.track}
          >
            <View style={[styles.fill, { width: `${(completed / lessons.length) * 100}%` }]} />
          </View>
        )}
        <Text variant="small" muted>
          Read each lesson, then finish its quick knowledge check. Explore the modules in any order.
        </Text>
        {next && (
          <Button
            label={
              !available
                ? 'Explore first lesson'
                : completed === lessons.length
                  ? 'Revisit course'
                  : progress[next.id]
                    ? 'Continue learning'
                    : 'Start learning'
            }
            onPress={() => router.push(`/lessons/${!available ? lessons[0].id : next.id}`)}
          />
        )}
      </Card>
      <Text variant="title" accessibilityRole="header">
        Course curriculum
      </Text>
      {sampleCourse.modules.map((module, index) => (
        <Card key={module.id} shadow={false} style={styles.module}>
          <View style={styles.moduleHeader}>
            <Text variant="small">
              MODULE {index + 1} · {module.lessonIds.length} LESSONS
            </Text>
            <Text variant="title">{module.title}</Text>
            <Text variant="small" muted>
              {module.description}
            </Text>
          </View>
          {module.lessonIds.map((id, lessonIndex) => {
            const lesson = getLesson(id);
            if (!lesson) return null;
            const state = progress[id];
            const status = !available
              ? 'Progress unavailable'
              : state?.completed
                ? 'Quiz finished'
                : state
                  ? `Reading ${state.sectionIndex + 1} of ${lesson.sections.length}`
                  : 'Ready to start';
            return (
              <Pressable
                key={id}
                accessibilityRole="button"
                accessibilityLabel={`${lesson.title}. ${status}. Open lesson`}
                onPress={() => router.push(`/lessons/${id}`)}
                style={({ pressed }) => [styles.lesson, pressed && styles.pressed]}
              >
                <Icon name={available && state?.completed ? 'check-circle' : 'book-open'} />
                <View style={styles.words}>
                  <Text variant="label">
                    {index + 1}.{lessonIndex + 1} {lesson.title}
                  </Text>
                  <Text variant="small" muted>
                    {lesson.scripture} · {lesson.durationMinutes} min
                  </Text>
                  <Text variant="caption">{status}</Text>
                </View>
                <Icon name="chevron-right" />
              </Pressable>
            );
          })}
        </Card>
      ))}
      <Text variant="caption" muted>
        This sample groups the existing lessons into a course. Each lesson keeps its saved place,
        bookmark and best quiz score.
      </Text>
    </Screen>
  );
}
const styles = StyleSheet.create({
  group: { gap: 12 },
  module: { padding: 0, overflow: 'hidden' },
  moduleHeader: { padding: 16, gap: 6, backgroundColor: colors.soft },
  lesson: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    minHeight: 76,
  },
  words: { flex: 1, gap: 4 },
  pressed: { backgroundColor: colors.lavender },
  track: { height: 10, borderRadius: 5, backgroundColor: colors.soft, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.primary },
});
