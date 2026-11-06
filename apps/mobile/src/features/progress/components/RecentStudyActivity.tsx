import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { getLesson } from '../../lessons/data/lessons';
import { motion, shape } from '../../../shared/theme/motion';
import { accentColors, brandColors, colors } from '../../../shared/theme/tokens';
import { Card } from '../../../shared/ui/Card';
import { Icon } from '../../../shared/ui/Icon';
import { ContentGroup } from '../../../shared/ui/Screen';
import { Text } from '../../../shared/ui/Text';
import { studyDayDate, type RecentStudyQuiz } from '../data/studyActivity';

export function RecentStudyActivity({
  quizzes,
  onOpenLesson,
}: {
  quizzes: readonly RecentStudyQuiz[];
  onOpenLesson: (id: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const [focusedKey, setFocusedKey] = useState<string | null>(null);
  const formatDay = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
    calendar: 'gregory',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
  const entries = quizzes.flatMap((quiz) => {
    const lesson = getLesson(quiz.lessonId);
    return lesson ? [{ quiz, lesson }] : [];
  });

  return (
    <ContentGroup>
      <Text variant="title" accessibilityRole="header">
        {t('progress.activity.title')}
      </Text>
      {entries.length === 0 ? (
        <Card stroke="subtle" shadow={false} style={styles.surface}>
          <Text variant="small" muted>
            {t('progress.activity.empty')}
          </Text>
        </Card>
      ) : (
        <View style={styles.timeline}>
          {entries.map(({ quiz, lesson }, index) => {
            const key = `${quiz.lessonId}:${quiz.finishedAt}`;
            const focused = focusedKey === key;
            const kind = quiz.improved ? 'personalBest' : quiz.retake ? 'retake' : 'completed';
            const icon = quiz.improved ? 'award' : quiz.retake ? 'refresh-cw' : 'check';
            const tint = quiz.improved
              ? accentColors.wheat
              : quiz.retake
                ? accentColors.peach
                : accentColors.mint;
            const action = t(`progress.activity.${kind}`);
            const date = formatDay.format(studyDayDate(quiz.day));
            const score = t('progress.activity.score', { score: quiz.score });
            return (
              <View key={key} style={styles.entry}>
                <View style={styles.track} aria-hidden>
                  {index > 0 && <View style={[styles.rail, styles.railBefore]} />}
                  {index < entries.length - 1 && <View style={[styles.rail, styles.railAfter]} />}
                  <View style={[styles.dot, quiz.improved && styles.recordDot]} />
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${action}. ${lesson.title}. ${date}. ${score}`}
                  onPress={() => onOpenLesson(lesson.id)}
                  onFocus={() => setFocusedKey(key)}
                  onBlur={() => setFocusedKey((current) => (current === key ? null : current))}
                  style={({ pressed }) => [
                    styles.row,
                    styles.surface,
                    focused && styles.focused,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={[styles.icon, { backgroundColor: tint }]} aria-hidden>
                    <Icon name={icon} size={17} color={brandColors.forest} />
                  </View>
                  <View style={styles.copy}>
                    <Text variant="meta" muted={!focused}>
                      {action}
                    </Text>
                    <Text variant="label">{lesson.title}</Text>
                    <View style={styles.metadata}>
                      <Text variant="small" muted={!focused}>
                        {date}
                      </Text>
                      <Text variant="small" style={styles.score}>
                        {score}
                      </Text>
                    </View>
                  </View>
                  <View aria-hidden>
                    <Icon name="chevron-right" size={16} color={brandColors.forest} />
                  </View>
                </Pressable>
              </View>
            );
          })}
        </View>
      )}
    </ContentGroup>
  );
}

const styles = StyleSheet.create({
  timeline: { gap: 8 },
  surface: { backgroundColor: brandColors.surfaceRaised, borderColor: brandColors.surfaceEdge },
  track: { width: 11, alignSelf: 'stretch' },
  rail: {
    position: 'absolute',
    left: 5,
    width: 1,
    backgroundColor: colors.outline,
  },
  railBefore: { top: 0, height: 25 },
  railAfter: { top: 25, bottom: -8 },
  entry: { flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  dot: {
    width: 11,
    height: 11,
    marginTop: 20,
    borderRadius: shape.radius.round,
    borderWidth: 2,
    borderColor: brandColors.canvas,
    backgroundColor: brandColors.forest,
  },
  recordDot: { backgroundColor: brandColors.controlBorder },
  row: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    padding: 11,
    borderRadius: shape.radius.button,
    borderWidth: 1,
  },
  focused: { borderColor: brandColors.forest, backgroundColor: brandColors.surface },
  pressed: { opacity: motion.pressedOpacity, transform: [{ translateY: motion.distance.press }] },
  icon: {
    width: 32,
    height: 32,
    borderRadius: shape.radius.chip,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, minWidth: 0, gap: 3 },
  metadata: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 10, rowGap: 2 },
  score: { color: brandColors.forest },
});
