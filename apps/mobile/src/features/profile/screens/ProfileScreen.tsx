import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useLearningProgress } from '../../progress/hooks/useLearningProgress';
import { Screen, ContentGroup } from '../../../shared/ui/Screen';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { Text } from '../../../shared/ui/Text';
import { Card } from '../../../shared/ui/Card';
import { Button, IconButton } from '../../../shared/ui/Button';
import { Icon } from '../../../shared/ui/Icon';
import { colors } from '../../../shared/theme/tokens';
import { useLearnerProfile } from '../hooks/useLearnerProfile';
export function ProfileScreen() {
  const { displayName, loadError, retryLoad } = useLearnerProfile();
  const { progress, bookmarks } = useLearningProgress();
  const completed = Object.values(progress).filter((p) => p.completed).length;
  return (
    <Screen tabs>
      <PageHeader
        title="Your learning space"
        subtitle="A little about your journey."
        action={
          <IconButton
            name="settings"
            label="Open settings"
            onPress={() => router.push('/settings')}
          />
        }
      />
      <Card tone="lavender" style={styles.profile}>
        <View style={styles.avatar}>
          <Icon name="user" size={38} />
        </View>
        <View style={styles.words}>
          <Text variant="heading">Hello, {displayName || 'learner'}</Text>
          <Text variant="small">SundaySeeds preview</Text>
          <Text variant="caption">No account needed for this demo</Text>
        </View>
      </Card>
      {loadError && (
        <Card tone="peach" shadow={false}>
          <Text accessibilityRole="alert" style={styles.space}>
            {loadError}
          </Text>
          <Button label="Try loading my name again" icon="refresh-cw" onPress={retryLoad} />
        </Card>
      )}
      <Button
        label="Edit profile"
        icon="edit-2"
        variant="outline"
        onPress={() => router.push('/edit-profile')}
      />
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
        <Button
          label="Settings"
          icon="settings"
          variant="outline"
          onPress={() => router.push('/settings')}
        />
      </ContentGroup>
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
  center: { textAlign: 'center' },
});
