import { router } from 'expo-router';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { lessons } from '../data/lessons';
import { lessonTopics } from '../data/lessonTopics';
import { Screen } from '../../../shared/ui/Screen';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { Card } from '../../../shared/ui/Card';
import { Text } from '../../../shared/ui/Text';
import { Icon } from '../../../shared/ui/Icon';

export function TopicsScreen() {
  const { width, fontScale } = useWindowDimensions();
  const singleColumn = width < 350 || fontScale >= 1.5;
  const collectionLabel = `${lessons.length} sample ${lessons.length === 1 ? 'lesson' : 'lessons'}`;

  return (
    <Screen tabs>
      <PageHeader title="Explore topics" subtitle="Explore Bible stories by topic." back />
      <View style={styles.grid}>
        {lessonTopics.map((topic) => {
          const count = lessons.filter((lesson) => lesson.category === topic.name).length;
          const countLabel = `${count} ${count === 1 ? 'lesson' : 'lessons'}`;
          return (
            <Pressable
              key={topic.name}
              accessibilityRole="button"
              accessibilityLabel={`${topic.name}, ${countLabel}`}
              accessibilityHint="Show lessons in this topic"
              onPress={() =>
                router.replace({ pathname: '/lessons', params: { topic: topic.name } })
              }
              style={({ pressed }) => [
                styles.topic,
                singleColumn && styles.fullWidth,
                pressed && styles.pressed,
              ]}
            >
              <Card tone={topic.tone} style={styles.card}>
                <View style={styles.icon}>
                  <Icon name={topic.icon} size={25} />
                </View>
                <View style={styles.words}>
                  <Text variant="label" style={styles.name}>
                    {topic.name}
                  </Text>
                  <Text variant="small">{countLabel}</Text>
                </View>
              </Card>
            </Pressable>
          );
        })}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`All lessons, ${collectionLabel}`}
          accessibilityHint="Browse the complete sample collection"
          onPress={() =>
            router.replace({ pathname: '/lessons', params: { topic: '', filter: 'all' } })
          }
          style={({ pressed }) => [styles.topic, styles.fullWidth, pressed && styles.pressed]}
        >
          <Card tone="lavender" style={styles.card}>
            <View style={styles.icon}>
              <Icon name="book-open" size={25} />
            </View>
            <View style={styles.words}>
              <Text variant="label" style={styles.name}>
                All lessons
              </Text>
              <Text variant="small">{collectionLabel}</Text>
            </View>
            <Icon name="arrow-right" size={20} />
          </Card>
        </Pressable>
      </View>
      <Text variant="caption" muted>
        Sample topics · Choose a story to read, reflect and grow.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  topic: { flexBasis: '47%', flexGrow: 1, flexShrink: 1 },
  fullWidth: { flexBasis: '100%' },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 14,
    minHeight: 88,
    borderRadius: 8,
  },
  icon: { width: 28, alignItems: 'center', justifyContent: 'center' },
  words: { flex: 1, minWidth: 0, gap: 3 },
  name: { fontSize: 13, lineHeight: 20 },
  pressed: { opacity: 0.8, transform: [{ translateY: 1 }] },
});
