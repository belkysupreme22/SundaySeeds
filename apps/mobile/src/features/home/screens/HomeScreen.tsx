import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { lessons } from '../../lessons/data/lessons';
import { useLearningProgress } from '../../progress/hooks/useLearningProgress';
import { LessonCard } from '../../lessons/components/LessonCard';
import { Screen, ContentGroup } from '../../../shared/ui/Screen';
import { Text } from '../../../shared/ui/Text';
import { Icon, type IconName } from '../../../shared/ui/Icon';
import { IconButton } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { SectionHeading } from '../../../shared/ui/SectionHeading';
import { colors, type Pastel } from '../../../shared/theme/tokens';
import { WeeklyHero } from '../components/WeeklyHero';
export function HomeScreen() {
  const { bookmarks, progress } = useLearningProgress();
  const completed = Object.values(progress).filter((p) => p.completed).length;
  const shortcuts: {
    title: string;
    subtitle: string;
    tone: Pastel;
    icon: IconName;
    action: () => void;
  }[] = [
    {
      title: 'My lessons',
      subtitle: `${lessons.length} lessons`,
      tone: 'yellow',
      icon: 'book-open',
      action: () => router.replace('/lessons'),
    },
    {
      title: 'Saved',
      subtitle: `${bookmarks.length} saved`,
      tone: 'mint',
      icon: 'bookmark',
      action: () => router.replace('/lessons?filter=saved'),
    },
    {
      title: 'Practice',
      subtitle: 'Quick quiz',
      tone: 'lavender',
      icon: 'edit-3',
      action: () => router.push('/quiz/good-samaritan'),
    },
    {
      title: 'My growth',
      subtitle: `${completed} finished`,
      tone: 'peach',
      icon: 'award',
      action: () => router.replace('/progress'),
    },
  ];
  return (
    <Screen tabs>
      <View style={styles.header}>
        <View style={styles.brand}>
          <View style={styles.logo}>
            <Icon name="sun" size={21} />
          </View>
          <View style={styles.greeting}>
            <Text variant="title">Hello, learner! ☀</Text>
            <Text variant="caption" muted>
              A little learning. A little growing.
            </Text>
          </View>
        </View>
        <IconButton name="user" label="Your profile" onPress={() => router.replace('/profile')} />
      </View>
      <WeeklyHero />
      <ContentGroup>
        <SectionHeading title="Your learning space" />
        <View style={styles.shortcuts}>
          {shortcuts.map((item) => (
            <Pressable
              key={item.title}
              accessibilityRole="button"
              onPress={item.action}
              style={styles.shortcut}
            >
              <Card tone={item.tone} shadow={false} style={styles.shortcutCard}>
                <Icon name={item.icon} size={23} />
                <Text variant="caption" style={styles.shortcutTitle}>
                  {item.title}
                </Text>
                <Text variant="caption" style={styles.shortcutSubtitle}>
                  {item.subtitle}
                </Text>
              </Card>
            </Pressable>
          ))}
        </View>
      </ContentGroup>
      <ContentGroup>
        <SectionHeading
          title="Grow a little today"
          action="View all"
          onPress={() => router.replace('/lessons')}
        />
        {lessons.slice(0, 2).map((lesson) => (
          <LessonCard key={lesson.id} lesson={lesson} />
        ))}
      </ContentGroup>
      <ContentGroup>
        <SectionHeading title="A verse to carry with you" />
        <Card tone="mint" shadow={false}>
          <View style={styles.verseTitle}>
            <Icon name="sun" size={20} />
            <Text variant="caption">THIS WEEK’S MEMORY VERSE · KJV</Text>
          </View>
          <Text variant="title" style={styles.verse}>
            “Thou shalt love thy neighbour as thyself.”
          </Text>
          <Text variant="small">Mark 12:31</Text>
        </Card>
      </ContentGroup>
      <Text variant="caption" muted style={styles.demo}>
        SundaySeeds preview · Sample lessons · Progress stays on this device
      </Text>
    </Screen>
  );
}
const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', gap: 9, alignItems: 'center', flex: 1 },
  greeting: { flex: 1 },
  logo: {
    width: 35,
    height: 39,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.1,
    borderRadius: 8,
    borderColor: colors.ink,
    backgroundColor: colors.yellow,
  },
  shortcuts: { flexDirection: 'row', gap: 8 },
  shortcut: { flex: 1 },
  shortcutCard: {
    paddingHorizontal: 2,
    paddingVertical: 14,
    borderRadius: 9,
    alignItems: 'center',
    gap: 6,
    minHeight: 104,
  },
  shortcutTitle: { fontSize: 9, textAlign: 'center' },
  shortcutSubtitle: { fontSize: 8, textAlign: 'center' },
  verseTitle: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  verse: { marginTop: 10, marginBottom: 8 },
  demo: { textAlign: 'center', paddingHorizontal: 10 },
});
