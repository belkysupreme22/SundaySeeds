import { AccountAccess } from '../features/auth/components/AccountAccess';
import { LearningProfileScreen } from '../features/learning-profile/screens/LearningProfileScreen';

export default function LearningProfileRoute() {
  return (
    <AccountAccess>
      <LearningProfileScreen />
    </AccountAccess>
  );
}
