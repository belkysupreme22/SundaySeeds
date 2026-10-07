import { router } from 'expo-router';
import { Screen } from '../shared/ui/Screen';
import { Text } from '../shared/ui/Text';
import { Button } from '../shared/ui/Button';
export default function NotFound() {
  return (
    <Screen>
      <Text variant="heading">This page wandered off.</Text>
      <Text>Let’s get back to your lessons.</Text>
      <Button label="Back to Home" onPress={() => router.replace('/')} />
    </Screen>
  );
}
