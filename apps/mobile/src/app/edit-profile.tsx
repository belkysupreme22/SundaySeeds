import { AccountAccess } from '../features/auth/components/AccountAccess';
import { EditProfileScreen } from '../features/profile/screens/EditProfileScreen';

export default function EditProfileRoute() {
  return (
    <AccountAccess>
      <EditProfileScreen />
    </AccountAccess>
  );
}
