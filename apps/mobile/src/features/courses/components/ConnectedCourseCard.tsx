import { Image, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { shape, targets } from '../../../shared/theme/motion';
import { brandColors, colors } from '../../../shared/theme/tokens';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { Text } from '../../../shared/ui/Text';
import { courseTimeLabel, type CourseOffering } from '../types/catalog';
import { CourseLoadingSkeleton } from './CourseLoadingSkeleton';

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

export function ConnectedCourseCardSkeletons() {
  const { t } = useTranslation();
  return (
    <CourseLoadingSkeleton label={t('courseLibrary.loading')} style={styles.skeletonList}>
      {[0, 1].map((slot) => (
        <Card key={slot} style={styles.card}>
          <View style={[styles.art, styles.skeletonArt]} />
          <View style={[styles.skeletonBlock, styles.skeletonTitle]} />
          <View style={[styles.skeletonBlock, styles.skeletonMeta]} />
          <View style={[styles.skeletonBlock, styles.skeletonLine]} />
          <View style={[styles.skeletonBlock, styles.skeletonLine, styles.skeletonShort]} />
          <View style={[styles.skeletonBlock, styles.skeletonButton]} />
        </Card>
      ))}
    </CourseLoadingSkeleton>
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
  skeletonList: { gap: 22 },
  skeletonArt: { backgroundColor: brandColors.surfaceStrong, borderColor: brandColors.surfaceEdge },
  skeletonBlock: { backgroundColor: brandColors.surfaceStrong, borderRadius: shape.radius.chip },
  skeletonTitle: { height: 20, width: '66%' },
  skeletonMeta: { height: 12, width: '40%' },
  skeletonLine: { height: 12 },
  skeletonShort: { width: '76%' },
  skeletonButton: { height: targets.primaryHeight, borderRadius: shape.radius.button },
});
