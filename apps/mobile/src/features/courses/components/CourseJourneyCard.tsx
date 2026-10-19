import { router } from 'expo-router';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { sampleCourse } from '../data/sampleCourse';
import { useCourseJourney } from '../hooks/useCourseJourney';
import { Card } from '../../../shared/ui/Card';
import { Text } from '../../../shared/ui/Text';
import { Button } from '../../../shared/ui/Button';
import { Icon } from '../../../shared/ui/Icon';
import { colors } from '../../../shared/theme/tokens';

export function CourseJourneyCard() {
  const { available, lessons, completed, started, finished, next, status } = useCourseJourney();
  const { width, fontScale } = useWindowDimensions();
  const stacked = width < 360 || fontScale > 1.2;
  return (
    <Card style={styles.card}>
      <View style={[styles.header, stacked && styles.stacked]}>
        <View style={styles.art} accessible={false}>
          <Icon name="book-open" size={32} />
        </View>
        <View style={styles.words}>
          <Text variant="caption">SAMPLE COURSE · {sampleCourse.modules.length} MODULES</Text>
          <Text variant="title">{sampleCourse.title}</Text>
          <Text variant="small" muted>
            {lessons.length} Bible studies · Prayer, trust, courage & kindness
          </Text>
        </View>
      </View>
      <Text variant="small">{status}</Text>
      {available && lessons.length > 0 && (
        <View
          accessibilityRole="progressbar"
          accessibilityLabel="Lesson quizzes finished"
          accessibilityValue={{ min: 0, max: lessons.length, now: completed }}
          style={styles.track}
        >
          <View style={[styles.fill, { width: `${(completed / lessons.length) * 100}%` }]} />
        </View>
      )}
      {available && started && next && (
        <Text variant="small" muted>
          {finished
            ? 'You’ve completed every knowledge check. Return to a lesson for a fresh reflection.'
            : `Up next: ${next.title}`}
        </Text>
      )}
      {available && started && next && (
        <Button
          label={finished ? 'Revisit first lesson' : 'Continue course'}
          onPress={() => router.push(`/lessons/${next.id}`)}
        />
      )}
      <Button
        label={available && started ? 'View curriculum' : 'Explore course'}
        variant={available && started ? 'outline' : 'primary'}
        onPress={() => router.push('/lessons/course')}
      />
    </Card>
  );
}
const styles = StyleSheet.create({
  card: { gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stacked: { flexDirection: 'column', alignItems: 'flex-start' },
  words: { flex: 1, gap: 4 },
  art: {
    backgroundColor: colors.lavender,
    borderColor: colors.ink,
    borderWidth: 1,
    borderRadius: 8,
    width: 68,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.soft, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.primary },
});
