import { useState } from 'react';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import type { Lesson } from '../../lessons/types';
import type { QuizScore } from '../data/scoreQuiz';
import { AnswerReviewCard } from '../components/AnswerReviewCard';
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

  return (
    <Screen footer={<Button label="See my progress" onPress={() => router.replace('/progress')} />}>
      <PageHeader title="A little wiser" back />
      <View style={styles.celebration}>
        <View style={styles.medal}>
          <Icon name="check" size={54} />
        </View>
        <Text variant="heading">You did it!</Text>
        <Text muted style={styles.center}>
          Every little lesson helps you grow.
        </Text>
      </View>
      <Card tone="lavender" style={styles.result}>
        <Text variant="hero">{result.percentage}%</Text>
        <Text>
          {result.correct} of {result.total} answers correct
        </Text>
        <Text variant="label" style={styles.center}>
          {lesson.title}
        </Text>
        <Text variant="caption" muted>
          This attempt
        </Text>
      </Card>
      <ContentGroup>
        <Button
          label={showReview ? 'Hide answer review' : 'Review answers'}
          variant="outline"
          icon={showReview ? 'chevron-up' : 'book-open'}
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
      </ContentGroup>
      <Card tone="mint" shadow={false}>
        <Text variant="label">Take it into your week</Text>
        <Text>Choose one small action from this lesson and put it into practice.</Text>
      </Card>
      <Text variant="small" muted>
        Your best score is kept on this device. This answer review is available until you leave the
        quiz or try again. Any storage problem is shown at the top of the app.
      </Text>
      <Button label="Try the quiz again" variant="outline" icon="refresh-cw" onPress={onRetry} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  celebration: { alignItems: 'center', gap: 12, paddingVertical: 20 },
  medal: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: colors.mint,
    borderWidth: 1.2,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { textAlign: 'center' },
  result: { alignItems: 'center', gap: 10 },
});
