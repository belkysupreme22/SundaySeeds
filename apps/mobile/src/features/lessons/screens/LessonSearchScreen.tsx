import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { getLessonTopic } from '../data/lessonTopics';
import { getLessonFilter, lessonFilters, useLessonResults } from '../hooks/useLessonResults';
import { LessonCard } from '../components/LessonCard';
import { colors } from '../../../shared/theme/tokens';
import { InputField } from '../../../shared/ui/InputField';
import { Screen, ContentGroup } from '../../../shared/ui/Screen';
import { Text } from '../../../shared/ui/Text';
import { Icon } from '../../../shared/ui/Icon';
import { Button, IconButton } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';

export function LessonSearchScreen() {
  const params = useLocalSearchParams<{ query?: string; topic?: string; filter?: string }>();
  const query = params.query ?? '';
  const topic = getLessonTopic(params.topic);
  const filter = getLessonFilter(params.filter);
  const statusLabel = lessonFilters.find((item) => item.value === filter)?.label ?? 'All lessons';
  const narrowed = Boolean(topic || filter !== 'all');
  const visible = useLessonResults({ query, topic: topic?.name, filter });
  const clearQuery = () => router.setParams({ query: '' });
  const clearFilters = () => router.setParams({ topic: '', filter: 'all' });

  return (
    <Screen tabs>
      <View style={styles.intro}>
        <View style={styles.header}>
          <IconButton
            name="arrow-left"
            label="Back to lessons"
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/lessons'))}
          />
          <View style={styles.words}>
            <Text variant="title" accessibilityRole="header">
              Search lessons
            </Text>
            <Text variant="small" muted>
              Find a story for your next step.
            </Text>
          </View>
        </View>
        <InputField
          icon="search"
          appearance="soft"
          accessibilityLabel="Search lessons by title, topic or scripture"
          placeholder="Search lessons or scripture"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={(value) => router.setParams({ query: value })}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          trailing={
            query.length > 0 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Clear search"
                onPress={clearQuery}
                style={styles.clearSearch}
              >
                <Icon name="x" size={20} />
              </Pressable>
            ) : undefined
          }
        />
        <View style={styles.context}>
          <View style={styles.collection}>
            <Text variant="label">Lessons</Text>
          </View>
          {topic && (
            <SearchContext label={topic.name} onRemove={() => router.setParams({ topic: '' })} />
          )}
          {filter !== 'all' && (
            <SearchContext
              label={statusLabel}
              onRemove={() => router.setParams({ filter: 'all' })}
            />
          )}
        </View>
        {narrowed && (
          <Text variant="small" muted>
            Searching within your selected topic or learning status.
          </Text>
        )}
      </View>
      <ContentGroup>
        <View style={styles.summary}>
          <Text variant="label" accessibilityLiveRegion="polite" style={styles.words}>
            {visible.length} {visible.length === 1 ? 'lesson' : 'lessons'}
            {query.trim() ? ' found' : ' to explore'}
          </Text>
          {narrowed && (
            <Pressable accessibilityRole="button" onPress={clearFilters} style={styles.clear}>
              <Text variant="small">Clear filters</Text>
            </Pressable>
          )}
        </View>
        {visible.map((lesson) => (
          <LessonCard key={lesson.id} lesson={lesson} />
        ))}
        {!visible.length && (
          <Card tone="lavender" shadow={false} style={styles.empty}>
            <Icon name="search" size={26} />
            <Text variant="title">No matching lessons</Text>
            <Text>
              {query.trim()
                ? 'Try a different title, topic or scripture. You can also clear your search.'
                : filter === 'saved'
                  ? 'Bookmark a lesson to find it in Saved, or clear your filters to explore.'
                  : filter === 'completed'
                    ? 'Finish a lesson’s quiz to see it in Completed, or clear your filters.'
                    : filter === 'in-progress'
                      ? 'Start a reading to keep your place, or clear your filters to explore.'
                      : 'Clear your filters to explore the sample collection.'}
            </Text>
            {query.length > 0 && (
              <Button label="Clear search" variant="outline" icon="x" onPress={clearQuery} />
            )}
            {narrowed && (
              <Button label="Search all lessons" variant="dark" onPress={clearFilters} />
            )}
          </Card>
        )}
      </ContentGroup>
      <Text variant="caption" muted>
        Sample lessons · Bookmarks and progress stay on this device.
      </Text>
    </Screen>
  );
}

function SearchContext({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Remove ${label} filter`}
      onPress={onRemove}
      style={styles.contextFilter}
    >
      <Text variant="small" style={styles.contextLabel}>
        {label}
      </Text>
      <Icon name="x" size={16} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  intro: { gap: 12 },
  clearSearch: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  words: { flex: 1, gap: 2 },
  context: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  collection: {
    backgroundColor: colors.lavender,
    borderColor: colors.ink,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  contextFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: '100%',
    minHeight: 44,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: 6,
    backgroundColor: colors.white,
  },
  contextLabel: { flexShrink: 1 },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  clear: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 4 },
  empty: { gap: 12 },
});
