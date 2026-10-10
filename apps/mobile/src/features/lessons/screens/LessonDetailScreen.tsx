import { router } from 'expo-router';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { getLesson } from '../data/lessons';
import { LessonArtwork } from '../components/LessonArtwork';
import { LessonOutcomes } from '../components/LessonOutcomes';
import { LessonProgressSummary } from '../components/LessonProgressSummary';
import { useLearningProgress } from '../../progress/hooks/useLearningProgress';
import { Screen, ContentGroup } from '../../../shared/ui/Screen';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { Text } from '../../../shared/ui/Text';
import { Card } from '../../../shared/ui/Card';
import { Button, IconButton } from '../../../shared/ui/Button';
import { Icon } from '../../../shared/ui/Icon';
import { colors } from '../../../shared/theme/tokens';
export function LessonDetailScreen({ lessonId }: { lessonId: string }) {
  const lesson = getLesson(lessonId);
  const { bookmarks, toggleBookmark, progress, setSection, error } = useLearningProgress();
  const { fontScale } = useWindowDimensions();
  if (!lesson)
    return (
      <Screen>
        <PageHeader title="Lesson not found" back />
        <Button label="Explore lessons" onPress={() => router.replace('/lessons')} />
      </Screen>
    );
  const saved = bookmarks.includes(lesson.id);
  const lessonProgress = progress[lesson.id];
  const completed = lessonProgress?.completed;
  return (
    <Screen
      footer={
        <Button
          label={
            completed
              ? 'Revisit lesson'
              : lessonProgress
                ? 'Continue learning'
                : 'Start this lesson'
          }
          onPress={() => {
            if (completed) setSection(lesson.id, 0);
            router.push(`/read/${lesson.id}`);
          }}
        />
      }
    >
      <PageHeader
        title={completed ? 'Keep growing' : 'Your next little step'}
        back
        action={
          <IconButton
            name="bookmark"
            label={saved ? 'Unsave lesson' : 'Save lesson'}
            active={saved}
            onPress={() => toggleBookmark(lesson.id)}
          />
        }
      />
      <Card tone={lesson.color} style={[styles.hero, fontScale >= 1.5 && styles.heroStacked]}>
        <View style={styles.heroCopy}>
          <Text variant="caption">{lesson.category.toUpperCase()} · SAMPLE LESSON</Text>
          <Text variant="heading">{lesson.title}</Text>
          <Text variant="small">{lesson.scripture}</Text>
        </View>
        <LessonArtwork id={lesson.id} tone={lesson.color} large />
      </Card>
      <Text>{lesson.intro}</Text>
      <LessonOutcomes outcomes={lesson.outcomes} />
      <View style={styles.facts}>
        <View style={styles.fact}>
          <Icon name="book-open" />
          <Text variant="small" style={styles.factLabel}>
            {lesson.sections.length} short readings
          </Text>
        </View>
        <View style={styles.fact}>
          <Icon name="clock" />
          <Text variant="small" style={styles.factLabel}>
            {lesson.durationMinutes} minutes
          </Text>
        </View>
        <View style={styles.fact}>
          <Icon name="edit-3" />
          <Text variant="small" style={styles.factLabel}>
            {lesson.questions.length} questions
          </Text>
        </View>
      </View>
      {lessonProgress && (
        <Card tone={completed ? 'mint' : undefined} shadow={false} style={styles.progress}>
          <Text variant="label">Your learning</Text>
          <LessonProgressSummary readingCount={lesson.sections.length} progress={lessonProgress} />
          {completed ? (
            <Text variant="small">
              Revisit from reading 1. Your completed status and best quiz score stay.
            </Text>
          ) : (
            <Text variant="small">
              Resume at “{lesson.sections[lessonProgress.sectionIndex].title}”.
            </Text>
          )}
          <Text variant="small" muted>
            {error
              ? 'Device storage needs attention. Your latest progress may not be saved.'
              : 'Progress is kept on this device only.'}
          </Text>
        </Card>
      )}
      <ContentGroup>
        <Text variant="title">Inside this lesson</Text>
        {lesson.sections.map((section, index) => {
          const resumeHere = Boolean(
            lessonProgress && !completed && lessonProgress.sectionIndex === index,
          );
          return (
            <Pressable
              key={section.id}
              accessibilityRole="button"
              accessibilityLabel={`Read ${section.title}${resumeHere ? ', current reading position' : ''}`}
              style={({ pressed }) => pressed && styles.pressed}
              onPress={() => {
                setSection(lesson.id, index);
                router.push(`/read/${lesson.id}`);
              }}
            >
              <Card
                tone={resumeHere ? 'lavender' : undefined}
                shadow={false}
                style={styles.section}
              >
                <View style={styles.number}>
                  <Text variant="label">0{index + 1}</Text>
                </View>
                <View style={styles.sectionTitle}>
                  <Text variant="label">{section.title}</Text>
                  {resumeHere && <Text variant="small">Resume here</Text>}
                </View>
                <Icon name="chevron-right" size={18} />
              </Card>
            </Pressable>
          );
        })}
      </ContentGroup>
      <Card tone="mint" shadow={false}>
        <Text variant="label">A verse to remember</Text>
        <Text variant="title" style={styles.verse}>
          “{lesson.memoryVerse.text}”
        </Text>
        <Text variant="small">{lesson.memoryVerse.reference}</Text>
      </Card>
      {!lessonProgress && (
        <Text variant="small" muted>
          Sample content. Reading position and quiz progress are kept on this device only.
        </Text>
      )}
    </Screen>
  );
}
const styles = StyleSheet.create({
  hero: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'center', padding: 12 },
  heroStacked: { flexDirection: 'column', alignItems: 'stretch' },
  heroCopy: { flexGrow: 1, flexBasis: 150, gap: 10 },
  facts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 6,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.line,
    paddingVertical: 16,
  },
  fact: { flexGrow: 1, flexBasis: 85, alignItems: 'center', gap: 6 },
  factLabel: { textAlign: 'center' },
  progress: { gap: 10 },
  section: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, minHeight: 52 },
  number: { padding: 8, borderRadius: 6, backgroundColor: colors.lavender },
  sectionTitle: { flex: 1 },
  verse: { marginVertical: 12 },
  pressed: { opacity: 0.72 },
});
