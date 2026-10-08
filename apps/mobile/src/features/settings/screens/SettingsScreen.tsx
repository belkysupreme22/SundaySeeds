import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { lessons } from '../../lessons/data/lessons';
import { LearningDataControls } from '../components/LearningDataControls';
import { Screen, ContentGroup } from '../../../shared/ui/Screen';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { Card } from '../../../shared/ui/Card';
import { Text } from '../../../shared/ui/Text';
import { Icon } from '../../../shared/ui/Icon';
import { colors } from '../../../shared/theme/tokens';

export function SettingsScreen() {
  return (
    <Screen>
      <PageHeader title="Settings" subtitle="Make yourself at home." back />
      <ContentGroup>
        <Text variant="title">Personal information</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Edit your display name"
          onPress={() => router.push('/edit-profile')}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Card shadow={false} style={styles.row}>
            <View style={styles.icon}>
              <Icon name="user" />
            </View>
            <View style={styles.words}>
              <Text variant="label">Display name</Text>
              <Text variant="small" muted>
                Choose how we greet you.
              </Text>
            </View>
            <Icon name="chevron-right" size={18} />
          </Card>
        </Pressable>
      </ContentGroup>
      <ContentGroup>
        <Text variant="title">Learning data</Text>
        <Card tone="mint" shadow={false}>
          <ContentGroup>
            <View style={styles.row}>
              <Icon name="smartphone" />
              <Text variant="label" style={styles.words}>
                Saved on this device
              </Text>
            </View>
            <Text variant="small">
              Your name, reading positions, quiz scores and bookmarks stay in this app on this
              device. They are not backed up to an account or synced with a class.
            </Text>
          </ContentGroup>
        </Card>
        <LearningDataControls />
      </ContentGroup>
      <ContentGroup>
        <Text variant="title">About SundaySeeds</Text>
        <Card tone="lavender" shadow={false}>
          <ContentGroup>
            <View style={styles.row}>
              <Icon name="sun" size={28} />
              <View style={styles.words}>
                <Text variant="title">A little faith, every day.</Text>
                <Text variant="caption">SundaySeeds · Preview 0.1.0</Text>
              </View>
            </View>
            <Text variant="small">
              Explore {lessons.length} sample lessons, practise with short quizzes and keep track of
              your growth. No account is needed for this preview.
            </Text>
            <Text variant="small">
              Teacher publishing, class invitations and accounts are planned. The sample content is
              here to help us shape the experience together.
            </Text>
          </ContentGroup>
        </Card>
      </ContentGroup>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  words: { flex: 1, gap: 4 },
  icon: {
    padding: 10,
    backgroundColor: colors.lavender,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.ink,
  },
  pressed: { opacity: 0.8 },
});
