import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useCourseOffering } from '../hooks/useCourseOffering';
import { courseTimeLabel } from '../types/catalog';
import { colors } from '../../../shared/theme/tokens';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { Icon } from '../../../shared/ui/Icon';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { Screen } from '../../../shared/ui/Screen';
import { Text } from '../../../shared/ui/Text';

export function ConnectedCourseScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const { state, reload } = useCourseOffering(typeof id === 'string' ? id : '');
  const course = state.status === 'ready' ? state.data : null;
  const time = course ? courseTimeLabel(course) : null;
  const lessonCount =
    course?.modules.reduce((total, module) => total + module.lessons.length, 0) ?? 0;

  return (
    <Screen tabs loadingMessage={state.status === 'loading' ? 'Loading the course…' : undefined}>
      <PageHeader title="Course details" back />
      {(state.status === 'error' || state.status === 'unconfigured') && (
        <Card style={styles.group} shadow={false}>
          <Text variant="title">
            {state.status === 'unconfigured'
              ? 'Course library unavailable'
              : 'We couldn’t load this course'}
          </Text>
          <Text variant="small">
            {state.status === 'unconfigured'
              ? 'The course library is unavailable right now. Please try again later.'
              : 'Please check your connection and try again.'}
          </Text>
          <Button label="Try again" variant="outline" icon="refresh-cw" onPress={reload} />
        </Card>
      )}
      {state.status === 'ready' && !course && (
        <Card style={styles.group} shadow={false}>
          <Text variant="title">This course is unavailable</Text>
          <Text variant="small">
            It may no longer be offered. Visit the library to explore the available courses.
          </Text>
          <Button label="View course library" onPress={() => router.replace('/courses')} />
        </Card>
      )}
      {course && (
        <>
          <Card tone="lavender" style={styles.group}>
            {course.isDevelopment && <Text variant="caption">DEVELOPMENT COURSE</Text>}
            <Text variant="heading" accessibilityRole="header">
              {course.title}
            </Text>
            <Text>{course.summary}</Text>
            <Text variant="small">
              {course.modules.length} modules · {lessonCount} lessons
            </Text>
            {time && <Text variant="small">{time}</Text>}
            {course.estimateBasis === 'reading' && (
              <Text variant="small" muted>
                Allow extra time for reflection and knowledge checks.
              </Text>
            )}
          </Card>
          <Card style={styles.group} shadow={false} stroke="soft">
            <Text variant="title" accessibilityRole="header">
              Who this study is for
            </Text>
            <Text variant="small">{course.audience}</Text>
            <Text variant="small" muted>
              Language: {course.language}
              {course.level ? ` · ${course.level}` : ''}
            </Text>
            {course.topics.length > 0 && <Text variant="small">{course.topics.join(' · ')}</Text>}
          </Card>
          {course.outcomes.length > 0 && (
            <View style={styles.group}>
              <Text variant="title" accessibilityRole="header">
                What you’ll explore
              </Text>
              {course.outcomes.map((outcome, index) => (
                <View key={index} style={styles.outcome}>
                  <Icon name="check-circle" size={18} />
                  <Text variant="small" style={styles.words}>
                    {outcome}
                  </Text>
                </View>
              ))}
            </View>
          )}
          <Text variant="title" accessibilityRole="header">
            Course outline
          </Text>
          {course.modules.map((module, index) => (
            <Card key={module.id} shadow={false} style={styles.module}>
              <View style={styles.moduleHeader}>
                <Text variant="caption">
                  MODULE {index + 1} · {module.lessons.length} LESSONS
                </Text>
                <Text variant="title">{module.title}</Text>
              </View>
              {module.lessons.map((lesson, lessonIndex) => (
                <View key={lesson.id} style={styles.lesson}>
                  <Icon name="book-open" size={19} />
                  <View style={styles.words}>
                    <Text variant="label">
                      {index + 1}.{lessonIndex + 1} {lesson.title}
                    </Text>
                    <Text variant="small" muted>
                      {lesson.scripture}
                    </Text>
                  </View>
                </View>
              ))}
            </Card>
          ))}
          <Card tone="mint" shadow={false} style={styles.group}>
            <Text variant="title">Enrollment opens soon</Text>
            <Text variant="small">
              You can explore the outline now. Joining and studying this course will be available in
              a future update.
            </Text>
          </Card>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { gap: 12 },
  outcome: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  words: { flex: 1, gap: 4 },
  module: { padding: 0, overflow: 'hidden' },
  moduleHeader: { padding: 16, gap: 6, backgroundColor: colors.soft },
  lesson: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
});
