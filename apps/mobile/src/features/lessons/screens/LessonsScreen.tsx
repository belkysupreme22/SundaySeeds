import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { getLessonTopic } from '../data/lessonTopics';
import { useLearningProgress } from '../../progress/hooks/useLearningProgress';
import { LessonCard } from '../components/LessonCard';
import { LessonsBrowseHero } from '../components/LessonsBrowseHero';
import { LessonFilters } from '../components/LessonFilters';
import { getLessonFilter, useLessonResults, type LessonFilter } from '../hooks/useLessonResults';
import { colors } from '../../../shared/theme/tokens';
import { Screen, ContentGroup } from '../../../shared/ui/Screen';
import { Text } from '../../../shared/ui/Text';
import { Card } from '../../../shared/ui/Card';
import { Icon } from '../../../shared/ui/Icon';
import { Button, IconButton } from '../../../shared/ui/Button';
export function LessonsScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ filter?: string; topic?: string }>();
  const topic = getLessonTopic(params.topic);
  const [filter, setFilter] = useState<LessonFilter>(() => getLessonFilter(params.filter));
  const [searchFocused, setSearchFocused] = useState(false);
  useEffect(() => {
    setFilter(getLessonFilter(params.filter));
  }, [params.filter]);
  const visible = useLessonResults({ topic: topic?.name, filter });
  const { errorKind } = useLearningProgress();
  const savedViewUnavailable = errorKind === 'load' && filter !== 'all';
  const narrowed = Boolean(topic || filter !== 'all');
  const clearFilters = () => {
    setFilter('all');
    router.setParams({ topic: '', filter: 'all' });
  };
  return (
    <Screen tabs>
      <View style={styles.intro}>
        <View style={styles.header}>
          <View style={styles.headerWords}>
            <Text variant="title" accessibilityRole="header">
              {t('lessons.title')}
            </Text>
            <Text variant="small" muted>
              {t('lessons.subtitle')}
            </Text>
          </View>
          <IconButton
            name="grid"
            label={t('lessons.browseTopics')}
            onPress={() => router.push('/lessons/topics')}
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('lessons.searchLabel')}
          accessibilityHint={t('lessons.searchHint')}
          onPress={() =>
            router.push({
              pathname: '/lessons/search',
              params: { topic: topic?.name ?? '', filter },
            })
          }
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          style={[styles.search, searchFocused && styles.searchFocused]}
        >
          <Icon name="search" size={18} />
          <Text variant="small" muted style={styles.searchLabel}>
            {t('lessons.searchPlaceholder')}
          </Text>
          <Icon name="arrow-right" size={18} />
        </Pressable>
        <LessonsBrowseHero
          title={topic ? t('lessons.growTopic', { topic: topic.name.toLowerCase() }) : t('lessons.heroDefault')}
          description={topic?.description ?? t('lessons.heroDefaultDesc')}
          tone={topic?.tone}
          actionLabel={topic ? t('lessons.allTopics') : t('lessons.exploreTopics')}
          onPress={() => (topic ? router.setParams({ topic: '' }) : router.push('/lessons/topics'))}
        />
      </View>
      {!narrowed && (
        <Button
          label={t('home.browseCourseLabel')}
          variant="outline"
          icon="book-open"
          onPress={() => router.push('/courses')}
        />
      )}
      <ContentGroup>
        <View style={styles.sectionHeader}>
          <View style={styles.headerWords}>
            <Text variant="title" accessibilityRole="header">
              {topic
                ? t('lessons.topicLessons', { topic: topic.name })
                : filter === 'saved'
                  ? t('lessons.savedLessons')
                  : filter === 'completed'
                    ? t('lessons.completedLessons')
                    : filter === 'in-progress'
                      ? t('lessons.inProgress')
                      : t('lessons.sampleLessons')}
            </Text>
            <Text variant="small" muted>
              {savedViewUnavailable
                ? t('lessons.savedUnavailable')
                : `${t(visible.length === 1 ? 'lessons.lessonCount_one' : 'lessons.lessonCount_other', { count: visible.length })} ${narrowed ? t('lessons.inThisView') : t('lessons.toExplore')}`}
            </Text>
          </View>
          {narrowed && (
            <Pressable accessibilityRole="button" onPress={clearFilters} style={styles.clear}>
              <Text variant="small">{t('common.clearAll')}</Text>
            </Pressable>
          )}
        </View>
        <View style={styles.filters}>
          <LessonFilters
            topic={topic?.name}
            filter={filter}
            onApply={(selection) => {
              setFilter(selection.filter);
              router.setParams({ topic: selection.topic ?? '', filter: selection.filter });
            }}
          />
        </View>
        {visible.map((l) => (
          <LessonCard key={l.id} lesson={l} />
        ))}
        {savedViewUnavailable && (
          <Card tone="peach" shadow={false} style={styles.banner}>
            <Text variant="title">{t('lessons.savedUnavailableBanner')}</Text>
            <Text>{t('lessons.savedUnavailableDesc')}</Text>
          </Card>
        )}
        {!visible.length && !savedViewUnavailable && (
          <Card shadow={false} style={styles.banner}>
            <Icon name="book-open" />
            <Text variant="title">{t('lessons.emptyTitle')}</Text>
            <Text>
              {topic
                ? t('lessons.emptyTopic', { topic: topic.name.toLowerCase() })
                : filter === 'saved'
                  ? t('lessons.emptySaved')
                  : filter === 'completed'
                    ? t('lessons.emptyCompleted')
                    : filter === 'in-progress'
                      ? t('lessons.emptyInProgress')
                      : t('lessons.emptyNoTopic')}
            </Text>
            <Button label={t('common.clearFilters')} variant="outline" icon="x" onPress={clearFilters} />
          </Card>
        )}
      </ContentGroup>
      <Text variant="caption" muted>
        {t('lessons.footer')}
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
    paddingVertical: 10,
    minHeight: 48,
    outlineWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchLabel: { flex: 1 },
  searchFocused: {
    borderWidth: 2,
    paddingHorizontal: 11,
    paddingVertical: 9,
    backgroundColor: colors.soft,
  },
  filters: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
});
