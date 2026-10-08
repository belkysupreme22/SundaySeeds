import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { lessons } from '../../lessons/data/lessons';
import { LessonArtwork } from '../../lessons/components/LessonArtwork';
import { useLearningProgress } from '../../progress/hooks/useLearningProgress';
import { colors } from '../../../shared/theme/tokens';
import { Card } from '../../../shared/ui/Card';
import { Icon } from '../../../shared/ui/Icon';
import { ProgressBar } from '../../../shared/ui/ProgressBar';
import { ContentGroup } from '../../../shared/ui/Screen';
import { SectionHeading } from '../../../shared/ui/SectionHeading';
import { Text } from '../../../shared/ui/Text';

export function ContinueLearning() {
  const { progress } = useLearningProgress();
  const unfinished = lessons.filter((lesson) => {
    const entry = progress[lesson.id];
    return entry && !entry.completed;
  });

  if (!unfinished.length) return null;

  return (
    <ContentGroup>
      <SectionHeading
        title="Continue learning"
        action="View all"
        onPress={() => router.replace('/lessons?filter=in-progress')}
      />
      <Text variant="small" muted>
        Pick up where you left off.
      </Text>
      {unfinished.slice(0, 2).map((lesson) => {
        const index = progress[lesson.id].sectionIndex;
        return (
          <Pressable
            key={lesson.id}
            accessibilityRole="button"
            accessibilityLabel={`Continue ${lesson.title}, reading ${index + 1} of ${lesson.sections.length}`}
            onPress={() => router.push(`/read/${lesson.id}`)}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <Card style={styles.card}>
              <LessonArtwork id={lesson.id} tone={lesson.color} />
              <View style={styles.copy}>
                <Text variant="label">{lesson.title}</Text>
                <Text variant="caption" muted>
                  Reading {index + 1} of {lesson.sections.length}
                </Text>
                <ProgressBar value={(index / lesson.sections.length) * 100} />
                <Text variant="caption">{lesson.sections[index].title}</Text>
              </View>
              <View style={styles.play}>
                <Icon name="play" size={18} />
              </View>
            </Card>
          </Pressable>
        );
      })}
    </ContentGroup>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', padding: 10, gap: 10 },
  copy: { flex: 1, gap: 7 },
  play: {
    width: 36,
    height: 40,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: 8,
    backgroundColor: colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.8 },
});
