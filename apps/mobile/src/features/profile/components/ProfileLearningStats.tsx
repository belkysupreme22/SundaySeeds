import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { LessonFilter } from '../../lessons/hooks/useLessonResults';
import { motion, targets } from '../../../shared/theme/motion';
import { accentColors, brandColors, colors } from '../../../shared/theme/tokens';
import { Card } from '../../../shared/ui/Card';
import { Icon, type IconName } from '../../../shared/ui/Icon';
import { Text } from '../../../shared/ui/Text';

type ActivityFilter = Extract<LessonFilter, 'completed' | 'in-progress' | 'saved'>;

type Props = {
  completed: number;
  inProgress: number;
  saved: number;
  onOpen: (filter: ActivityFilter) => void;
};

export function ProfileLearningStats({ completed, inProgress, saved, onOpen }: Props) {
  const { t } = useTranslation();
  const [focusedFilter, setFocusedFilter] = useState<ActivityFilter | null>(null);
  const stats = [
    {
      filter: 'completed',
      label: t('lessons.completedLessons'),
      value: completed,
      icon: 'check-circle',
      fill: accentColors.mint,
    },
    {
      filter: 'in-progress',
      label: t('lessons.inProgress'),
      value: inProgress,
      icon: 'book-open',
      fill: accentColors.wheat,
    },
    {
      filter: 'saved',
      label: t('lessons.savedLessons'),
      value: saved,
      icon: 'bookmark',
      fill: accentColors.rose,
    },
  ] satisfies readonly {
    filter: ActivityFilter;
    label: string;
    value: number;
    icon: IconName;
    fill: string;
  }[];

  return (
    <Card shadow={false} stroke="subtle" style={styles.ledger}>
      {stats.map(({ filter, label, value, icon, fill }, index) => {
        const focused = focusedFilter === filter;
        return (
          <Pressable
            key={filter}
            accessibilityRole="button"
            accessibilityLabel={`${label}: ${value}`}
            onPress={() => onOpen(filter)}
            onFocus={() => setFocusedFilter(filter)}
            onBlur={() => setFocusedFilter((current) => (current === filter ? null : current))}
            style={({ pressed }) => [
              styles.entry,
              index > 0 && styles.rule,
              focused && styles.focused,
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.mark, { backgroundColor: fill }]} aria-hidden>
              <Icon name={icon} size={18} color={brandColors.forest} />
            </View>
            <Text variant="label" style={styles.label}>
              {label}
            </Text>
            <Text variant="title" style={styles.value}>
              {value}
            </Text>
            <View aria-hidden>
              <Icon name="chevron-right" size={17} color={brandColors.forest} />
            </View>
            {focused && <View style={styles.focusRing} pointerEvents="none" aria-hidden />}
          </Pressable>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  ledger: { padding: 0, overflow: 'hidden', borderRadius: 9, backgroundColor: brandColors.canvas },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: targets.preferred,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  rule: { borderTopWidth: 1, borderColor: colors.line },
  mark: {
    width: 30,
    height: 34,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: { color: brandColors.forest, fontVariant: ['tabular-nums'], textAlign: 'right' },
  label: { flex: 1, minWidth: 0 },
  focused: { backgroundColor: brandColors.surface },
  focusRing: {
    position: 'absolute',
    top: 3,
    right: 3,
    bottom: 3,
    left: 3,
    borderWidth: 2,
    borderColor: brandColors.forest,
    borderRadius: 6,
  },
  pressed: { backgroundColor: colors.soft, opacity: motion.pressedOpacity },
});
