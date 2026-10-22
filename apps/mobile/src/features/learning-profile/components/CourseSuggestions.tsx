import { StyleSheet, View } from 'react-native';
import { colors } from '../../../shared/theme/tokens';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { Icon } from '../../../shared/ui/Icon';
import { Text } from '../../../shared/ui/Text';
import { getCourseSuggestions } from '../data/courseSuggestions';
import { emptyLearningPreferences } from '../types';
import type { LearningPreferencesDraft } from '../types';

export function CourseSuggestions({
  preferences,
  onViewCourse,
  onBrowse,
  catalog = false,
}: {
  preferences: LearningPreferencesDraft;
  onViewCourse: () => void;
  onBrowse: () => void;
  catalog?: boolean;
}) {
  const suggestions = getCourseSuggestions(catalog ? emptyLearningPreferences : preferences);

  return (
    <View style={styles.section}>
      <Text variant="heading" accessibilityRole="header">
        {catalog ? 'Explore courses' : 'A few places to start'}
      </Text>
      <Text muted>Explore the available course and choose what feels right for you.</Text>
      {suggestions.map((course) => (
        <Card key={course.id} style={styles.card}>
          <View style={styles.art} accessible={false}>
            <Icon name="book-open" size={32} />
          </View>
          <Text variant="caption">SAMPLE COURSE</Text>
          <Text variant="title" accessibilityRole="header">
            {course.title}
          </Text>
          <Text variant="small" muted>
            {course.moduleCount} modules · {course.lessonCount} lessons
          </Text>
          <Text variant="small">{course.description}</Text>
          {!catalog && (
            <View style={styles.reason}>
              <Text variant="small">{course.reason}</Text>
            </View>
          )}
          {!catalog && course.lessonSuggestion && (
            <View style={styles.lesson}>
              <Text variant="label">A lesson you may enjoy</Text>
              <Text variant="small">{course.lessonSuggestion.title}</Text>
              <Text variant="small" muted>
                About {course.lessonSuggestion.durationMinutes} minutes of reading
              </Text>
              <Text variant="small" muted>
                Find it in the course curriculum. You can follow the course in order.
              </Text>
            </View>
          )}
          <Button label="View course" onPress={onViewCourse} />
        </Card>
      ))}
      {!catalog && <Button label="View all courses" variant="outline" onPress={onBrowse} />}
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
    backgroundColor: colors.lavender,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: 10,
  },
  reason: { backgroundColor: colors.mint, borderRadius: 8, padding: 12 },
  lesson: { gap: 4, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 12 },
});
