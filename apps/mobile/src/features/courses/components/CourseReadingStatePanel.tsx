import { StyleSheet } from 'react-native';
import type { ConnectedLesson } from '../types/enrollment';
import type { useCourseReadingState } from '../hooks/useCourseReadingState';
import { Card } from '../../../shared/ui/Card';
import { Text } from '../../../shared/ui/Text';
import { Button } from '../../../shared/ui/Button';

type ReadingSync = ReturnType<typeof useCourseReadingState>;
export function CourseReadingStatePanel({
  sync,
  lesson,
}: {
  sync: ReadingSync;
  lesson: ConnectedLesson;
}) {
  const { state } = sync;
  if (state.status === 'hidden') return null;
  const saved =
    state.status === 'ready'
      ? lesson.lesson.sections.find((section) => section.id === state.data.sectionId)
      : null;
  return (
    <Card tone="mint" shadow={false} style={styles.group}>
      <Text variant="title">Your reading place</Text>
      {state.status === 'loading' ? (
        <Text variant="small">Loading your saved place and bookmark…</Text>
      ) : state.status === 'error' ? (
        <>
          <Text variant="small" accessibilityRole="alert">
            {state.message}
          </Text>
          <Button label="Reload saved state" variant="outline" onPress={sync.reload} />
        </>
      ) : state.status === 'ready' ? (
        <>
          <Text variant="small" accessibilityLiveRegion="polite">
            {state.pending ? 'Last confirmed place' : 'Saved place'}:{' '}
            {saved?.title ?? 'Not set yet'}
          </Text>
          {state.pending && (
            <Text variant="caption">
              Last confirmed bookmark: {state.data.isBookmarked ? 'On' : 'Off'}
            </Text>
          )}
          <Button
            label={state.data.isBookmarked ? 'Remove lesson bookmark' : 'Bookmark this lesson'}
            variant="outline"
            icon="bookmark"
            disabled={state.busy || state.pending !== null}
            onPress={sync.toggleBookmark}
          />
          {state.problem && (
            <>
              <Text variant="small" accessibilityRole="alert">
                {state.problem.message}
              </Text>
              <Text variant="caption" muted>
                {state.problem.uncertain
                  ? 'Saving is not confirmed. Retry the same change, or reload to see the saved state.'
                  : state.problem.conflict
                    ? 'Load the saved state before choosing your place or bookmark again.'
                    : 'Your last confirmed state is shown above. Reload to check it before making another change.'}
              </Text>
              {!state.problem.conflict && (
                <Button label="Retry same change" variant="outline" onPress={sync.retry} />
              )}
              <Button label="Reload saved state" variant="outline" onPress={sync.reload} />
            </>
          )}
        </>
      ) : null}
    </Card>
  );
}
export function SectionReadingPlace({ sync, sectionId }: { sync: ReadingSync; sectionId: string }) {
  if (sync.state.status !== 'ready') return null;
  const { state } = sync;
  const saved = state.data.sectionId === sectionId;
  return (
    <>
      {saved && (
        <Text variant="caption">{state.pending ? 'Last confirmed place' : 'Your saved place'}</Text>
      )}
      <Button
        label={saved && !state.pending ? 'Place saved here' : 'Save my place here'}
        icon="map-pin"
        variant="outline"
        disabled={saved || state.busy || state.pending !== null}
        onPress={() => sync.savePosition(sectionId)}
      />
    </>
  );
}
const styles = StyleSheet.create({ group: { gap: 12 } });
