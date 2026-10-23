import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useConnectedLesson } from '../hooks/useConnectedLesson';
import { Screen } from '../../../shared/ui/Screen';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { Card } from '../../../shared/ui/Card';
import { Text } from '../../../shared/ui/Text';
import { Button } from '../../../shared/ui/Button';

export function ConnectedLessonScreen() {
  const { id, lessonId } = useLocalSearchParams<{
    id?: string | string[];
    lessonId?: string | string[];
  }>();
  const courseId = typeof id === 'string' ? id : '';
  const { state, reload } = useConnectedLesson(
    courseId,
    typeof lessonId === 'string' ? lessonId : '',
  );
  const lesson = state.status === 'ready' ? state.data.lesson : null;
  return (
    <Screen tabs loadingMessage={state.status === 'loading' ? 'Opening your lesson…' : undefined}>
      <PageHeader title="Your lesson" back />
      {(state.status === 'signed_out' || state.status === 'unverified') && (
        <Card tone="mint" style={styles.group}>
          <Text variant="title">
            {state.status === 'signed_out'
              ? 'Sign in to open your lesson'
              : 'Verify your email to continue'}
          </Text>
          <Text variant="small">
            Only your verified account’s active course enrollment can open this lesson.
          </Text>
          <Button
            label={state.status === 'signed_out' ? 'Sign in' : 'Check verification'}
            onPress={() =>
              router.push(state.status === 'signed_out' ? '/sign-in' : '/verify-email')
            }
          />
        </Card>
      )}
      {state.status === 'error' && (
        <Card style={styles.group} shadow={false}>
          <Text variant="title">We couldn’t open this lesson</Text>
          <Text variant="small" accessibilityRole="alert">
            {state.message}
          </Text>
          <Button label="Try again" variant="outline" onPress={reload} icon="refresh-cw" />
        </Card>
      )}
      {lesson && (
        <>
          <Card tone="lavender" style={styles.group}>
            <Text variant="heading" accessibilityRole="header">
              {lesson.title}
            </Text>
            <Text>{lesson.subtitle}</Text>
            <Text variant="small">
              {lesson.scripture} · About {lesson.estimatedMinutes} min of reading
            </Text>
            <Text variant="small">{lesson.intro}</Text>
          </Card>
          <View style={styles.group}>
            <Text variant="title" accessibilityRole="header">
              In this lesson
            </Text>
            {lesson.outcomes.map((outcome, index) => (
              <View key={index} style={styles.outcome}>
                <Text variant="label">{outcome.title}</Text>
                <Text variant="small">{outcome.description}</Text>
              </View>
            ))}
          </View>
          {lesson.sections.map((section) => (
            <View key={section.id} style={styles.group}>
              <Text variant="title" accessibilityRole="header">
                {section.title}
              </Text>
              <Text>{section.body}</Text>
            </View>
          ))}
          <Card tone="yellow" shadow={false} style={styles.group}>
            <Text variant="title">A verse to remember</Text>
            <Text>{lesson.memoryVerse.text}</Text>
            <Text variant="small">{lesson.memoryVerse.reference}</Text>
          </Card>
          <Card tone="mint" shadow={false} style={styles.group}>
            <Text variant="title">Pause and reflect</Text>
            <Text variant="small">
              Take the reflection prompts at your own pace. You do not need to submit a personal
              response.
            </Text>
            <Button
              label="Open knowledge check"
              icon="arrow-right"
              onPress={() =>
                router.push({
                  pathname: '/courses/[id]/quiz/[lessonId]',
                  params: { id: courseId, lessonId: lesson.id },
                })
              }
            />
          </Card>
        </>
      )}
      <Button
        label="Back to your course"
        variant="outline"
        onPress={() => router.dismissTo({ pathname: '/courses/[id]', params: { id: courseId } })}
      />
    </Screen>
  );
}
const styles = StyleSheet.create({ group: { gap: 12 }, outcome: { gap: 4 } });
