import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { getLesson } from '../data/lessons';
import { useLearningProgress } from '../../progress/hooks/useLearningProgress';
import { Screen } from '../../../shared/ui/Screen';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { Text } from '../../../shared/ui/Text';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { Icon } from '../../../shared/ui/Icon';
import { ProgressBar } from '../../../shared/ui/ProgressBar';
export function ReaderScreen({ lessonId }: { lessonId: string }) {
  const lesson = getLesson(lessonId);
  const { progress, setSection } = useLearningProgress();
  if (!lesson)
    return (
      <Screen>
        <PageHeader title="Lesson not found" back />
      </Screen>
    );
  const index = progress[lesson.id]?.sectionIndex ?? 0;
  const section = lesson.sections[index];
  const last = index === lesson.sections.length - 1;
  return (
    <Screen
      key={section.id}
      footer={
        <View style={styles.actions}>
          <Button
            label="Previous"
            icon="arrow-left"
            variant="outline"
            disabled={index === 0}
            onPress={() => setSection(lesson.id, index - 1)}
            style={styles.previous}
          />
          <Button
            label={last ? 'Take the quiz' : 'Next reading'}
            onPress={() =>
              last ? router.push(`/quiz/${lesson.id}`) : setSection(lesson.id, index + 1)
            }
            style={styles.next}
          />
        </View>
      }
    >
      <PageHeader
        title={lesson.title}
        subtitle={`Reading ${index + 1} of ${lesson.sections.length}`}
        back
      />
      <ProgressBar value={((index + 1) / lesson.sections.length) * 100} />
      <Card tone={lesson.color} shadow={false} style={styles.cover}>
        <Icon name="book-open" size={36} />
        <Text variant="caption">{lesson.scripture}</Text>
        <Text variant="heading">{section.title}</Text>
      </Card>
      <Text variant="caption" muted>
        READ · REFLECT · GROW
      </Text>
      {section.body.split('\n\n').map((paragraph, i) => (
        <Text key={i} style={styles.body}>
          {paragraph}
        </Text>
      ))}
      <Card tone="yellow" shadow={false}>
        <Text variant="label">Pause for a moment</Text>
        <Text>What is one small way you could put this into practice this week?</Text>
      </Card>
      <Text variant="caption" muted>
        Original sample teaching content. Your reading position saves when you move between
        sections.
      </Text>
    </Screen>
  );
}
const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: 10 },
  previous: { flex: 1 },
  next: { flex: 1.3 },
  cover: { minHeight: 190, justifyContent: 'center', alignItems: 'center', gap: 14 },
  body: { fontSize: 16, lineHeight: 29 },
});
