import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { accentColors, brandColors } from '../../../shared/theme/tokens';
import { Card } from '../../../shared/ui/Card';
import { Icon, type IconName } from '../../../shared/ui/Icon';
import { Text } from '../../../shared/ui/Text';

type Props = {
  completed: number;
  inProgress: number;
  saved: number;
  stacked: boolean;
};

export function ProfileLearningStats({ completed, inProgress, saved, stacked }: Props) {
  const { t } = useTranslation();
  const stats = [
    {
      label: t('profile.completed'),
      value: completed,
      icon: 'check-circle',
      fill: accentColors.mint,
    },
    {
      label: t('lessons.inProgress'),
      value: inProgress,
      icon: 'book-open',
      fill: accentColors.wheat,
    },
    { label: t('home.saved'), value: saved, icon: 'bookmark', fill: accentColors.rose },
  ] satisfies readonly { label: string; value: number; icon: IconName; fill: string }[];
  return (
    <View style={[styles.row, stacked && styles.stacked]}>
      {stats.map(({ label, value, icon, fill }) => (
        <Card
          key={label}
          shadow={false}
          stroke="subtle"
          style={[styles.tile, stacked && styles.stackedTile]}
          accessible
          accessibilityLabel={`${label}: ${value}`}
        >
          <View style={styles.valueRow}>
            <View
              style={[styles.mark, value > 0 && { backgroundColor: fill }]}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              aria-hidden
            >
              <Icon
                name={icon}
                size={18}
                color={value > 0 ? brandColors.forest : brandColors.muted}
              />
            </View>
            <Text variant="title" style={styles.value}>
              {value}
            </Text>
          </View>
          <Text variant="caption" style={styles.label}>
            {label}
          </Text>
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  stacked: { flexDirection: 'column' },
  tile: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 6,
    paddingVertical: 10,
    gap: 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  stackedTile: { flexGrow: 0, flexShrink: 0, flexBasis: 'auto' },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
  },
  mark: { padding: 4, borderRadius: 5, flexShrink: 0 },
  value: { color: brandColors.forest, flexShrink: 1, textAlign: 'center' },
  label: { alignSelf: 'stretch', textAlign: 'center' },
});
