import { StyleSheet } from 'react-native';
import type { useCourseQuizProgress } from '../hooks/useCourseQuizProgress';
import { Card } from '../../../shared/ui/Card';
import { Text } from '../../../shared/ui/Text';
import { Button } from '../../../shared/ui/Button';
import { ProgressBar } from '../../../shared/ui/ProgressBar';

export function ConnectedQuizProgress({
  progress,
  releaseId,
}: {
  progress: ReturnType<typeof useCourseQuizProgress>;
  releaseId: string;
}) {
  const { state, reload } = progress;
  if (state.status === 'hidden') return null;
  const data = state.status === 'ready' ? state.data : null;
  const available = data?.available && data.assessmentAvailable && data.releaseId === releaseId;
  return (
    <Card tone="lavender" shadow={false} style={styles.group}>
      <Text variant="title">Your course progress</Text>
      {state.status === 'loading' ? (
        <Text variant="small">Loading your knowledge checks…</Text>
      ) : state.status === 'error' ? (
        <>
          <Text variant="small" accessibilityRole="alert">
            {state.message}
          </Text>
          <Button label="Reload progress" variant="outline" onPress={reload} />
        </>
      ) : data && available && data.requiredCount !== null && data.completedCount !== null ? (
        <>
          <Text variant="label">
            {data.completedCount} of {data.requiredCount} knowledge checks finished
          </Text>
          <ProgressBar
            value={Math.round((100 * data.completedCount) / data.requiredCount)}
            label="Course knowledge checks"
            valueText={`${data.completedCount} of ${data.requiredCount} knowledge checks finished`}
          />
          <Text variant="small">
            {data.completed
              ? 'Course complete. Keep practising whenever you like.'
              : 'Finish each lesson’s knowledge check to complete this course. Every score counts.'}
          </Text>
        </>
      ) : (
        <Text variant="small">
          Your knowledge-check progress is unavailable for this edition right now.
        </Text>
      )}
    </Card>
  );
}
const styles = StyleSheet.create({ group: { gap: 12 } });
