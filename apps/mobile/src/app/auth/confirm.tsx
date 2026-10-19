import { useLocalSearchParams } from 'expo-router';
import { EmailActionScreen } from '../../features/auth/screens/EmailActionScreen';

export default function ConfirmEmailRoute() {
  const params = useLocalSearchParams<{ token_hash?: string; type?: string }>();
  return <EmailActionScreen kind="confirmation" tokenHash={params.token_hash} type={params.type} />;
}
