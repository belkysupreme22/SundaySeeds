import { AccountAccess } from '../features/auth/components/AccountAccess';
import { ProfileAccessScreen } from '../features/auth/screens/ProfileAccessScreen';
import { ProfileScreen } from '../features/profile/screens/ProfileScreen';

export default function ProfileRoute() {
  return (
    <AccountAccess signedOut={<ProfileAccessScreen />}>
      <ProfileScreen />
    </AccountAccess>
  );
}
