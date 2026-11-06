import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { targets } from '../../../shared/theme/motion';
import { brandColors, colors } from '../../../shared/theme/tokens';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { Icon } from '../../../shared/ui/Icon';
import { Text } from '../../../shared/ui/Text';
import {
  studyBadgeThresholds,
  weeklyStudyGoal,
  type getStudyBadgeProgress,
} from '../data/studyActivity';
import { StudyMedal } from './StudyMedal';

export function StudyRhythmCard({
  badges,
  stacked,
  onReview,
}: {
  badges: ReturnType<typeof getStudyBadgeProgress>;
  stacked: boolean;
  onReview?: () => void;
}) {
  const { t } = useTranslation();
  const { daysThisWeek, currentWeeklyStreak, longestWeeklyStreak, currentStreak } = badges;
  const level = studyBadgeThresholds.weekly.filter(
    (target) => longestWeeklyStreak >= target,
  ).length;
  const goalMet = daysThisWeek >= weeklyStudyGoal;

  return (
    <Card tone="mint" stroke="soft" shadow={false} style={styles.card}>
      <View style={[styles.lead, stacked && styles.stackedLead]}>
        <StudyMedal badge="weekly" earned={level > 0} level={level} size={60} />
        <View style={[styles.copy, !stacked && styles.leadCopy]}>
          <Text variant="title">{t('progress.badges.weekly')}</Text>
          <Text variant="small" muted>
            {t('progress.badges.weekGoal', { goal: weeklyStudyGoal })}
          </Text>
          <Text variant={goalMet ? 'label' : 'small'} style={goalMet && styles.positive}>
            {t(goalMet ? 'progress.badges.weekMet' : 'progress.badges.weekCount', {
              count: daysThisWeek,
            })}
          </Text>
        </View>
      </View>
      <View style={styles.steps} aria-hidden>
        {Array.from({ length: weeklyStudyGoal }, (_, index) => {
          const done = index < daysThisWeek;
          return (
            <View key={index} style={[styles.step, done && styles.stepDone]}>
              {done && <Icon name="check" size={11} color={brandColors.onForest} />}
            </View>
          );
        })}
      </View>
      <View style={styles.copy}>
        {currentWeeklyStreak > 0 && (
          <Text variant="small">
            {t('progress.badges.weekRun', { count: currentWeeklyStreak })}
          </Text>
        )}
        {currentStreak > 0 && (
          <Text variant="small">{t('progress.badges.dayRun', { count: currentStreak })}</Text>
        )}
        <Text variant="small" muted>
          {t('progress.badges.studyDayRule')}
        </Text>
      </View>
      {onReview && (
        <Button
          label={t('progress.badges.reviewPast')}
          icon="book-open"
          variant="outline"
          onPress={onReview}
          style={styles.review}
        />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 8, padding: 12 },
  lead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stackedLead: { flexDirection: 'column', alignItems: 'flex-start' },
  leadCopy: { flex: 1 },
  copy: { flexShrink: 1, minWidth: 0, gap: 3 },
  positive: { color: brandColors.forest },
  steps: { flexDirection: 'row', gap: 5 },
  step: {
    flex: 1,
    minHeight: 14,
    borderRadius: 5,
    backgroundColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDone: { backgroundColor: brandColors.forest },
  review: {
    borderColor: brandColors.controlBorder,
    minHeight: targets.minimum,
    paddingVertical: 8,
  },
});
