import { useLocalSearchParams } from 'expo-router';
import { QuizScreen } from '../../features/quizzes/screens/QuizScreen';
export default function QuizRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <QuizScreen key={id} lessonId={id} />;
}
