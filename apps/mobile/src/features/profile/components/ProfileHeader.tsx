import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { seedPaths, seedViewBox } from '../../../shared/branding/seedMark';
import { accentColors, brandColors, colors } from '../../../shared/theme/tokens';
import { Card } from '../../../shared/ui/Card';
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
    <Card tone="mint" stroke="soft" shadow={false} style={styles.card}>
      <View style={[styles.identity, stacked && styles.stacked]}>
        <View
          style={styles.seal}
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          aria-hidden
        >
          <View style={styles.sealField}>
            <Svg width={50} height={50} viewBox={seedViewBox}>
              {seedPaths.map(({ id, d }) => (
                <Path key={id} d={d} fill={brandColors.forest} fillRule="evenodd" />
              ))}
            </Svg>
          </View>
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
  seal: {
    width: 72,
    height: 72,
    flexShrink: 0,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: brandColors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealField: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: accentColors.wheat,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, minWidth: 0, gap: 4 },
  stacked: { flexDirection: 'column', alignItems: 'flex-start' },
  stackedCopy: { flexGrow: 0, flexShrink: 0, flexBasis: 'auto', alignSelf: 'stretch' },
});
