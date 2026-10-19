import { useLocalSearchParams } from 'expo-router';
import { EmailActionScreen } from '../../features/auth/screens/EmailActionScreen';

export default function RecoverAccountRoute() {
  const params = useLocalSearchParams<{ token_hash?: string; type?: string }>();
  return <EmailActionScreen kind="recovery" tokenHash={params.token_hash} type={params.type} />;
}
