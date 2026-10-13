import { useState } from 'react';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { getLesson } from '../../lessons/data/lessons';
import { useLearningProgress } from '../../progress/hooks/useLearningProgress';
import { scoreQuiz, type QuizScore } from '../data/scoreQuiz';
import { QuizResultScreen } from './QuizResultScreen';
import { QuizChoice } from '../components/QuizChoice';
import { Screen, ContentGroup } from '../../../shared/ui/Screen';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { Text } from '../../../shared/ui/Text';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { Icon } from '../../../shared/ui/Icon';
import { ProgressBar } from '../../../shared/ui/ProgressBar';

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
  const checkedCount = index + (checked ? 1 : 0);
  const checkedPercent = Math.round((checkedCount / lesson.questions.length) * 100);
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
          icon={!checked ? 'check' : 'arrow-right'}
          disabled={selected === null}
          onPress={() => (checked ? next() : setChecked(true))}
        />
      }
    >
      <PageHeader title="Quiz time" subtitle={lesson.title} back />
      <View style={styles.progress}>
        <View style={styles.between}>
          <Text variant="label">
            Question {index + 1} of {lesson.questions.length}
          </Text>
          <Text variant="small">{checkedPercent}% checked</Text>
        </View>
        <ProgressBar
          value={checkedPercent}
          label="Answers checked"
          valueText={`${checkedCount} of ${lesson.questions.length} answers checked`}
        />
      </View>
      <Card tone="lavender" style={styles.question}>
        <Text variant="title">{question.prompt}</Text>
      </Card>
      <ContentGroup>
        {question.options.map((option, optionIndex) => (
          <QuizChoice
            key={option}
            label={option}
            index={optionIndex}
            selected={selected === optionIndex}
            checked={checked}
            correct={optionIndex === question.correctIndex}
            onSelect={() =>
              setAnswers((previous) =>
                previous.map((answer, i) => (i === index ? optionIndex : answer)),
              )
            }
          />
        ))}
      </ContentGroup>
      {checked && (
        <Card tone={correct ? 'mint' : 'peach'} accessibilityLiveRegion="polite">
          <View style={styles.feedbackHeading}>
            <Icon name={correct ? 'check-circle' : 'book-open'} size={18} />
            <Text variant="label" style={styles.feedbackTitle}>
              {correct ? 'That’s right!' : 'A chance to learn'}
            </Text>
          </View>
          <Text variant="small">{question.explanation}</Text>
        </Card>
      )}
      <Text variant="caption" muted>
        {checked && last
          ? 'All answers checked. Tap Finish quiz to record your result.'
          : 'Take your time. Choose an answer, then check it to learn more.'}
      </Text>
    </Screen>
  );
}
const styles = StyleSheet.create({
  progress: { gap: 8 },
  between: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
  question: { minHeight: 120, justifyContent: 'center' },
  feedbackHeading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  feedbackTitle: { flex: 1 },
});
