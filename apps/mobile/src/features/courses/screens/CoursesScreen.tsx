import { router } from 'expo-router';
import { StyleSheet } from 'react-native';
import { ConnectedCourseCard } from '../components/ConnectedCourseCard';
import { useCourseCatalog } from '../hooks/useCourseCatalog';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { Screen } from '../../../shared/ui/Screen';
import { Card } from '../../../shared/ui/Card';
import { Text } from '../../../shared/ui/Text';
import { Button } from '../../../shared/ui/Button';

export function CoursesScreen() {
  const { state, reload } = useCourseCatalog();
  return (
    <Screen
      tabs
      loadingMessage={state.status === 'loading' ? 'Loading the course library…' : undefined}
    >
      <PageHeader title="Course library" back />
      <Text variant="heading" accessibilityRole="header">
        Find your next study
      </Text>
      <Text muted>
        Explore the course outlines and find a subject you would like to spend time with.
      </Text>
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
          <Text variant="title">More studies are on the way</Text>
          <Text variant="small">
            There are no published courses in the library yet. You can explore the sample course
            below.
          </Text>
          <Button label="Refresh library" variant="outline" onPress={reload} icon="refresh-cw" />
        </Card>
      )}
      {(state.status === 'error' || state.status === 'unconfigured') && (
        <Card shadow={false} style={styles.group}>
          <Text variant="title">
            {state.status === 'unconfigured'
              ? 'Course library unavailable'
              : 'We couldn’t load the library'}
          </Text>
          <Text variant="small">
            {state.status === 'unconfigured'
              ? 'The course library is unavailable right now. Please try again later.'
              : 'Please check your connection and try again.'}
          </Text>
          <Button label="Try again" variant="outline" onPress={reload} icon="refresh-cw" />
        </Card>
      )}
      <Card tone="yellow" shadow={false} style={styles.group}>
        <Text variant="caption">SAMPLE COURSE</Text>
        <Text variant="title">Explore before joining</Text>
        <Text variant="small">
          Try the sample lessons and knowledge checks without an account.
        </Text>
        <Button
          label="Explore sample course"
          variant="outline"
          onPress={() => router.push('/lessons/course')}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({ group: { gap: 12 } });
