import { useTranslation } from 'react-i18next';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { brandColors, spacing } from '../../../shared/theme/tokens';
import { Card } from '../../../shared/ui/Card';
import { Icon } from '../../../shared/ui/Icon';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { ProgressBar } from '../../../shared/ui/ProgressBar';
import { Screen } from '../../../shared/ui/Screen';
import { Text } from '../../../shared/ui/Text';
import { lessons } from '../../lessons/data/lessons';
import { StudyMedal, type StudyBadgeId } from '../components/StudyMedal';
import { studyBadgeThresholds } from '../data/studyActivity';
import { useLearningProgress, useStudyBadgeProgress } from '../hooks/useLearningProgress';

type TieredBadgeId = Exclude<StudyBadgeId, 'record'>;
type BadgeUnit = 'weeks' | 'daysUnit' | 'lessonsUnit';
const levelMarks = ['I', 'II', 'III', 'IV'];
const medalSize = 56;
const rowMedalSize = 52;

export function StudyBadgeCollectionScreen() {
  const { t } = useTranslation();
  const { activity, hydrated, errorKind } = useLearningProgress();
  const progress = useStudyBadgeProgress(activity);
  const { width, fontScale } = useWindowDimensions();
  const stacked = width < 320 * Math.max(1, fontScale) || fontScale >= 1.35;
  const ready = hydrated && errorKind !== 'load';
  const title = t('progress.badges.collectionTitle');
  const subtitle = t('progress.badges.collectionSubtitle');

  if (!ready) {
    const failed = errorKind === 'load';
    return (
      <Screen>
        <PageHeader back title={title} subtitle={subtitle} />
        <Card tone={failed ? 'peach' : 'mint'} stroke="subtle" shadow={false} style={styles.intro}>
          <Text variant="title">{t(failed ? 'progress.onHold' : 'progress.loading')}</Text>
          <Text variant="small" accessibilityLiveRegion="polite">
            {t(failed ? 'progress.onHoldDesc' : 'progress.loadingDesc')}
          </Text>
        </Card>
      </Screen>
    );
  }

  const categories: { id: TieredBadgeId; current: number; best?: number; unit: BadgeUnit }[] = [
    {
      id: 'weekly',
      current: progress.currentWeeklyStreak,
      best: progress.longestWeeklyStreak,
      unit: 'weeks',
    },
    {
      id: 'streak',
      current: progress.currentStreak,
      best: progress.longestStreak,
      unit: 'daysUnit',
    },
    { id: 'days', current: progress.studyDays, unit: 'daysUnit' },
    { id: 'review', current: progress.reviewedLessons, unit: 'lessonsUnit' },
  ];
  const tiered = categories.map(({ id, current, best = current, unit }) => {
    const thresholds: readonly number[] = studyBadgeThresholds[id];
    const level = thresholds.filter((threshold) => best >= threshold).length;
    const next = thresholds[level];
    const canReachNext = id !== 'review' || next === undefined || next <= lessons.length;
    return {
      id,
      current,
      unit,
      level,
      next: canReachNext ? next : undefined,
      complete: level === thresholds.length,
    };
  });
  const earnedCount =
    tiered.filter(({ level }) => level > 0).length + Number(Boolean(progress.personalBest));
  const rows = stacked ? tiered.map((badge) => [badge]) : [tiered.slice(0, 2), tiered.slice(2)];
  return (
    <Screen contentStyle={styles.content}>
      <PageHeader back title={title} subtitle={subtitle} />
      <Card tone="mint" stroke="subtle" shadow={false} style={styles.intro}>
        <View style={styles.summary}>
          <Icon name="award" size={19} color={brandColors.forest} />
          <Text variant="label" style={styles.summaryLabel}>
            {t('progress.badges.earnedCount', { earned: earnedCount, total: tiered.length + 1 })}
          </Text>
        </View>
        <Text variant="small">
          {t(
            progress.studyDays > 0
              ? 'progress.badges.collectionLead'
              : 'progress.badges.gettingStarted',
          )}
        </Text>
      </Card>
      <View style={styles.grid}>
        {rows.map((row) => (
          <View key={row[0].id} style={styles.row}>
            {row.map(({ id, current, unit, level, next, complete }) => {
              const name = t(`progress.badges.${id}`);
              const levelLabel = level
                ? t('progress.badges.level', { level: levelMarks[level - 1] })
                : t('progress.badges.locked');
              const targetLabel =
                next === undefined
                  ? t(complete ? 'progress.badges.allLevels' : 'progress.badges.earned')
                  : t('progress.badges.nextTarget', {
                      current,
                      target: next,
                      unit: t(`progress.badges.${unit}`, { count: next }),
                    });

              return (
                <Card
                  key={id}
                  stroke="subtle"
                  shadow={false}
                  style={[styles.tile, stacked && styles.wide]}
                >
                  <View style={styles.medal}>
                    <StudyMedal
                      badge={id}
                      earned={level > 0}
                      level={level}
                      size={stacked ? rowMedalSize : medalSize}
                    />
                  </View>
                  <View style={[styles.badgeCopy, stacked && styles.wideCopy]}>
                    <Text variant="label" style={!stacked && styles.centered}>
                      {name}
                    </Text>
                    <Text variant="meta" muted={level === 0} style={!stacked && styles.centered}>
                      {levelLabel}
                    </Text>
                    <View style={styles.detail}>
                      <Text variant="meta" muted style={!stacked && styles.centered}>
                        {targetLabel}
                      </Text>
                      {next !== undefined && (
                        <ProgressBar
                          value={(current / next) * 100}
                          label={name}
                          valueText={targetLabel}
                        />
                      )}
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        ))}
      </View>
      <Card stroke="subtle" shadow={false} style={[styles.tile, styles.wide, styles.record]}>
        <View style={styles.medal}>
          <StudyMedal badge="record" earned={Boolean(progress.personalBest)} size={rowMedalSize} />
        </View>
        <View style={[styles.badgeCopy, styles.wideCopy]}>
          <Text variant="label">{t('progress.badges.record')}</Text>
          <Text variant="meta" muted={!progress.personalBest}>
            {t(progress.personalBest ? 'progress.badges.earned' : 'progress.badges.locked')}
          </Text>
          <Text variant="small" muted>
            {progress.personalBest
              ? t('progress.badges.recordDelta', {
                  previous: progress.personalBest.previousScore,
                  score: progress.personalBest.score,
                })
              : t('progress.badges.recordRule')}
          </Text>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.md },
  intro: { gap: spacing.xs, padding: spacing.md },
  summary: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  summaryLabel: { color: brandColors.forest, flexShrink: 1 },
  grid: { gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm },
  tile: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
    padding: spacing.sm,
    backgroundColor: brandColors.surfaceRaised,
    borderColor: brandColors.surfaceEdge,
  },
  wide: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  record: { flexGrow: 0, flexBasis: 'auto' },
  medal: { alignItems: 'center' },
  badgeCopy: { flexGrow: 1, minWidth: 0, gap: spacing.xs },
  wideCopy: { flex: 1 },
  centered: { textAlign: 'center' },
  detail: { gap: spacing.xs, marginTop: 'auto', paddingTop: spacing.xs },
});
