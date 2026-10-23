import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useConnectedQuiz } from '../hooks/useConnectedQuiz';
import { QuizChoice } from '../components/QuizChoice';
import { ConnectedQuizResult } from './ConnectedQuizResult';
import { Screen, ContentGroup } from '../../../shared/ui/Screen';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { Text } from '../../../shared/ui/Text';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { Icon } from '../../../shared/ui/Icon';
import { ProgressBar } from '../../../shared/ui/ProgressBar';

export function ConnectedQuizScreen({
  courseId,
  lessonId,
}: {
  courseId: string;
  lessonId: string;
}) {
  const { state, select, check, next, finish, retry, reload } = useConnectedQuiz(
    courseId,
    lessonId,
  );
  const goToCourse = () =>
    router.dismissTo({ pathname: '/courses/[id]', params: { id: courseId } });

  if (state.status === 'finished') {
    return (
      <ConnectedQuizResult
        attempt={state.attempt}
        result={state.result}
        onRetry={retry}
        onCourse={() =>
          router.dismissTo({
            pathname: '/courses/[id]',
            params: { id: state.result.receipt.courseId },
          })
        }
        busy={state.busy}
        message={state.message}
      />
    );
  }

  if (state.status !== 'ready') {
    return (
      <Screen
        loadingMessage={state.status === 'loading' ? 'Opening your knowledge check…' : undefined}
      >
        <PageHeader title="Knowledge check" back />
        {(state.status === 'signed_out' || state.status === 'unverified') && (
          <Card tone="mint" style={styles.group}>
            <Text variant="title">
              {state.status === 'signed_out'
                ? 'Sign in to continue'
                : 'Verify your email to continue'}
            </Text>
            <Text variant="small">
              Your course checks and results belong to your verified account.
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
            <Text variant="title">
              {state.uncertain ? 'Let’s check your latest answer' : 'This check needs attention'}
            </Text>
            <Text variant="small" accessibilityRole="alert">
              {state.message}
            </Text>
            {state.uncertain && (
              <Text variant="small" muted>
                We’ll check the same attempt before you continue. A new attempt won’t be started.
              </Text>
            )}
            <Button label="Check again" variant="outline" icon="refresh-cw" onPress={reload} />
          </Card>
        )}
        <Button label="Back to your course" variant="outline" onPress={goToCourse} />
      </Screen>
    );
  }

  const question = state.attempt.questions[state.index];
  const feedback = question.checkedAnswer;
  const checked = feedback !== null;
  const selected = feedback?.optionId ?? state.selectedOptionId;
  const last = state.index === state.attempt.questions.length - 1;
  const checkedCount = state.attempt.questions.filter((item) => item.checkedAnswer !== null).length;
  const checkedPercent = Math.round((checkedCount / state.attempt.questions.length) * 100);

  return (
    <Screen
      key={`${state.attempt.attemptId}/${state.index}`}
      loadingMessage={
        state.busy === 'checking'
          ? 'Checking your answer…'
          : state.busy === 'finishing'
            ? 'Recording your result…'
            : undefined
      }
      footer={
        <Button
          label={!checked ? 'Check answer' : last ? 'Finish quiz' : 'Next question'}
          icon={!checked ? 'check' : 'arrow-right'}
          disabled={selected === null || state.busy !== null}
          onPress={() => {
            if (!checked) check();
            else if (last) finish();
            else next();
          }}
        />
      }
    >
      <PageHeader title="Quiz time" subtitle="Your course knowledge check" back />
      <View style={styles.progress}>
        <View style={styles.between}>
          <Text variant="label">
            Question {state.index + 1} of {state.attempt.questions.length}
          </Text>
          <Text variant="small">{checkedPercent}% checked</Text>
        </View>
        <ProgressBar
          value={checkedPercent}
          label="Answers checked"
          valueText={`${checkedCount} of ${state.attempt.questions.length} answers checked`}
        />
      </View>
      <Card tone="lavender" style={styles.question}>
        <Text variant="title">{question.prompt}</Text>
      </Card>
      <ContentGroup>
        {question.options.map((option, index) => (
          <QuizChoice
            key={option.id}
            label={option.text}
            index={index}
            selected={selected === option.id}
            checked={checked}
            correct={feedback?.correctOptionId === option.id}
            onSelect={() => {
              if (!state.busy) select(option.id);
            }}
          />
        ))}
      </ContentGroup>
      {feedback && (
        <Card
          tone={feedback.isCorrect ? 'mint' : 'peach'}
          accessibilityLiveRegion="polite"
          style={styles.group}
        >
          <View style={styles.feedbackHeading}>
            <Icon name={feedback.isCorrect ? 'check-circle' : 'book-open'} size={18} />
            <Text variant="label" style={styles.feedbackTitle}>
              {feedback.isCorrect ? 'That’s right!' : 'A chance to learn'}
            </Text>
          </View>
          <Text variant="small">{feedback.explanation}</Text>
        </Card>
      )}
      {state.message && (
        <Text variant="small" accessibilityRole="alert">
          {state.message}
        </Text>
      )}
      <Text variant="caption" muted accessibilityLiveRegion="polite">
        {checked && last
          ? 'All answers checked. Tap Finish quiz to record your result.'
          : checked
            ? 'Your answer is checked. Continue when you’re ready.'
            : 'Take your time. Choose an answer, then check it to learn more.'}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { gap: 12 },
  progress: { gap: 8 },
  between: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
  question: { minHeight: 120, justifyContent: 'center' },
  feedbackHeading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  feedbackTitle: { flex: 1 },
});
