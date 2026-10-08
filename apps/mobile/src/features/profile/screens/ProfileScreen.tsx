import { useState } from 'react';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useLearningProgress } from '../../progress/hooks/useLearningProgress';
import { Screen, ContentGroup } from '../../../shared/ui/Screen';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { Text } from '../../../shared/ui/Text';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { Icon } from '../../../shared/ui/Icon';
import { colors } from '../../../shared/theme/tokens';
export function ProfileScreen() {
  const { progress, bookmarks, resetProgress } = useLearningProgress();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const completed = Object.values(progress).filter((p) => p.completed).length;
  async function reset() {
    setBusy(true);
    setMessage('');
    try {
      await resetProgress();
      setConfirm(false);
      setMessage('Your preview progress and bookmarks have been reset.');
    } catch {
      setMessage('We could not reset saved data. Please try again.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <Screen tabs>
      <PageHeader title="Your learning space" subtitle="A little about your journey." />
      <Card tone="lavender" style={styles.profile}>
        <View style={styles.avatar}>
          <Icon name="user" size={38} />
        </View>
        <View style={styles.words}>
          <Text variant="heading">Hello, learner</Text>
          <Text variant="small">SundaySeeds preview</Text>
          <Text variant="caption">No account needed for this demo</Text>
        </View>
      </Card>
      <View style={styles.stats}>
        <Card tone="mint" shadow={false} style={styles.stat}>
          <Text variant="heading">{completed}</Text>
          <Text variant="small">Lessons completed</Text>
        </Card>
        <Card tone="yellow" shadow={false} style={styles.stat}>
          <Text variant="heading">{bookmarks.length}</Text>
          <Text variant="small">Lessons saved</Text>
        </Card>
      </View>
      <ContentGroup>
        <Text variant="title">Make yourself at home</Text>
        <Button
          label="View introduction"
          icon="sun"
          variant="outline"
          onPress={() => router.push('/welcome')}
        />
        <Button
          label="My saved lessons"
          icon="bookmark"
          variant="outline"
          onPress={() => router.replace('/lessons?filter=saved')}
        />
        <Button
          label="My learning progress"
          icon="bar-chart-2"
          variant="outline"
          onPress={() => router.replace('/progress')}
        />
      </ContentGroup>
      <Card shadow={false}>
        <Text variant="title">A small beginning</Text>
        <Text style={styles.space}>
          Explore four sample lessons, practise with short quizzes and keep track of your growth.
        </Text>
        <Text variant="small" muted>
          Teacher publishing, class invitations and accounts are planned next. The sample content is
          here to help us shape the experience together.
        </Text>
      </Card>
      <Card tone="mint" shadow={false}>
        <View style={styles.row}>
          <Icon name="smartphone" />
          <Text variant="label">Saved on this device</Text>
        </View>
        <Text variant="small" style={styles.space}>
          Your progress and bookmarks stay in this app on this device. They are not backed up to an
          account or synced with a class.
        </Text>
      </Card>
      {message ? (
        <Text accessibilityLiveRegion="polite" variant="small">
          {message}
        </Text>
      ) : null}
      {confirm ? (
        <Card tone="peach" shadow={false}>
          <Text variant="title">Start fresh?</Text>
          <Text style={styles.space}>
            This removes your saved quiz scores, reading positions and bookmarks from this device.
          </Text>
          <Button
            label={busy ? 'Resetting…' : 'Yes, reset my preview'}
            disabled={busy}
            onPress={() => void reset()}
          />
          <View style={styles.space}>
            <Button
              label="Keep my progress"
              icon={false}
              variant="outline"
              disabled={busy}
              onPress={() => setConfirm(false)}
            />
          </View>
        </Card>
      ) : (
        <Button
          label="Reset preview progress"
          icon="refresh-cw"
          variant="outline"
          onPress={() => setConfirm(true)}
        />
      )}
      <Text variant="caption" muted style={styles.center}>
        SundaySeeds · A little faith, every day · Preview 0.1.0
      </Text>
    </Screen>
  );
}
const styles = StyleSheet.create({
  profile: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  avatar: {
    width: 74,
    height: 74,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: colors.ink,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  words: { flex: 1, gap: 5 },
  stats: { flexDirection: 'row', gap: 12 },
  stat: { flex: 1 },
  space: { marginVertical: 12 },
  row: { flexDirection: 'row', gap: 9, alignItems: 'center' },
  center: { textAlign: 'center' },
});
