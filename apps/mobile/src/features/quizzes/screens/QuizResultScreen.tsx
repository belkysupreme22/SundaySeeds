import { useState } from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import type { Lesson } from '../../lessons/types';
import { LessonArtwork } from '../../lessons/components/LessonArtwork';
import { useLearningProgress } from '../../progress/hooks/useLearningProgress';
import { StudyMedal } from '../../progress/components/StudyMedal';
import type { QuizScore } from '../data/scoreQuiz';
import { AnswerReviewCard } from '../components/AnswerReviewCard';
import { QuizNextAction } from '../components/QuizNextAction';
import { QuizCompletion } from '../components/QuizCompletion';
import { QuizScoreRibbon } from '../components/QuizScoreRibbon';
import { NextStandaloneLesson } from '../components/NextStandaloneLesson';
import { Screen, ContentGroup } from '../../../shared/ui/Screen';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { Text } from '../../../shared/ui/Text';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { colors } from '../../../shared/theme/tokens';

type QuizResultScreenProps = {
  lesson: Lesson;
  result: QuizScore;
  previousBest: number | null;
  answers: readonly (number | null)[];
  onRetry: () => void;
};

export function QuizResultScreen({
  lesson,
  result,
  previousBest,
  answers,
  onRetry,
}: QuizResultScreenProps) {
  const { t } = useTranslation();
  const [showReview, setShowReview] = useState(false);
  const { progress, error, hydrated } = useLearningProgress();
  const { width, fontScale } = useWindowDimensions();
  const stacked = width < 350 || fontScale >= 1.5;
  const bestScore = progress[lesson.id]?.bestScore;
  const improved = previousBest !== null && result.percentage > previousBest;

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
      <QuizCompletion celebrate />
      <Card shadow={false} style={[styles.lesson, stacked && styles.stacked]}>
        <LessonArtwork id={lesson.id} tone={lesson.color} />
        <View style={styles.lessonCopy}>
          <Text variant="caption" muted>
            {lesson.category}
          </Text>
          <Text variant="title">{lesson.title}</Text>
          <Text variant="small" muted>
            {lesson.scripture}
          </Text>
          <Text variant="caption">{lesson.questions.length} questions</Text>
        </View>
      </Card>
      <Card tone="mint" style={[styles.result, stacked && styles.stacked]}>
        <View style={styles.score}>
          <Text variant="label">This attempt</Text>
          <Text variant="hero">{result.percentage}%</Text>
          <QuizScoreRibbon correct={result.correct} total={result.total} />
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
      {improved && (
        <Card tone="pink" stroke="soft" shadow={false} style={styles.record}>
          <StudyMedal badge="record" earned size={50} />
          <View style={styles.lessonCopy}>
            <Text variant="label">{t('progress.badges.newRecord')}</Text>
            <Text variant="small">
              {t('progress.badges.recordDelta', {
                previous: previousBest,
                score: result.percentage,
              })}
            </Text>
          </View>
        </Card>
      )}
      <ContentGroup>
        <Text variant="title">What’s next?</Text>
        <NextStandaloneLesson lessonId={lesson.id} />
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
          tone="peach"
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
  lesson: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  lessonCopy: { flex: 1, gap: 5 },
  result: { flexDirection: 'row', gap: 16 },
  record: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9 },
  score: { flex: 1, gap: 4 },
  best: { flex: 1, gap: 4, borderLeftWidth: 1, borderColor: colors.line, paddingLeft: 16 },
  stacked: { flexDirection: 'column', alignItems: 'stretch' },
  bestStacked: { borderLeftWidth: 0, borderTopWidth: 1, paddingLeft: 0, paddingTop: 12 },
});
