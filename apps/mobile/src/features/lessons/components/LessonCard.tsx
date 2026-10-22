import { router } from 'expo-router';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import type { Lesson } from '../types';
import { useLearningProgress } from '../../progress/hooks/useLearningProgress';
import { Card } from '../../../shared/ui/Card';
import { Text } from '../../../shared/ui/Text';
import { IconButton } from '../../../shared/ui/Button';
import { LessonProgressSummary } from './LessonProgressSummary';
import { LessonArtwork } from './LessonArtwork';
export function LessonCard({ lesson }: { lesson: Lesson }) {
  const { width, fontScale } = useWindowDimensions();
  const stacked = width < 350 || fontScale >= 1.5;
  const { progress, bookmarks, toggleBookmark, errorKind } = useLearningProgress();
  const saved = bookmarks.includes(lesson.id);
  const entry = progress[lesson.id];
  return (
    <Card style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${lesson.title}`}
        onPress={() => router.push(`/lessons/${lesson.id}`)}
        style={[styles.main, stacked && styles.stacked]}
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
          {errorKind === 'load' ? (
            <Text variant="caption" muted>
              Progress unavailable
            </Text>
          ) : (
            <LessonProgressSummary readingCount={lesson.sections.length} progress={entry} />
          )}
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
  card: { padding: 9, flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  main: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  stacked: { flexDirection: 'column', alignItems: 'stretch' },
  words: { flexGrow: 1, flexShrink: 1, flexBasis: 'auto', justifyContent: 'center', gap: 4 },
  title: { fontSize: 13, lineHeight: 19 },
  save: { width: 44, minHeight: 44 },
});
