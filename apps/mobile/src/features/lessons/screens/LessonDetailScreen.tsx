import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { getLesson } from '../data/lessons';
import { LessonArtwork } from '../components/LessonArtwork';
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
  const { bookmarks, toggleBookmark, progress, setSection } = useLearningProgress();
  if (!lesson)
    return (
      <Screen>
        <PageHeader title="Lesson not found" back />
        <Button label="Explore lessons" onPress={() => router.replace('/lessons')} />
      </Screen>
    );
  const saved = bookmarks.includes(lesson.id);
  return (
    <Screen
      footer={
        <Button
          label={progress[lesson.id] ? 'Continue learning' : 'Start this lesson'}
          onPress={() => router.push(`/read/${lesson.id}`)}
        />
      }
    >
      <PageHeader
        title="Your next little step"
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
      <Card tone={lesson.color} style={styles.hero}>
        <View style={styles.heroCopy}>
          <Text variant="caption">{lesson.category.toUpperCase()} · SAMPLE LESSON</Text>
          <Text variant="heading">{lesson.title}</Text>
          <Text variant="small">{lesson.scripture}</Text>
        </View>
        <LessonArtwork id={lesson.id} tone={lesson.color} large />
      </Card>
      <Text>{lesson.intro}</Text>
      <View style={styles.facts}>
        <View style={styles.fact}>
          <Icon name="book-open" />
          <Text variant="small">3 short readings</Text>
        </View>
        <View style={styles.fact}>
          <Icon name="clock" />
          <Text variant="small">{lesson.durationMinutes} minutes</Text>
        </View>
        <View style={styles.fact}>
          <Icon name="edit-3" />
          <Text variant="small">3 questions</Text>
        </View>
      </View>
      <ContentGroup>
        <Text variant="title">Inside this lesson</Text>
        {lesson.sections.map((section, index) => (
          <Pressable
            key={section.id}
            accessibilityRole="button"
            accessibilityLabel={`Read ${section.title}`}
            onPress={() => {
              setSection(lesson.id, index);
              router.push(`/read/${lesson.id}`);
            }}
          >
            <Card shadow={false} style={styles.section}>
              <View style={styles.number}>
                <Text variant="label">0{index + 1}</Text>
              </View>
              <Text variant="label" style={styles.sectionTitle}>
                {section.title}
              </Text>
              <Icon name="chevron-right" size={18} />
            </Card>
          </Pressable>
        ))}
      </ContentGroup>
      <Card tone="mint" shadow={false}>
        <Text variant="label">A verse to remember</Text>
        <Text variant="title" style={styles.verse}>
          “{lesson.memoryVerse.text}”
        </Text>
        <Text variant="small">{lesson.memoryVerse.reference}</Text>
      </Card>
    </Screen>
  );
}
const styles = StyleSheet.create({
  hero: { flexDirection: 'row', gap: 12, alignItems: 'center', padding: 12 },
  heroCopy: { flex: 1, gap: 10 },
  facts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.line,
    paddingVertical: 16,
  },
  fact: { flex: 1, alignItems: 'center', gap: 6 },
  section: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  number: { padding: 8, borderRadius: 6, backgroundColor: colors.lavender },
  sectionTitle: { flex: 1 },
  verse: { marginVertical: 12 },
});
