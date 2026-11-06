import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useCourseCatalog } from '../../courses/hooks/useCourseCatalog';
import { brandColors, colors } from '../../../shared/theme/tokens';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { Icon } from '../../../shared/ui/Icon';
import { Text } from '../../../shared/ui/Text';
import { getCourseSuggestion } from '../data/courseSuggestions';
import type { LearningPreferencesDraft } from '../types';

export function CourseSuggestions({
  preferences,
  onViewCourse,
  onBrowse,
}: {
  preferences: LearningPreferencesDraft;
  onViewCourse: (courseId: string) => void;
  onBrowse: () => void;
}) {
  const { t } = useTranslation();
  const { state, reload } = useCourseCatalog();
  const suggestion =
    state.status === 'ready' ? getCourseSuggestion(state.data, preferences) : undefined;

  return (
    <View style={styles.section}>
      <Text variant="heading" accessibilityRole="header">
        Explore courses
      </Text>
      {suggestion ? (
        <Card style={styles.card}>
          <View style={styles.art} accessible={false}>
            <Icon name="book-open" size={32} />
          </View>
          <Text variant="caption">
            {suggestion.course.isDevelopment ? t('home.pilotCourse') : 'Course'}
          </Text>
          <Text variant="title" accessibilityRole="header">
            {suggestion.course.title}
          </Text>
          <Text variant="small" muted>
            {suggestion.course.modules.length} modules ·{' '}
            {suggestion.course.modules.reduce((total, module) => total + module.lessons.length, 0)}{' '}
            lessons
          </Text>
          <Text variant="small">{suggestion.course.summary}</Text>
          {suggestion.matchingTopics.length > 0 && (
            <View style={styles.reason}>
              <Text variant="small">
                Includes studies on {suggestion.matchingTopics.join(', ')}.
              </Text>
            </View>
          )}
          {suggestion.lessonSuggestion && (
            <View style={styles.lesson}>
              <Text variant="label">A lesson you may enjoy</Text>
              <Text variant="small">{suggestion.lessonSuggestion.title}</Text>
              <Text variant="small" muted>
                About {suggestion.lessonSuggestion.estimatedMinutes} minutes
              </Text>
              <Text variant="small" muted>
                Find it in the course curriculum. You can follow the course in order.
              </Text>
            </View>
          )}
          <Button label="View course" onPress={() => onViewCourse(suggestion.course.courseId)} />
        </Card>
      ) : (
        <Card stroke="soft" shadow={false} style={styles.card}>
          <Text variant="small" accessibilityLiveRegion="polite">
            {state.status === 'loading'
              ? t('common.loading')
              : state.status === 'ready'
                ? t('home.courseLibraryEmpty')
                : t('home.courseLibraryUnavailable')}
          </Text>
          {state.status === 'error' && (
            <Button
              label={t('common.retry')}
              variant="outline"
              icon="refresh-cw"
              onPress={reload}
            />
          )}
        </Card>
      )}
      <Button label="View all courses" variant="outline" onPress={onBrowse} />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 16 },
  card: { gap: 12 },
  art: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    width: 64,
    height: 64,
    backgroundColor: brandColors.surface,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: 10,
  },
  reason: { backgroundColor: brandColors.surfaceStrong, borderRadius: 8, padding: 12 },
  lesson: { gap: 4, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 12 },
});
