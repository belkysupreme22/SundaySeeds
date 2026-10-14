import { useState } from 'react';
import { router } from 'expo-router';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import type { Lesson } from '../../lessons/types';
import { LessonArtwork } from '../../lessons/components/LessonArtwork';
import { useLearningProgress } from '../../progress/hooks/useLearningProgress';
import type { QuizScore } from '../data/scoreQuiz';
import { AnswerReviewCard } from '../components/AnswerReviewCard';
import { QuizNextAction } from '../components/QuizNextAction';
import { Screen, ContentGroup } from '../../../shared/ui/Screen';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { Text } from '../../../shared/ui/Text';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { Icon } from '../../../shared/ui/Icon';
import { colors } from '../../../shared/theme/tokens';

type QuizResultScreenProps = {
  lesson: Lesson;
  result: QuizScore;
  answers: readonly (number | null)[];
  onRetry: () => void;
};

export function QuizResultScreen({ lesson, result, answers, onRetry }: QuizResultScreenProps) {
  const [showReview, setShowReview] = useState(false);
  const { progress, error, hydrated } = useLearningProgress();
  const { width, fontScale } = useWindowDimensions();
  const stacked = width < 350 || fontScale >= 1.5;
  const bestScore = progress[lesson.id]?.bestScore;

  return (
    <Screen
      footer={
        <Button
          label="See my progress"
          icon="arrow-right"
          onPress={() => router.replace('/progress')}
        />
      }
    >
      <PageHeader title="Quiz results" back />
      <View style={styles.celebration}>
        <View style={styles.medal}>
          <Icon name="check" size={54} />
        </View>
        <Text variant="heading" style={styles.center}>
          You did it!
        </Text>
        <Text muted style={styles.center}>
          Quiz complete. Every little lesson helps you grow.
        </Text>
      </View>
      <Card shadow={false} style={[styles.lesson, stacked && styles.stacked]}>
        <LessonArtwork id={lesson.id} tone={lesson.color} />
        <View style={styles.lessonCopy}>
          <Text variant="caption" muted>
            Sample lesson · {lesson.category}
          </Text>
          <Text variant="title">{lesson.title}</Text>
          <Text variant="small" muted>
            {lesson.scripture}
          </Text>
          <Text variant="caption">{lesson.questions.length} questions</Text>
        </View>
      </Card>
      <Card tone="lavender" style={[styles.result, stacked && styles.stacked]}>
        <View style={styles.score}>
          <Text variant="label">This attempt</Text>
          <Text variant="hero">{result.percentage}%</Text>
          <Text variant="small">
            {result.correct} of {result.total} correct
          </Text>
        </View>
        <View style={[styles.best, stacked && styles.bestStacked]}>
          <Text variant="label">Best score</Text>
          <Text variant="heading">{bestScore == null ? '—' : `${bestScore}%`}</Text>
          {error && (
            <Text variant="caption" muted>
              Saving needs attention
            </Text>
          )}
        </View>
      </Card>
      <ContentGroup>
        <Text variant="title">What’s next?</Text>
        <QuizNextAction
          title={showReview ? 'Hide answer review' : 'Review your answers'}
          description="Look back at your choices and explanations."
          icon="book-open"
          tone="mint"
          expanded={showReview}
          onPress={() => setShowReview((visible) => !visible)}
        />
        {showReview && (
          <ContentGroup>
            <Text variant="title">A moment to look back</Text>
            <Text variant="small" muted>
              Revisit your choices and take something new with you.
            </Text>
            {lesson.questions.map((question, index) => (
              <AnswerReviewCard
                key={question.id}
                question={question}
                answer={answers[index] ?? null}
                number={index + 1}
              />
            ))}
          </ContentGroup>
        )}
        <QuizNextAction
          title="Try the quiz again"
          description="Start fresh. Your best score stays."
          icon="refresh-cw"
          tone="lavender"
          onPress={onRetry}
        />
      </ContentGroup>
      <Card tone="yellow" shadow={false}>
        <Text variant="label">Take it into your week</Text>
        <Text>Choose one small action from this lesson and put it into practice.</Text>
      </Card>
      <Text variant="small" muted>
        {error
          ? 'This result is visible for this session, but saving is not confirmed. Use the storage notice above to recover your learning data.'
          : !hydrated
            ? 'Your learning data is still loading. Saving this result is not confirmed.'
            : 'Your best score is kept when you try again.'}{' '}
        This answer review is available until you leave the quiz or try again.
      </Text>
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
  lesson: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  lessonCopy: { flex: 1, gap: 5 },
  result: { flexDirection: 'row', gap: 16 },
  score: { flex: 1, gap: 4 },
  best: { flex: 1, gap: 4, borderLeftWidth: 1, borderColor: colors.line, paddingLeft: 16 },
  stacked: { flexDirection: 'column', alignItems: 'stretch' },
  bestStacked: { borderLeftWidth: 0, borderTopWidth: 1, paddingLeft: 0, paddingTop: 12 },
});
