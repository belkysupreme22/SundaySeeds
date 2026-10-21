import { StyleSheet, View } from 'react-native';
import { colors } from '../../../shared/theme/tokens';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { Icon } from '../../../shared/ui/Icon';
import { Text } from '../../../shared/ui/Text';
import { courseTimeLabel, type CourseOffering } from '../types/catalog';

export function ConnectedCourseCard({
  course,
  onView,
}: {
  course: CourseOffering;
  onView: () => void;
}) {
  const lessonCount = course.modules.reduce((total, module) => total + module.lessons.length, 0);
  const time = courseTimeLabel(course);
  return (
    <Card style={styles.card}>
      <View style={styles.art} accessible={false}>
        <Icon name="book-open" size={32} />
      </View>
      {course.isDevelopment && <Text variant="caption">DEVELOPMENT COURSE</Text>}
      <Text variant="title" accessibilityRole="header">
        {course.title}
      </Text>
      <Text variant="small" muted>
        {course.modules.length} modules · {lessonCount} lessons
      </Text>
      <Text variant="small">{course.summary}</Text>
      {time && (
        <Text variant="small" muted>
          {time}
        </Text>
      )}
      {course.topics.length > 0 && <Text variant="small">{course.topics.join(' · ')}</Text>}
      <Button label="View course" onPress={onView} />
    </Card>
  );
}

const styles = StyleSheet.create({
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
});
