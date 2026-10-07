import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import type { Lesson } from '../types';
import { useLearningProgress } from '../../progress/hooks/useLearningProgress';
import { Card } from '../../../shared/ui/Card';
import { Text } from '../../../shared/ui/Text';
import { IconButton } from '../../../shared/ui/Button';
import { ProgressBar } from '../../../shared/ui/ProgressBar';
import { LessonArtwork } from './LessonArtwork';
export function LessonCard({ lesson }: { lesson: Lesson }) {
  const { progress, bookmarks, toggleBookmark } = useLearningProgress();
  const saved = bookmarks.includes(lesson.id);
  const entry = progress[lesson.id];
  const percent = entry?.completed
    ? 100
    : entry
      ? Math.round((entry.sectionIndex / lesson.sections.length) * 100)
      : 0;
  return (
    <Card style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${lesson.title}`}
        onPress={() => router.push(`/lessons/${lesson.id}`)}
        style={styles.main}
      >
        <LessonArtwork id={lesson.id} tone={lesson.color} />
        <View style={styles.words}>
          <Text variant="label" style={styles.title}>
            {lesson.title}
          </Text>
          <Text variant="caption" muted>
            {lesson.category} · {lesson.durationMinutes} min
          </Text>
          <Text variant="caption">{lesson.scripture}</Text>
          <View style={styles.progress}>
            <View style={styles.track}>
              <ProgressBar value={percent} />
            </View>
            <Text variant="caption">{percent}%</Text>
          </View>
        </View>
      </Pressable>
      <View style={styles.save}>
        <IconButton
          name="bookmark"
          label={saved ? `Unsave ${lesson.title}` : `Save ${lesson.title}`}
          active={saved}
          onPress={() => toggleBookmark(lesson.id)}
        />
      </View>
    </Card>
  );
}
const styles = StyleSheet.create({
  card: { padding: 9, position: 'relative' },
  main: { flexDirection: 'row', gap: 12 },
  words: { flex: 1, paddingRight: 28, justifyContent: 'center', gap: 4 },
  title: { fontSize: 13, lineHeight: 19 },
  progress: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  track: { flex: 1 },
  save: { position: 'absolute', right: 1, top: 1 },
});
