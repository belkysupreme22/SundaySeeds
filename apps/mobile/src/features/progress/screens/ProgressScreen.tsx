import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { lessons } from '../../lessons/data/lessons';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { colors } from '../../../shared/theme/tokens';
import { Screen, ContentGroup } from '../../../shared/ui/Screen';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { Text } from '../../../shared/ui/Text';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { Icon } from '../../../shared/ui/Icon';
import { ProgressBar } from '../../../shared/ui/ProgressBar';
export function ProgressScreen() {
  const { progress, bookmarks } = useLearningProgress();
  const entries = Object.values(progress);
  const finished = entries.filter((p) => p.completed).length;
  const scores = entries.flatMap((p) => (p.bestScore === null ? [] : [p.bestScore]));
  const average = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : null;
  return (
    <Screen tabs>
      <PageHeader title="Your little victories" subtitle="Every step forward matters." />
      <Card tone="lavender">
        <View style={styles.hero}>
          <View style={styles.words}>
            <Text variant="heading">Keep growing.</Text>
            <Text variant="small">
              A story learned. A kindness shared. A little more faith each day.
            </Text>
          </View>
          <Icon name="sun" size={48} />
        </View>
      </Card>
      <View style={styles.stats}>
        <Card tone="mint" shadow={false} style={styles.stat}>
          <Icon name="check-circle" />
          <Text variant="heading">{finished}</Text>
          <Text variant="small">Lessons completed</Text>
        </Card>
        <Card tone="yellow" shadow={false} style={styles.stat}>
          <Icon name="award" />
          <Text variant="heading">{average === null ? '—' : `${average}%`}</Text>
          <Text variant="small">Average best score</Text>
        </Card>
      </View>
      <Card shadow={false}>
        <View style={styles.between}>
          <Text variant="label">Your learning journey</Text>
          <Text variant="small">
            {finished} / {lessons.length}
          </Text>
        </View>
        <View style={styles.track}>
          <ProgressBar value={(finished / lessons.length) * 100} />
        </View>
        <Text variant="caption" muted>
          Lessons are completed when you finish their quiz.
        </Text>
      </Card>
      {!entries.length && (
        <Card tone="peach" shadow={false}>
          <Text variant="title">Your first seed starts here</Text>
          <Text style={styles.space}>Open a lesson and see where it takes you.</Text>
          <Button label="Find a lesson" onPress={() => router.replace('/lessons')} />
        </Card>
      )}
      <ContentGroup>
        <Text variant="title">Lesson progress</Text>
        {lessons.map((l) => {
          const p = progress[l.id];
          const percent = p?.completed
            ? 100
            : p
              ? Math.round((p.sectionIndex / l.sections.length) * 100)
              : 0;
          return (
            <Pressable
              key={l.id}
              accessibilityRole="button"
              onPress={() => router.push(`/lessons/${l.id}`)}
            >
              <Card shadow={false} style={styles.lesson}>
                <View style={[styles.badge, { backgroundColor: colors[l.color] }]}>
                  <Icon name={p?.completed ? 'check' : 'book-open'} />
                </View>
                <View style={styles.words}>
                  <Text variant="label">{l.title}</Text>
                  <ProgressBar value={percent} color={colors[l.color]} />
                  <Text variant="caption" muted>
                    {p?.completed
                      ? `Completed · Best quiz ${p.bestScore}%`
                      : p
                        ? `Reading ${p.sectionIndex + 1} of ${l.sections.length}`
                        : 'Ready when you are'}
                  </Text>
                </View>
                <Icon name="chevron-right" size={18} />
              </Card>
            </Pressable>
          );
        })}
      </ContentGroup>
      <Text variant="caption" muted>
        {bookmarks.length} saved lessons · Progress is stored on this device, with no cloud account
        yet.
      </Text>
    </Screen>
  );
}
const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  words: { flex: 1, gap: 7 },
  stats: { flexDirection: 'row', gap: 12 },
  stat: { flex: 1, gap: 6 },
  between: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  track: { marginVertical: 12 },
  lesson: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  badge: { padding: 10, borderWidth: 1, borderColor: colors.ink, borderRadius: 7 },
  space: { marginVertical: 12 },
});
