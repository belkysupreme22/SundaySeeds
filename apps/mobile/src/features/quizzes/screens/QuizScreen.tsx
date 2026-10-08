import { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { getLesson } from '../../lessons/data/lessons';
import { useLearningProgress } from '../../progress/hooks/useLearningProgress';
import { scoreQuiz, type QuizScore } from '../data/scoreQuiz';
import { QuizResultScreen } from './QuizResultScreen';
import { Screen, ContentGroup } from '../../../shared/ui/Screen';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { Text } from '../../../shared/ui/Text';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { Icon } from '../../../shared/ui/Icon';
import { ProgressBar } from '../../../shared/ui/ProgressBar';
import { colors } from '../../../shared/theme/tokens';

export function QuizScreen({ lessonId }: { lessonId: string }) {
  const lesson = getLesson(lessonId);
  const { completeQuiz } = useLearningProgress();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => lesson?.questions.map(() => null) ?? [],
  );
  const [checked, setChecked] = useState(false);
  const [result, setResult] = useState<QuizScore | null>(null);
  if (!lesson)
    return (
      <Screen>
        <PageHeader title="Quiz not found" back />
        <Button label="Explore lessons" onPress={() => router.replace('/lessons')} />
      </Screen>
    );
  const question = lesson.questions[index];
  const selected = answers[index];
  const correct = selected === question.correctIndex;
  const last = index === lesson.questions.length - 1;
  function next() {
    if (!lesson) return;
    if (last) {
      const score = scoreQuiz(lesson.questions, answers);
      completeQuiz(lesson.id, score.percentage);
      setResult(score);
    } else {
      setIndex(index + 1);
      setChecked(false);
    }
  }
  if (result)
    return (
      <QuizResultScreen
        lesson={lesson}
        result={result}
        answers={answers}
        onRetry={() => {
          setIndex(0);
          setChecked(false);
          setAnswers(lesson.questions.map(() => null));
          setResult(null);
        }}
      />
    );
  return (
    <Screen
      key={index}
      footer={
        <Button
          label={!checked ? 'Check answer' : last ? 'Finish quiz' : 'Next question'}
          disabled={selected === null}
          onPress={() => (checked ? next() : setChecked(true))}
        />
      }
    >
      <PageHeader title="A moment to reflect" subtitle={lesson.title} back />
      <View style={styles.between}>
        <Text variant="small">
          Question {index + 1} of {lesson.questions.length}
        </Text>
        <Text variant="small">{Math.round((index / lesson.questions.length) * 100)}% complete</Text>
      </View>
      <ProgressBar value={(index / lesson.questions.length) * 100} />
      <Card tone="lavender" style={styles.question}>
        <Text variant="title">{question.prompt}</Text>
      </Card>
      <ContentGroup>
        {question.options.map((option, optionIndex) => (
          <Pressable
            key={option}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected === optionIndex, disabled: checked }}
            disabled={checked}
            onPress={() =>
              setAnswers((previous) =>
                previous.map((answer, i) => (i === index ? optionIndex : answer)),
              )
            }
            style={[
              styles.option,
              selected === optionIndex && styles.selected,
              checked && optionIndex === question.correctIndex && styles.correct,
            ]}
          >
            <View style={styles.letter}>
              <Text variant="label">{String.fromCharCode(65 + optionIndex)}</Text>
            </View>
            <Text style={styles.optionText}>{option}</Text>
            {selected === optionIndex && <Icon name="check-circle" size={18} />}
          </Pressable>
        ))}
      </ContentGroup>
      {checked && (
        <Card tone={correct ? 'mint' : 'peach'} shadow={false} accessibilityLiveRegion="polite">
          <Text variant="label">{correct ? 'That’s right!' : 'A chance to learn'}</Text>
          <Text variant="small">{question.explanation}</Text>
        </Card>
      )}
      <Text variant="caption" muted>
        Take your time. This is practice, not a race.
      </Text>
    </Screen>
  );
}
const styles = StyleSheet.create({
  between: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
  question: { minHeight: 135, justifyContent: 'center' },
  option: {
    borderWidth: 1.2,
    borderColor: colors.ink,
    backgroundColor: colors.white,
    borderRadius: 9,
    padding: 14,
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selected: { backgroundColor: colors.lavender },
  correct: { backgroundColor: colors.mint },
  letter: {
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  optionText: { flex: 1 },
});
