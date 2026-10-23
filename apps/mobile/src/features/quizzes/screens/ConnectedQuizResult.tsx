import { useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import type { ConnectedQuizAttempt, QuizFinish } from '../types/connectedQuiz';
import { QuizNextAction } from '../components/QuizNextAction';
import { Screen, ContentGroup } from '../../../shared/ui/Screen';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { Text } from '../../../shared/ui/Text';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { Icon } from '../../../shared/ui/Icon';
import { colors } from '../../../shared/theme/tokens';

type ConnectedQuizResultProps = {
  attempt: ConnectedQuizAttempt | null;
  result: QuizFinish;
  onRetry: () => void;
  onCourse: () => void;
  busy: boolean;
  message: string | null;
};

export function ConnectedQuizResult({
  attempt,
  result,
  onRetry,
  onCourse,
  busy,
  message,
}: ConnectedQuizResultProps) {
  const [showReview, setShowReview] = useState(false);
  const { width, fontScale } = useWindowDimensions();
  const stacked = width < 350 || fontScale >= 1.5;
  const questions = attempt?.questions ?? [];
  const reviewAvailable =
    questions.length > 0 && questions.every((question) => question.checkedAnswer !== null);

  return (
    <Screen
      loadingMessage={busy ? 'Opening a fresh attempt…' : undefined}
      footer={
        <Button label="See course progress" icon="arrow-right" disabled={busy} onPress={onCourse} />
      }
    >
      <PageHeader title="Quiz results" back />
      <View style={styles.celebration}>
        <View style={styles.medal}>
          <Icon name="award" size={54} />
        </View>
        <Text variant="heading" style={styles.center}>
          You did it!
        </Text>
        <Text muted style={styles.center}>
          Quiz complete. Every little lesson helps you grow.
        </Text>
      </View>
      <Card tone="lavender" style={[styles.result, stacked && styles.stacked]}>
        <View style={styles.score}>
          <Text variant="label">This attempt</Text>
          <Text variant="hero">{result.receipt.scorePercent}%</Text>
          <Text variant="small">
            {result.receipt.correctCount} of {result.receipt.questionCount} correct
          </Text>
        </View>
        <View style={[styles.best, stacked && styles.bestStacked]}>
          <Text variant="label">Best score</Text>
          <Text variant="heading">{result.bestScorePercent}%</Text>
          <Text variant="caption" muted>
            In your joined edition
          </Text>
        </View>
      </Card>
      <Text variant="small" accessibilityLiveRegion="polite">
        Your result is recorded. Every completed knowledge check counts toward your course, whatever
        the score.
      </Text>
      {message && (
        <Text variant="small" accessibilityRole="alert">
          {message}
        </Text>
      )}
      <ContentGroup>
        <Text variant="title">What’s next?</Text>
        {reviewAvailable && (
          <QuizNextAction
            title={showReview ? 'Hide answer review' : 'Review your answers'}
            description="Look back at your choices and explanations."
            icon="book-open"
            tone="mint"
            expanded={showReview}
            onPress={() => {
              if (!busy) setShowReview((visible) => !visible);
            }}
          />
        )}
        {showReview && reviewAvailable && (
          <ContentGroup>
            <Text variant="title">A moment to look back</Text>
            <Text variant="small" muted>
              Revisit your choices and take something new with you.
            </Text>
            {questions.map((question, index) => {
              const feedback = question.checkedAnswer;
              if (!feedback) return null;
              const chosen = question.options.find((option) => option.id === feedback.optionId);
              const correct = question.options.find(
                (option) => option.id === feedback.correctOptionId,
              );
              return (
                <Card
                  key={question.id}
                  tone={feedback.isCorrect ? 'mint' : 'peach'}
                  shadow={false}
                  style={styles.review}
                >
                  <View style={styles.reviewHeading}>
                    <Icon name={feedback.isCorrect ? 'check-circle' : 'book-open'} size={18} />
                    <Text variant="caption" style={styles.reviewHeadingCopy}>
                      Question {index + 1} · {feedback.isCorrect ? 'Correct' : 'Worth another look'}
                    </Text>
                  </View>
                  <Text variant="label">{question.prompt}</Text>
                  <View style={styles.answer}>
                    <Text variant="caption">YOUR ANSWER</Text>
                    <Text variant="small">{chosen?.text ?? 'Answer unavailable'}</Text>
                  </View>
                  {!feedback.isCorrect && (
                    <View style={styles.answer}>
                      <Text variant="caption">CORRECT ANSWER</Text>
                      <Text variant="small">{correct?.text ?? 'Answer unavailable'}</Text>
                    </View>
                  )}
                  <View style={styles.answer}>
                    <Text variant="caption">WHY IT MATTERS</Text>
                    <Text variant="small">{feedback.explanation}</Text>
                  </View>
                </Card>
              );
            })}
          </ContentGroup>
        )}
        <Button
          label="Try the quiz again"
          variant="outline"
          icon="refresh-cw"
          disabled={busy}
          onPress={onRetry}
        />
        <Text variant="small" muted>
          Start fresh whenever you like. Your highest score in this edition stays.
        </Text>
      </ContentGroup>
      <Card tone="yellow" shadow={false} style={styles.answer}>
        <Text variant="label">Take it into your week</Text>
        <Text>Choose one small action from this lesson and put it into practice.</Text>
      </Card>
      {reviewAvailable && (
        <Text variant="caption" muted>
          This answer review is available until you leave the quiz or try again.
        </Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  celebration: { alignItems: 'center', gap: 10, paddingVertical: 8 },
  medal: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: colors.mint,
    borderWidth: 1,
    borderColor: colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { textAlign: 'center' },
  result: { flexDirection: 'row', gap: 16 },
  score: { flex: 1, minWidth: 0, gap: 4 },
  best: {
    flex: 1,
    minWidth: 0,
    gap: 4,
    borderLeftWidth: 1,
    borderColor: colors.line,
    paddingLeft: 16,
  },
  stacked: { flexDirection: 'column', alignItems: 'stretch' },
  bestStacked: { borderLeftWidth: 0, borderTopWidth: 1, paddingLeft: 0, paddingTop: 12 },
  review: { gap: 14 },
  reviewHeading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reviewHeadingCopy: { flex: 1 },
  answer: { gap: 4 },
});
