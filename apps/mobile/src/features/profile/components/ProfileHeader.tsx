import { StyleSheet, View } from 'react-native';
import { colors } from '../../../shared/theme/tokens';
import { Card } from '../../../shared/ui/Card';
import { Icon } from '../../../shared/ui/Icon';
import { IconButton } from '../../../shared/ui/Button';
import { Text } from '../../../shared/ui/Text';

type ProfileHeaderProps = {
  displayName: string;
  loading: boolean;
  unavailable: boolean;
  stacked: boolean;
  onEdit: () => void;
};

export function ProfileHeader({
  displayName,
  loading,
  unavailable,
  stacked,
  onEdit,
}: ProfileHeaderProps) {
  return (
    <Card tone="lavender" style={styles.card}>
      <View style={styles.topLine}>
        <Text variant="caption" style={styles.topLabel}>
          YOUR LOCAL PROFILE
        </Text>
        {!loading && !unavailable && (
          <IconButton name="edit-2" label="Edit display name" onPress={onEdit} />
        )}
      </View>
      <View style={[styles.identity, stacked && styles.stacked]}>
        <View style={styles.avatar} accessible={false}>
          <Icon name="user" size={38} />
        </View>
        <View style={[styles.copy, stacked && styles.stackedCopy]} accessibilityLiveRegion="polite">
          <Text variant="heading">
            {loading
              ? 'Opening your profile…'
              : unavailable
                ? 'Name unavailable'
                : displayName || 'Hello, learner'}
          </Text>
          <Text variant="small">
            {loading
              ? 'Loading your saved name.'
              : unavailable
                ? 'Try loading your name again below.'
                : displayName
                  ? 'A little faith, every day.'
                  : 'Add a name or nickname to make this space yours.'}
          </Text>
          <View style={styles.localLabel}>
            <Icon name="smartphone" size={14} />
            <Text variant="caption" style={styles.localText}>
              On this device
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 8 },
  topLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topLabel: { flex: 1 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.2,
    borderColor: colors.ink,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, gap: 6 },
  localLabel: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  localText: { flexShrink: 1 },
  stacked: { flexDirection: 'column', alignItems: 'flex-start' },
  stackedCopy: { flex: 0, alignSelf: 'stretch' },
});
