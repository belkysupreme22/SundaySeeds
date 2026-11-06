import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { LessonFilter } from '../../lessons/hooks/useLessonResults';
import { motion, shape, targets } from '../../../shared/theme/motion';
import { brandColors, cardColors, colors, spacing } from '../../../shared/theme/tokens';
import { Card } from '../../../shared/ui/Card';
import { Icon, type IconName } from '../../../shared/ui/Icon';
import { Text } from '../../../shared/ui/Text';

type ActivityFilter = Extract<LessonFilter, 'completed' | 'in-progress' | 'saved'>;

type Props = {
  completed: number;
  inProgress: number;
  saved: number;
  total: number;
  stacked: boolean;
  onOpen: (filter: ActivityFilter) => void;
};

export function ProfileLearningStats({
  completed,
  inProgress,
  saved,
  total,
  stacked,
  onOpen,
}: Props) {
  const { t } = useTranslation();
  const notStarted = Math.max(0, total - completed - inProgress);

  return (
    <Card shadow={false} stroke="subtle" style={styles.overview}>
      <View style={styles.trackHeader}>
        <Text variant="label">{t('lessons.lessonCount', { count: total })}</Text>
        <View style={styles.unstarted}>
          <View style={styles.unstartedKey} aria-hidden />
          <Text variant="small" muted style={styles.unstartedLabel}>
            {t('profile.activity.notStarted', { count: notStarted })}
          </Text>
        </View>
      </View>
      {total > 0 && (
        <View
          accessible
          accessibilityRole="image"
          accessibilityLabel={t('profile.activity.distribution', {
            completed,
            inProgress,
            notStarted,
          })}
          style={styles.track}
        >
          {completed > 0 && (
            <View style={[styles.segment, styles.completedSegment, { flexGrow: completed }]} />
          )}
          {inProgress > 0 && (
            <View style={[styles.segment, styles.inProgressSegment, { flexGrow: inProgress }]} />
          )}
          {notStarted > 0 && <View style={[styles.segment, { flexGrow: notStarted }]} />}
        </View>
      )}
      <View style={[styles.shortcuts, stacked && styles.stacked]}>
        <ActivityShortcut
          label={t('lessons.completedLessons')}
          count={completed}
          icon="check"
          tone="completed"
          inline={stacked}
          onPress={() => onOpen('completed')}
        />
        <ActivityShortcut
          label={t('lessons.inProgress')}
          count={inProgress}
          icon="book-open"
          tone="inProgress"
          inline={stacked}
          onPress={() => onOpen('in-progress')}
        />
      </View>
      <ActivityShortcut
        label={t('lessons.savedLessons')}
        count={saved}
        icon="bookmark"
        tone="saved"
        inline
        onPress={() => onOpen('saved')}
      />
    </Card>
  );
}

type ShortcutTone = 'completed' | 'inProgress' | 'saved';

function ActivityShortcut({
  label,
  count,
  icon,
  tone,
  inline,
  onPress,
}: {
  label: string;
  count: number;
  icon: IconName;
  tone: ShortcutTone;
  inline: boolean;
  onPress: () => void;
}) {
  const [focused, setFocused] = useState(false);
  const mark = (
    <View style={[styles.mark, markerStyles[tone]]} aria-hidden>
      <Icon
        name={icon}
        size={16}
        color={tone === 'saved' ? brandColors.forest : brandColors.onForest}
      />
    </View>
  );
  const value = (
    <Text variant="title" style={styles.value}>
      {count}
    </Text>
  );
  const chevron = (
    <View style={!inline && styles.tileChevron} aria-hidden>
      <Icon name="chevron-right" size={16} color={brandColors.forest} />
    </View>
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${count}`}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.shortcut,
        shortcutStyles[tone],
        inline ? styles.inline : styles.tile,
        pressed && styles.pressed,
      ]}
    >
      {inline ? (
        <>
          {mark}
          <Text variant="label" style={styles.inlineLabel}>
            {label}
          </Text>
          {value}
          {chevron}
        </>
      ) : (
        <>
          <View style={styles.tileHeader}>
            {mark}
            {value}
            {chevron}
          </View>
          <Text variant="label">{label}</Text>
        </>
      )}
      {focused && <View style={styles.focusRing} pointerEvents="none" aria-hidden />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overview: {
    padding: spacing.md,
    gap: spacing.md,
    borderColor: brandColors.surfaceEdge,
    backgroundColor: brandColors.surfaceRaised,
  },
  trackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  unstarted: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexShrink: 1 },
  unstartedLabel: { flexShrink: 1 },
  unstartedKey: {
    width: 9,
    height: 9,
    borderWidth: shape.stroke.subtle,
    borderColor: brandColors.controlBorder,
    borderRadius: shape.radius.round,
    backgroundColor: brandColors.surfaceInset,
  },
  track: {
    flexDirection: 'row',
    height: 11,
    borderRadius: shape.radius.round,
    overflow: 'hidden',
    backgroundColor: brandColors.surfaceInset,
  },
  segment: { flexBasis: 0 },
  completedSegment: { backgroundColor: brandColors.forest },
  inProgressSegment: { backgroundColor: brandColors.controlBorder },
  shortcuts: { flexDirection: 'row', gap: spacing.sm },
  stacked: { flexDirection: 'column' },
  shortcut: {
    minHeight: targets.preferred,
    padding: spacing.sm,
    borderWidth: shape.stroke.subtle,
    borderColor: brandColors.surfaceEdge,
    borderRadius: shape.radius.button,
    gap: spacing.xs,
  },
  inline: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  tile: { flex: 1, minWidth: 0 },
  tileHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  tileChevron: { marginLeft: 'auto' },
  mark: {
    width: 26,
    height: 26,
    borderRadius: shape.radius.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    color: brandColors.forest,
    fontVariant: ['tabular-nums'],
    flexShrink: 1,
  },
  inlineLabel: { flex: 1, minWidth: 0 },
  focusRing: {
    position: 'absolute',
    top: 2,
    right: 2,
    bottom: 2,
    left: 2,
    borderWidth: shape.stroke.focus,
    borderColor: brandColors.forest,
    borderRadius: shape.radius.chip,
  },
  pressed: { opacity: motion.pressedOpacity, transform: [{ translateY: motion.distance.press }] },
});

const shortcutStyles = StyleSheet.create({
  completed: { backgroundColor: cardColors.mint },
  inProgress: { backgroundColor: cardColors.yellow },
  saved: { backgroundColor: brandColors.canvas },
});

const markerStyles = StyleSheet.create({
  completed: { backgroundColor: brandColors.forest },
  inProgress: { backgroundColor: brandColors.controlBorder },
  saved: { backgroundColor: colors.pink },
});
