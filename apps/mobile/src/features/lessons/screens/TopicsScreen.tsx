import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { lessons } from '../data/lessons';
import { lessonTopics } from '../data/lessonTopics';
import { Screen } from '../../../shared/ui/Screen';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { Card } from '../../../shared/ui/Card';
import { Text } from '../../../shared/ui/Text';
import { Icon } from '../../../shared/ui/Icon';
import { Button } from '../../../shared/ui/Button';

export function TopicsScreen() {
  return (
    <Screen tabs>
      <PageHeader title="Explore topics" subtitle="A little wonder in every story." back />
      <View style={styles.grid}>
        {lessonTopics.map((topic) => {
          const count = lessons.filter((lesson) => lesson.category === topic.name).length;
          const countLabel = `${count} ${count === 1 ? 'lesson' : 'lessons'}`;
          return (
            <Pressable
              key={topic.name}
              accessibilityRole="button"
              accessibilityLabel={`${topic.name}, ${countLabel}`}
              onPress={() =>
                router.replace({ pathname: '/lessons', params: { topic: topic.name } })
              }
              style={({ pressed }) => [styles.topic, pressed && styles.pressed]}
            >
              <Card tone={topic.tone} style={styles.card}>
                <Icon name={topic.icon} size={27} />
                <View style={styles.words}>
                  <Text variant="label">{topic.name}</Text>
                  <Text variant="caption">{countLabel}</Text>
                </View>
              </Card>
            </Pressable>
          );
        })}
      </View>
      <Button
        label="Explore all lessons"
        variant="outline"
        icon="book-open"
        onPress={() => router.replace('/lessons')}
      />
      <Text variant="caption" muted>
        Sample topics · Choose a story to read, reflect and grow.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  topic: { flexBasis: '45%', flexGrow: 1 },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    minHeight: 104,
    borderRadius: 8,
  },
  words: { flex: 1, gap: 6 },
  pressed: { opacity: 0.8 },
});
