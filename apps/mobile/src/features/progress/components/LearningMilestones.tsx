import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { accentColors, brandColors, cardColors, colors } from '../../../shared/theme/tokens';
import { Icon } from '../../../shared/ui/Icon';
import { Text } from '../../../shared/ui/Text';

type LearningMilestonesProps = {
  started: boolean;
  completed: number;
  total: number;
};

export function LearningMilestones({ started, completed, total }: LearningMilestonesProps) {
  const { t } = useTranslation();
  if (total <= 0) return null;

  const halfway = Math.ceil(total / 2);
  const checkpoints = [
    { id: 'start', label: t('progress.milestoneStarted'), done: started || completed > 0 },
    { id: 'first', label: t('progress.milestoneFirstQuiz'), done: completed >= 1 },
    ...(total > 2
      ? [
          {
            id: 'halfway',
            label: t('progress.milestoneHalfway', { count: halfway }),
            done: completed >= halfway,
          },
        ]
      : []),
    ...(total > 1
      ? [{ id: 'all', label: t('progress.milestoneAll'), done: completed >= total }]
      : []),
  ];
  const nextIndex = checkpoints.findIndex((checkpoint) => !checkpoint.done);

  return (
    <View>
      {checkpoints.map(({ id, label, done }, index) => {
        const next = index === nextIndex;
        const last = index === checkpoints.length - 1;
        const status = done
          ? 'progress.milestoneDone'
          : next
            ? 'progress.milestoneNext'
            : 'progress.milestoneAhead';
        return (
          <View key={id} style={styles.row}>
            <View
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              aria-hidden
              style={styles.track}
            >
              <View style={[styles.marker, done && styles.markerDone, next && styles.markerNext]}>
                <Icon
                  name={done ? 'check' : next ? 'arrow-right' : 'minus'}
                  size={15}
                  color={done ? brandColors.onForest : brandColors.forest}
                />
              </View>
              {!last && <View style={styles.rail} />}
            </View>
            <View style={[styles.copy, next && styles.next, !last && styles.spacing]}>
              <Text variant="control">{label}</Text>
              <Text variant="meta" muted={!next} style={next && styles.nextLabel}>
                {t(status)}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  track: { width: 28, alignItems: 'center', paddingTop: 8 },
  marker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.outline,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerDone: { borderColor: brandColors.forest, backgroundColor: brandColors.forest },
  markerNext: { borderColor: brandColors.forest, backgroundColor: accentColors.wheat },
  rail: { width: 1, flex: 1, marginBottom: -8, backgroundColor: colors.outline },
  copy: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 2,
  },
  next: { backgroundColor: cardColors.yellow, borderColor: colors.outline },
  nextLabel: { color: brandColors.forest },
  spacing: { marginBottom: 6 },
});
