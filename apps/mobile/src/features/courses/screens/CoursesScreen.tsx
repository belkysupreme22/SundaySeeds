import { router } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  ConnectedCourseCard,
  ConnectedCourseCardSkeletons,
} from '../components/ConnectedCourseCard';
import { useCourseCatalog } from '../hooks/useCourseCatalog';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { Screen } from '../../../shared/ui/Screen';
import { Card } from '../../../shared/ui/Card';
import { Text } from '../../../shared/ui/Text';
import { Button } from '../../../shared/ui/Button';

export function CoursesScreen() {
  const { t } = useTranslation();
  const { state, reload } = useCourseCatalog();
  return (
    <Screen tabs>
      <PageHeader title={t('courseLibrary.title')} />
      <Text variant="heading" accessibilityRole="header">
        {t('courseLibrary.heading')}
      </Text>
      <Text muted>{t('courseLibrary.description')}</Text>
      {state.status === 'loading' && <ConnectedCourseCardSkeletons />}
      {state.status === 'ready' &&
        state.data.map((course) => (
          <ConnectedCourseCard
            key={course.courseId}
            course={course}
            onView={() =>
              router.push({ pathname: '/courses/[id]', params: { id: course.courseId } })
            }
          />
        ))}
      {state.status === 'ready' && state.data.length === 0 && (
        <Card tone="mint" shadow={false} style={styles.group}>
          <Text variant="title">{t('courseLibrary.emptyTitle')}</Text>
          <Text variant="small">{t('courseLibrary.emptyDescription')}</Text>
          <Button
            label={t('courseLibrary.refresh')}
            variant="outline"
            onPress={reload}
            icon="refresh-cw"
          />
        </Card>
      )}
      {(state.status === 'error' || state.status === 'unconfigured') && (
        <Card shadow={false} style={styles.group}>
          <Text variant="title">
            {state.status === 'unconfigured'
              ? t('courseLibrary.unavailableTitle')
              : t('courseLibrary.errorTitle')}
          </Text>
          <Text variant="small">
            {state.status === 'unconfigured'
              ? t('home.courseLibraryUnavailable')
              : t('courseLibrary.errorDescription')}
          </Text>
          <Button label={t('common.retry')} variant="outline" onPress={reload} icon="refresh-cw" />
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({ group: { gap: 12 } });
