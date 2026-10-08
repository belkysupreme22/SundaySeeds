import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { lessons } from '../data/lessons';
import { LessonCard } from '../components/LessonCard';
import { useLearningProgress } from '../../progress/hooks/useLearningProgress';
import { colors, fonts } from '../../../shared/theme/tokens';
import { Screen, ContentGroup } from '../../../shared/ui/Screen';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { Text } from '../../../shared/ui/Text';
import { Card } from '../../../shared/ui/Card';
import { Icon } from '../../../shared/ui/Icon';
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
  const params = useLocalSearchParams<{ filter?: string }>();
  const [filter, setFilter] = useState<LessonFilter>(() => getFilter(params.filter));
  const [query, setQuery] = useState('');
  useEffect(() => {
    setFilter(getFilter(params.filter));
  }, [params.filter]);
  const { bookmarks, progress } = useLearningProgress();
  const visible = lessons.filter(
    (l) =>
      (filter !== 'saved' || bookmarks.includes(l.id)) &&
      (filter !== 'completed' || progress[l.id]?.completed) &&
      (filter !== 'in-progress' || (progress[l.id] && !progress[l.id].completed)) &&
      `${l.title} ${l.category} ${l.scripture}`.toLowerCase().includes(query.toLowerCase().trim()),
  );
  return (
    <Screen tabs>
      <PageHeader title="Explore lessons" subtitle="Small steps to a growing faith." />
      <View style={styles.search}>
        <Icon name="search" size={18} />
        <TextInput
          accessibilityLabel="Search lessons"
          placeholder="Search stories, topics or scripture"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
          style={styles.input}
        />
      </View>
      <Card tone="yellow" shadow={false}>
        <Text variant="title">Make room for a little wonder.</Text>
        <Text variant="small">
          Read a story, find a new perspective, and carry it into your week.
        </Text>
      </Card>
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
      <ContentGroup>
        <Text variant="label">
          {visible.length} {visible.length === 1 ? 'lesson' : 'lessons'} to explore
        </Text>
        {visible.map((l) => (
          <LessonCard key={l.id} lesson={l} />
        ))}
        {!visible.length && (
          <Card shadow={false}>
            <Icon name="book-open" />
            <Text variant="title">Nothing here just yet</Text>
            <Text>
              {query.trim()
                ? 'No matching lessons in this view. Try a different search or choose All lessons.'
                : filter === 'saved'
                  ? 'Tap a bookmark on a lesson to keep it here.'
                  : filter === 'completed'
                    ? 'Finish a lesson’s quiz to see it here.'
                    : filter === 'in-progress'
                      ? 'Start a reading to keep your place here. Finished lessons move to Completed.'
                      : 'Try a different search.'}
            </Text>
          </Card>
        )}
      </ContentGroup>
      <Text variant="caption" muted>
        Sample lesson collection · For preview and feedback
      </Text>
    </Screen>
  );
}
const styles = StyleSheet.create({
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
  input: { flex: 1, minHeight: 46, fontFamily: fonts.regular, fontSize: 12, color: colors.ink },
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
