import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { lessons } from '../data/lessons';
import { getLessonTopic } from '../data/lessonTopics';
import { LessonCard } from '../components/LessonCard';
import { LessonsBrowseHero } from '../components/LessonsBrowseHero';
import { useLearningProgress } from '../../progress/hooks/useLearningProgress';
import { colors, fonts } from '../../../shared/theme/tokens';
import { Screen, ContentGroup } from '../../../shared/ui/Screen';
import { Text } from '../../../shared/ui/Text';
import { Card } from '../../../shared/ui/Card';
import { Icon } from '../../../shared/ui/Icon';
import { Button, IconButton } from '../../../shared/ui/Button';
const filters = [
  { value: 'all', label: 'All lessons' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'saved', label: 'Saved' },
  { value: 'completed', label: 'Completed' },
] as const;
type LessonFilter = (typeof filters)[number]['value'];

function getFilter(value?: string): LessonFilter {
  return filters.find((filter) => filter.value === value)?.value ?? 'all';
}

export function LessonsScreen() {
  const params = useLocalSearchParams<{ filter?: string; topic?: string }>();
  const topic = getLessonTopic(params.topic);
  const [filter, setFilter] = useState<LessonFilter>(() => getFilter(params.filter));
  const [query, setQuery] = useState('');
  useEffect(() => {
    setFilter(getFilter(params.filter));
  }, [params.filter]);
  const { bookmarks, progress } = useLearningProgress();
  const narrowed = Boolean(topic || query.trim() || filter !== 'all');
  const clearFilters = () => {
    setQuery('');
    setFilter('all');
    router.setParams({ topic: '', filter: 'all' });
  };
  const visible = lessons.filter(
    (l) =>
      (!topic || l.category === topic.name) &&
      (filter !== 'saved' || bookmarks.includes(l.id)) &&
      (filter !== 'completed' || progress[l.id]?.completed) &&
      (filter !== 'in-progress' || (progress[l.id] && !progress[l.id].completed)) &&
      `${l.title} ${l.category} ${l.scripture}`.toLowerCase().includes(query.toLowerCase().trim()),
  );
  return (
    <Screen tabs>
      <View style={styles.intro}>
        <View style={styles.header}>
          <View style={styles.headerWords}>
            <Text variant="title" accessibilityRole="header">
              Browse lessons
            </Text>
            <Text variant="small" muted>
              Discover a story. Grow in faith.
            </Text>
          </View>
          <IconButton
            name="grid"
            label="Browse topics"
            onPress={() => router.push('/lessons/topics')}
          />
        </View>
        <View style={styles.search}>
          <Icon name="search" size={18} />
          <TextInput
            accessibilityLabel="Search lessons by title, topic or scripture"
            placeholder="Search lessons or scripture"
            placeholderTextColor={colors.muted}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            returnKeyType="search"
            style={styles.input}
          />
          {query.length > 0 && (
            <IconButton name="x" label="Clear search" onPress={() => setQuery('')} />
          )}
        </View>
        <LessonsBrowseHero
          title={topic ? `Grow in ${topic.name.toLowerCase()}` : 'Small stories.\nLasting faith.'}
          description={topic?.description ?? 'Find a Bible story to carry into your week.'}
          tone={topic?.tone ?? 'lavender'}
          actionLabel={topic ? 'All topics' : 'Explore topics'}
          onPress={() => (topic ? router.setParams({ topic: '' }) : router.push('/lessons/topics'))}
        />
      </View>
      <ContentGroup>
        <View style={styles.sectionHeader}>
          <View style={styles.headerWords}>
            <Text variant="title" accessibilityRole="header">
              {topic ? `${topic.name} lessons` : 'Sample lessons'}
            </Text>
            <Text variant="small" muted>
              {visible.length} {visible.length === 1 ? 'lesson' : 'lessons'}
              {narrowed ? ' in this view' : ' to explore'}
            </Text>
          </View>
          {narrowed && (
            <Pressable accessibilityRole="button" onPress={clearFilters} style={styles.clear}>
              <Text variant="small">Clear all</Text>
            </Pressable>
          )}
        </View>
        <View style={styles.filters}>
          {filters.map((f) => (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: f.value === filter }}
              key={f.value}
              onPress={() => setFilter(f.value)}
              style={[styles.filter, f.value === filter && { backgroundColor: colors.lavender }]}
            >
              <Text variant="small">{f.label}</Text>
            </Pressable>
          ))}
        </View>
        {visible.map((l) => (
          <LessonCard key={l.id} lesson={l} />
        ))}
        {!visible.length && (
          <Card shadow={false} style={styles.banner}>
            <Icon name="book-open" />
            <Text variant="title">Nothing here just yet</Text>
            <Text>
              {query.trim()
                ? 'No matching lessons in this view. Try another search or clear your filters.'
                : topic
                  ? `No ${topic.name.toLowerCase()} lessons match this view yet. Try All lessons or another topic.`
                  : filter === 'saved'
                    ? 'Tap a bookmark on a lesson to keep it here.'
                    : filter === 'completed'
                      ? 'Finish a lesson’s quiz to see it here.'
                      : filter === 'in-progress'
                        ? 'Start a reading to keep your place here. Finished lessons move to Completed.'
                        : 'Try a different search.'}
            </Text>
            <Button
              label="Clear filters"
              variant="outline"
              icon="x"
              onPress={clearFilters}
            />
          </Card>
        )}
      </ContentGroup>
      <Text variant="caption" muted>
        Sample lessons · Bookmarks and progress stay on this device.
      </Text>
    </Screen>
  );
}
const styles = StyleSheet.create({
  intro: { gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerWords: { flex: 1, gap: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  clear: { minHeight: 44, minWidth: 44, justifyContent: 'center', paddingHorizontal: 4 },
  banner: { gap: 12 },
  search: {
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: 8,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 48,
    paddingVertical: 10,
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.ink,
  },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filter: {
    flexGrow: 1,
    flexBasis: '45%',
    minHeight: 44,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
});
