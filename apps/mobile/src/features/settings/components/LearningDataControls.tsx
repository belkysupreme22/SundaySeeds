import { useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useLearningProgress } from '../../progress/hooks/useLearningProgress';
import { colors } from '../../../shared/theme/tokens';
import { ContentGroup } from '../../../shared/ui/Screen';
import { Card } from '../../../shared/ui/Card';
import { Text } from '../../../shared/ui/Text';
import { Button } from '../../../shared/ui/Button';
import { Icon } from '../../../shared/ui/Icon';

export function LearningDataControls() {
  const { resetProgress } = useLearningProgress();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const resetting = useRef(false);

  async function reset() {
    if (resetting.current) return;
    resetting.current = true;
    setBusy(true);
    setMessage('');
    try {
      await resetProgress();
      setConfirm(false);
      setMessage('Your progress and bookmarks have been reset.');
    } catch {
      setMessage('We could not reset your progress. Please try again.');
    } finally {
      resetting.current = false;
      setBusy(false);
    }
  }

  return (
    <ContentGroup>
      {message ? (
        <Text accessibilityLiveRegion="polite" variant="small">
          {message}
        </Text>
      ) : null}
      {confirm ? (
        <Card tone="peach" shadow={false} style={styles.confirmation}>
          <View style={styles.confirmationContent}>
            <Text variant="label">Start fresh?</Text>
            <Text variant="small">
              This removes your saved quiz scores, reading positions and bookmarks. Your display
              name and introduction preference are kept.
            </Text>
            <Button
              label={busy ? 'Resetting…' : 'Yes, reset my progress'}
              icon="refresh-cw"
              variant="outline"
              style={styles.confirmButton}
              disabled={busy}
              onPress={() => void reset()}
            />
            <Button
              label="Keep my progress"
              icon={false}
              variant="outline"
              style={styles.confirmButton}
              disabled={busy}
              onPress={() => {
                setConfirm(false);
                setMessage('');
              }}
            />
          </View>
        </Card>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reset learning progress"
          accessibilityHint="Opens a confirmation before removing your learning progress."
          style={({ pressed }) => [styles.resetRow, pressed && styles.pressed]}
          onPress={() => {
            setMessage('');
            setConfirm(true);
          }}
        >
          <Icon name="refresh-cw" size={16} color={colors.danger} />
          <Text variant="label" style={styles.resetLabel}>
            Reset learning progress
          </Text>
        </Pressable>
      )}
    </ContentGroup>
  );
}

const styles = StyleSheet.create({
  resetRow: {
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 6,
    backgroundColor: `${colors.peach}55`,
  },
  resetLabel: { color: colors.danger, flexShrink: 1, textAlign: 'center' },
  pressed: { opacity: 0.72 },
  confirmation: { padding: 12, borderRadius: 8, borderColor: colors.line, borderWidth: 1 },
  confirmationContent: { gap: 10 },
  confirmButton: { minHeight: 44, paddingVertical: 10, borderRadius: 6 },
});
