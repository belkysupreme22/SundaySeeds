import { useLocalSearchParams } from 'expo-router';
import { ReaderScreen } from '../../features/lessons/screens/ReaderScreen';
export default function ReaderRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ReaderScreen lessonId={id} />;
}
