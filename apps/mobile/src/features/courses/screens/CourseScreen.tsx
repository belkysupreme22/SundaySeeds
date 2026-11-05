import { Redirect } from 'expo-router';
import { sampleCourse } from '../data/sampleCourse';

export function CourseScreen() {
  return <Redirect href={{ pathname: '/courses/[id]', params: { id: sampleCourse.id } }} />;
}
