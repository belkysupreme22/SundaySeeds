import { router } from 'expo-router';
import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useCourseCatalog } from '../hooks/useCourseCatalog';
import { Card } from '../../../shared/ui/Card';
import { Text } from '../../../shared/ui/Text';
import { Button } from '../../../shared/ui/Button';
import { brandColors, colors } from '../../../shared/theme/tokens';

export function CourseJourneyCard() {
  const { state } = useCourseCatalog();
  const { t } = useTranslation();
  const { width, fontScale } = useWindowDimensions();
  const stacked = width < 360 || fontScale > 1.2;
  const course = state.status === 'ready' ? state.data[0] : undefined;

  if (!course) {
    return (
      <Card style={styles.card}>
        <Text variant="small" accessibilityLiveRegion="polite">
          {state.status === 'loading'
            ? t('common.loading')
            : state.status === 'ready'
              ? t('home.courseLibraryEmpty')
              : t('home.courseLibraryUnavailable')}
        </Text>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <View style={[styles.header, stacked && styles.stacked]}>
        <View style={styles.art} accessible={false}>
          <Image
            source={require('../../../../assets/orthodox/course_faith_everyday.jpg')}
            style={styles.artImage}
            resizeMode="cover"
            accessible={false}
          />
        </View>
        <View style={styles.words}>
          {course.isDevelopment && <Text variant="caption">{t('home.pilotCourse')}</Text>}
          <Text variant="title" style={styles.title}>
            {course.title}
          </Text>
          <Text variant="small" muted>
            {course.summary}
          </Text>
        </View>
      </View>
      <Button
        label={t('home.viewCourse')}
        onPress={() => router.push({ pathname: '/courses/[id]', params: { id: course.courseId } })}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12, backgroundColor: brandColors.surface },
  title: { color: brandColors.forest },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stacked: { flexDirection: 'column', alignItems: 'flex-start' },
  words: { flex: 1, gap: 4 },
  art: {
    backgroundColor: brandColors.surfaceStrong,
    borderColor: colors.ink,
    borderWidth: 1,
    borderRadius: 8,
    width: 68,
    height: 76,
    overflow: 'hidden',
  },
  artImage: { width: '100%', height: '100%' },
});
