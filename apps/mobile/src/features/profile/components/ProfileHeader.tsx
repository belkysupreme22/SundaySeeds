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
    <Card tone="lavender" stroke="soft" shadow={false} style={styles.card}>
      <View style={[styles.identity, stacked && styles.stacked]}>
        <View style={styles.avatar} accessible={false}>
          <Icon name="user" size={38} />
        </View>
        <View style={[styles.copy, stacked && styles.stackedCopy]} accessibilityLiveRegion="polite">
          <View style={styles.nameRow}>
            <Text variant="title" style={styles.name}>
              {loading
                ? 'Opening your profile…'
                : unavailable
                  ? 'Name unavailable'
                  : displayName || 'Hello, learner'}
            </Text>
            {!loading && !unavailable && (
              <IconButton name="edit-2" label="Edit display name" onPress={onEdit} />
            )}
          </View>
          <Text variant="caption">
            {loading
              ? 'Loading your saved name.'
              : unavailable
                ? 'Try loading your name again below.'
                : displayName
                  ? 'SundaySeeds learner'
                  : 'Add a name or nickname'}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: 14, borderRadius: 9 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  name: { flex: 1 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 72,
    height: 72,
    flexShrink: 0,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, minWidth: 0, gap: 4 },
  stacked: { flexDirection: 'column', alignItems: 'flex-start' },
  stackedCopy: { flex: 0, alignSelf: 'stretch' },
});
