import { StyleSheet, View } from 'react-native';
import type { QuizQuestion } from '../../lessons/types';
import { Card } from '../../../shared/ui/Card';
import { Icon } from '../../../shared/ui/Icon';
import { Text } from '../../../shared/ui/Text';

type AnswerReviewCardProps = {
  question: QuizQuestion;
  answer: number | null;
  number: number;
};

export function AnswerReviewCard({ question, answer, number }: AnswerReviewCardProps) {
  const correct = answer === question.correctIndex;
  const chosenAnswer = answer === null ? 'No answer selected' : question.options[answer];

  return (
    <Card tone={correct ? 'mint' : 'peach'} shadow={false} style={styles.card}>
      <View style={styles.status}>
        <Icon name={correct ? 'check-circle' : 'book-open'} size={18} />
        <Text variant="caption" style={styles.statusText}>
          Question {number} · {correct ? 'Correct' : 'Worth another look'}
        </Text>
      </View>
      <Text variant="label">{question.prompt}</Text>
      <View style={styles.answer}>
        <Text variant="caption">YOUR ANSWER</Text>
        <Text variant="small">{chosenAnswer}</Text>
      </View>
      {!correct && (
        <View style={styles.answer}>
          <Text variant="caption">CORRECT ANSWER</Text>
          <Text variant="small">{question.options[question.correctIndex]}</Text>
        </View>
      )}
      <View style={styles.answer}>
        <Text variant="caption">WHY IT MATTERS</Text>
        <Text variant="small">{question.explanation}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 14 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusText: { flex: 1 },
  answer: { gap: 4 },
});
