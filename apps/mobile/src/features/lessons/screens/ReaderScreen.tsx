import { useEffect } from 'react';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { getLesson } from '../data/lessons';
import { useLearningProgress } from '../../progress/hooks/useLearningProgress';
import { Screen } from '../../../shared/ui/Screen';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { Text } from '../../../shared/ui/Text';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { Icon } from '../../../shared/ui/Icon';
import { ReadingContent } from '../components/ReadingContent';
import { ProgressBar } from '../../../shared/ui/ProgressBar';
import { colors } from '../../../shared/theme/tokens';
export function ReaderScreen({ lessonId }: { lessonId: string }) {
  const lesson = getLesson(lessonId);
  const { progress, setSection, error, errorKind } = useLearningProgress();
  const progressAvailable = errorKind !== 'load';
  const { width, fontScale } = useWindowDimensions();
  const stackedActions = width < 350 || fontScale >= 1.5;
  const started = Boolean(progress[lessonId]);
  useEffect(() => {
    if (lesson && !started) setSection(lesson.id, 0);
  }, [lesson, started, setSection]);
  if (!lesson)
    return (
      <Screen>
        <PageHeader title="Lesson not found" back />
      </Screen>
    );
  const index = progress[lesson.id]?.sectionIndex ?? 0;
  const section = lesson.sections[index];
  const last = index === lesson.sections.length - 1;
  const positionLabel = `Reading position · ${index + 1} of ${lesson.sections.length}`;
  const nextTitle = last ? 'Put it into practice' : lesson.sections[index + 1].title;
  const advance = () =>
    last ? router.push(`/quiz/${lesson.id}`) : setSection(lesson.id, index + 1);
  return (
    <Screen
      key={section.id}
      footer={
        <View style={styles.footer}>
          <Text variant="caption" muted style={styles.positionLabel}>
            Reading {index + 1} of {lesson.sections.length}
            {last ? ' · Quiz up next' : ''}
          </Text>
          <View style={[styles.actions, stackedActions && styles.actionsStacked]}>
            <Button
              label="Previous"
              icon="arrow-left"
              variant="outline"
              disabled={index === 0 || !progressAvailable}
              onPress={() => setSection(lesson.id, index - 1)}
              style={[styles.previous, stackedActions && styles.stackedButton]}
            />
            <Button
              label={last ? 'Take the quiz' : 'Next reading'}
              disabled={!progressAvailable}
              onPress={advance}
              style={[styles.next, stackedActions && styles.stackedButton]}
            />
          </View>
        </View>
      }
    >
      <PageHeader title={lesson.title} subtitle="Read, reflect and grow." back />
      <View style={styles.position}>
        <Text variant="small">
          {progressAvailable ? positionLabel : 'Saved progress unavailable'}
        </Text>
        {progressAvailable && (
          <ProgressBar
            value={((index + 1) / lesson.sections.length) * 100}
            label="Current reading position"
            valueText={positionLabel}
          />
        )}
        <Text variant="caption" muted>
          {!progressAvailable
            ? 'Load saved learning to resume your reading position.'
            : progress[lesson.id]?.completed
              ? 'Lesson completed · Revisiting your readings'
              : 'Quiz not finished · Reading position is separate from completion'}
        </Text>
      </View>
      <Card tone={lesson.color} shadow={false} style={styles.cover}>
        <View style={styles.eyebrow}>
          <Icon name="book-open" size={22} />
          <Text variant="label" style={styles.words}>
            READING {String(index + 1).padStart(2, '0')}
          </Text>
        </View>
        <Text variant="heading" accessibilityRole="header" style={styles.sectionTitle}>
          {section.title}
        </Text>
        <Text variant="small">{lesson.scripture}</Text>
      </Card>
      <ReadingContent body={section.body} />
      <Card tone="mint" shadow={false} style={styles.verse}>
        <View style={styles.eyebrow}>
          <Icon name="heart" size={20} />
          <Text variant="label" style={styles.words}>
            A verse to remember
          </Text>
        </View>
        <Text variant="title">“{lesson.memoryVerse.text}”</Text>
        <Text variant="small">{lesson.memoryVerse.reference}</Text>
      </Card>
      <View style={styles.upNext}>
        <Text variant="title" accessibilityRole="header">
          Up next
        </Text>
        <Pressable
          accessibilityRole="button"
          disabled={!progressAvailable}
          accessibilityState={{ disabled: !progressAvailable }}
          aria-disabled={!progressAvailable}
          accessibilityLabel={last ? 'Take the lesson quiz' : `Next reading: ${nextTitle}`}
          onPress={advance}
          style={({ pressed }) => [
            styles.nextCard,
            !progressAvailable && styles.disabled,
            pressed && styles.pressed,
          ]}
        >
          <View style={[styles.nextIcon, last && styles.quizIcon]}>
            <Icon name={last ? 'edit-3' : 'book-open'} size={25} />
          </View>
          <View style={styles.words}>
            <Text variant="label">{nextTitle}</Text>
            <Text variant="small" muted>
              {last
                ? `${lesson.questions.length} quiz questions`
                : `Reading ${index + 2} of ${lesson.sections.length}`}
            </Text>
          </View>
          <Icon name="arrow-right" size={18} />
        </Pressable>
      </View>
      <Text variant="caption" muted>
        {error
          ? 'Your latest reading position may not be saved. Use the notice above to try again.'
          : 'Finish the quiz when you’re ready to complete this lesson.'}
      </Text>
    </Screen>
  );
}
const styles = StyleSheet.create({
  footer: { gap: 8 },
  positionLabel: { textAlign: 'center' },
  actions: { flexDirection: 'row', gap: 10 },
  actionsStacked: { flexDirection: 'column' },
  stackedButton: { flex: 0, width: '100%' },
  previous: { flex: 1 },
  next: { flex: 1.3 },
  position: { gap: 7 },
  cover: { gap: 10, borderRadius: 8 },
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  words: { flex: 1, gap: 4 },
  sectionTitle: { fontSize: 23, lineHeight: 32 },
  verse: { gap: 10, borderRadius: 8 },
  upNext: { gap: 10 },
  nextCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  nextIcon: { padding: 12, borderRadius: 6, backgroundColor: colors.lavender },
  quizIcon: { backgroundColor: colors.yellow },
  pressed: { opacity: 0.72 },
  disabled: { opacity: 0.5 },
});
