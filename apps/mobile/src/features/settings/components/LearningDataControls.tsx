import { useRef, useState } from 'react';
import { useLearningProgress } from '../../progress/hooks/useLearningProgress';
import { ContentGroup } from '../../../shared/ui/Screen';
import { Card } from '../../../shared/ui/Card';
import { Text } from '../../../shared/ui/Text';
import { Button } from '../../../shared/ui/Button';

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
      setMessage('Your preview progress and bookmarks have been reset.');
    } catch {
      setMessage('We could not save the reset on this device. Please try again.');
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
        <Card tone="peach" shadow={false}>
          <ContentGroup>
            <Text variant="title">Start fresh?</Text>
            <Text>
              This removes your saved quiz scores, reading positions and bookmarks from this device.
              Your display name and introduction preference are kept.
            </Text>
            <Button
              label={busy ? 'Resetting…' : 'Yes, reset my preview'}
              disabled={busy}
              onPress={() => void reset()}
            />
            <Button
              label="Keep my progress"
              icon={false}
              variant="outline"
              disabled={busy}
              onPress={() => {
                setConfirm(false);
                setMessage('');
              }}
            />
          </ContentGroup>
        </Card>
      ) : (
        <Button
          label="Reset preview progress"
          icon="refresh-cw"
          variant="outline"
          onPress={() => {
            setMessage('');
            setConfirm(true);
          }}
        />
      )}
    </ContentGroup>
  );
}
