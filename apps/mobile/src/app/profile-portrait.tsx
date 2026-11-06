import { AccountAccess } from '../features/auth/components/AccountAccess';
import { ProfilePortraitScreen } from '../features/profile/screens/ProfilePortraitScreen';

export default function ProfilePortraitRoute() {
  return (
    <AccountAccess>
      <ProfilePortraitScreen />
    </AccountAccess>
  );
}
