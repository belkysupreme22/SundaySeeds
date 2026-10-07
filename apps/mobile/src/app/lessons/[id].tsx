import { useLocalSearchParams } from 'expo-router';
import { LessonDetailScreen } from '../../features/lessons/screens/LessonDetailScreen';
export default function LessonRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <LessonDetailScreen lessonId={id} />;
}
