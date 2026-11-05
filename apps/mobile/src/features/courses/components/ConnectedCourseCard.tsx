import { Image, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { brandColors, colors } from '../../../shared/theme/tokens';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { Text } from '../../../shared/ui/Text';
import { courseTimeLabel, type CourseOffering } from '../types/catalog';

export function ConnectedCourseCard({
  course,
  onView,
}: {
  course: CourseOffering;
  onView: () => void;
}) {
  const { t } = useTranslation();
  const lessonCount = course.modules.reduce((total, module) => total + module.lessons.length, 0);
  const time = courseTimeLabel(course);
  return (
    <Card style={styles.card}>
      <View style={styles.art} accessible={false}>
        <Image
          source={require('../../../../assets/orthodox/course_faith_everyday.jpg')}
          style={styles.artImage}
          resizeMode="cover"
        />
      </View>
      {course.isDevelopment && <Text variant="caption">{t('home.pilotCourse')}</Text>}
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
    alignSelf: 'flex-start',
    width: 64,
    height: 64,
    backgroundColor: brandColors.surface,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: 10,
    overflow: 'hidden',
  },
  artImage: { width: '100%', height: '100%' },
});
