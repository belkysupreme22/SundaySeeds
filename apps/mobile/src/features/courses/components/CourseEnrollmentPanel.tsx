import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import type { CourseOffering } from '../types/catalog';
import type { EnrollmentState } from '../types/enrollment';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { Text } from '../../../shared/ui/Text';

export function CourseEnrollmentPanel({
  course,
  state,
  onJoin,
  onReload,
  onRefreshCourse,
}: {
  course: CourseOffering | null;
  state: EnrollmentState;
  onJoin: (revision: number) => void;
  onReload: () => void;
  onRefreshCourse: () => void;
}) {
  if (state.status === 'loading' || state.status === 'joining') return null;
  if (state.status === 'signed_out' || state.status === 'unverified')
    return (
      <Card tone="mint" shadow={false} style={styles.group}>
        <Text variant="title">
          {state.status === 'signed_out'
            ? 'Make room for your next study'
            : 'Verify your email to continue'}
        </Text>
        <Text variant="small">
          {state.status === 'signed_out'
            ? 'Sign in or create an account with a verified email to join. After signing in, return here through Browse courses and choose Join.'
            : 'Confirm your email, then return to this course to join. Verification does not enroll you automatically.'}
        </Text>
        <Button
          label={state.status === 'signed_out' ? 'Sign in' : 'Check verification'}
          onPress={() => router.push(state.status === 'signed_out' ? '/sign-in' : '/verify-email')}
        />
        {state.status === 'signed_out' && (
          <Button
            label="Create account"
            variant="outline"
            onPress={() => router.push('/sign-up')}
          />
        )}
      </Card>
    );
  if (state.status === 'error' || state.status === 'uncertain' || state.status === 'changed')
    return (
      <Card shadow={false} style={styles.group}>
        <Text variant="title">
          {state.status === 'uncertain'
            ? 'Let’s check your enrollment'
            : state.status === 'changed'
              ? 'Course updated'
              : 'Course access unavailable'}
        </Text>
        <Text variant="small" accessibilityRole="alert">
          {state.message}
        </Text>
        <Button
          label={state.status === 'changed' ? 'Refresh course details' : 'Check enrollment'}
          variant="outline"
          onPress={state.status === 'changed' ? onRefreshCourse : onReload}
          icon="refresh-cw"
        />
      </Card>
    );
  if (state.status !== 'ready') return null;
  const enrolled = state.enrollment;
  if (!enrolled)
    return (
      <Card tone="mint" shadow={false} style={styles.group}>
        <Text variant="title">
          {course?.joinsOpen ? 'Begin this study' : 'Enrollment opens soon'}
        </Text>
        <Text variant="small">
          {course?.joinsOpen
            ? 'Join this edition to open its lessons. Your course stays on this edition when new editions are released.'
            : 'You can explore the course outline. Joining is not available right now.'}
        </Text>
        {course?.joinsOpen && (
          <Button label="Join course" onPress={() => onJoin(course.offeringRevision)} />
        )}
      </Card>
    );
  if (enrolled.state === 'revoked' || !enrolled.available)
    return (
      <Card shadow={false} style={styles.group}>
        <Text variant="title">
          {enrolled.state === 'revoked'
            ? 'Course access no longer active'
            : 'Your edition is unavailable'}
        </Text>
        <Text variant="small">
          {enrolled.state === 'revoked'
            ? 'Your enrollment record is retained, but this account can no longer open its lessons.'
            : 'Your enrollment is saved. This edition’s lessons are unavailable right now.'}
        </Text>
        <Button label="Check access again" variant="outline" onPress={onReload} icon="refresh-cw" />
      </Card>
    );
  return (
    <Card tone="mint" shadow={false} style={styles.group}>
      <Text variant="caption">YOUR STUDY · EDITION {enrolled.editionNumber}</Text>
      <Text variant="title">{enrolled.title}</Text>
      <Text variant="small">You’re enrolled. Choose a lesson from your joined edition.</Text>
      {course && course.releaseId !== enrolled.releaseId && (
        <Text variant="small">
          The current offering is a different edition. Your lessons remain on edition{' '}
          {enrolled.editionNumber}.
        </Text>
      )}
      {enrolled.modules.map((module) => (
        <View key={module.id} style={styles.group}>
          <Text variant="label">{module.title}</Text>
          {module.lessons.map((lesson) => (
            <Button
              key={lesson.id}
              label={lesson.title}
              variant="outline"
              icon="book-open"
              onPress={() =>
                router.push({
                  pathname: '/courses/[id]/lessons/[lessonId]',
                  params: { id: enrolled.courseId, lessonId: lesson.id },
                })
              }
            />
          ))}
        </View>
      ))}
    </Card>
  );
}
const styles = StyleSheet.create({ group: { gap: 12 } });
