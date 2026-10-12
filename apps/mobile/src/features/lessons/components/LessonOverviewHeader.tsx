import { StyleSheet, View, useWindowDimensions } from 'react-native';
import type { Lesson } from '../types';
import { LessonArtwork } from './LessonArtwork';
import { colors } from '../../../shared/theme/tokens';
import { Card } from '../../../shared/ui/Card';
import { Text } from '../../../shared/ui/Text';
import { Icon } from '../../../shared/ui/Icon';

export function LessonOverviewHeader({ lesson }: { lesson: Lesson }) {
  const { width, fontScale } = useWindowDimensions();
  const stacked = width < 350 || fontScale >= 1.5;
  return (
    <View style={styles.group}>
      <Card tone={lesson.color} style={[styles.hero, stacked && styles.stacked]}>
        <View style={[styles.copy, stacked && styles.stackedCopy]}>
          <Text variant="caption">{lesson.category.toUpperCase()} · SAMPLE LESSON</Text>
          <Text variant="heading" style={styles.title}>
            {lesson.title}
          </Text>
          <Text variant="small">{lesson.subtitle}</Text>
          <Text variant="label">{lesson.scripture}</Text>
        </View>
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <LessonArtwork id={lesson.id} tone={lesson.color} large />
        </View>
      </Card>
      <Text variant="small">{lesson.intro}</Text>
      <Card shadow={false} style={[styles.facts, stacked && styles.stackedFacts]}>
        {[
          { icon: 'book-open' as const, value: lesson.sections.length, label: 'Readings' },
          { icon: 'clock' as const, value: lesson.durationMinutes, label: 'Minutes' },
          { icon: 'edit-3' as const, value: lesson.questions.length, label: 'Questions' },
        ].map((fact, index) => (
          <View
            key={fact.label}
            style={[
              styles.fact,
              index > 0 && (stacked ? styles.factBelow : styles.factDivider),
              stacked && styles.factWide,
            ]}
          >
            <Icon name={fact.icon} size={18} />
            <View style={styles.factWords}>
              <Text variant="label">{fact.value}</Text>
              <Text variant="small">{fact.label}</Text>
            </View>
          </View>
        ))}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 14 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 8 },
  stacked: { flexDirection: 'column', alignItems: 'stretch' },
  copy: { flex: 1, gap: 8 },
  stackedCopy: { flex: 0 },
  title: { fontSize: 22, lineHeight: 30 },
  facts: { flexDirection: 'row', padding: 0, borderRadius: 8 },
  stackedFacts: { flexDirection: 'column' },
  fact: { flex: 1, alignItems: 'center', paddingHorizontal: 6, paddingVertical: 10, gap: 4 },
  factWords: { alignItems: 'center' },
  factDivider: { borderLeftWidth: 1, borderColor: colors.line },
  factBelow: { borderTopWidth: 1, borderColor: colors.line },
  factWide: { flex: 0, flexDirection: 'row', justifyContent: 'center', gap: 12 },
});
