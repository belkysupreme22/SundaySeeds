import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { Card } from '../../../shared/ui/Card';
import { Text } from '../../../shared/ui/Text';
import { Button } from '../../../shared/ui/Button';

export function LearningStorageNotice() {
  const { error, errorKind, recovering, retryStorage } = useLearningProgress();
  if (!error) return null;
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.notice}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card tone="peach" shadow={false} style={styles.card}>
          <Text variant="label">
            {errorKind === 'load' ? 'Your progress is on hold' : 'Keep your progress'}
          </Text>
          <Text variant="small" accessibilityRole="alert">
            {error}
          </Text>
          <Button
            label={
              recovering
                ? 'Trying again…'
                : errorKind === 'load'
                  ? 'Try loading again'
                  : 'Try saving again'
            }
            icon="refresh-cw"
            variant="outline"
            disabled={recovering}
            onPress={() => void retryStorage()}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  notice: { maxHeight: '45%', flexShrink: 1 },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  card: { gap: 8, padding: 12 },
});
