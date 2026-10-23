import { useLocalSearchParams } from 'expo-router';
import { ConnectedQuizScreen } from '../../../../features/quizzes/screens/ConnectedQuizScreen';
export default function ConnectedQuizRoute() {
  const { id, lessonId } = useLocalSearchParams<{
    id?: string | string[];
    lessonId?: string | string[];
  }>();
  const courseId = typeof id === 'string' ? id : '';
  const lesson = typeof lessonId === 'string' ? lessonId : '';
  return (
    <ConnectedQuizScreen key={`${courseId}/${lesson}`} courseId={courseId} lessonId={lesson} />
  );
}
