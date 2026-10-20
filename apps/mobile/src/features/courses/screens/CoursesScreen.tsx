import { router } from 'expo-router';
import { CourseSuggestions } from '../../learning-profile/components/CourseSuggestions';
import { emptyLearningPreferences } from '../../learning-profile/types';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { Screen } from '../../../shared/ui/Screen';

export function CoursesScreen() {
  return (
    <Screen tabs>
      <PageHeader title="Course library" back />
      <CourseSuggestions
        catalog
        preferences={emptyLearningPreferences}
        onViewCourse={() => router.push('/lessons/course')}
        onBrowse={() => {}}
      />
    </Screen>
  );
}
