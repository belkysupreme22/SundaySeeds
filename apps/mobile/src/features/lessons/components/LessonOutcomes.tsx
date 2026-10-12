import { StyleSheet, View, useWindowDimensions } from 'react-native';
import type { Lesson } from '../types';
import type { Pastel } from '../../../shared/theme/tokens';
import { Card } from '../../../shared/ui/Card';
import { Icon, type IconName } from '../../../shared/ui/Icon';
import { ContentGroup } from '../../../shared/ui/Screen';
import { Text } from '../../../shared/ui/Text';

const accents: { tone: Pastel; icon: IconName }[] = [
  { tone: 'mint', icon: 'heart' },
  { tone: 'yellow', icon: 'sun' },
  { tone: 'lavender', icon: 'book-open' },
  { tone: 'peach', icon: 'compass' },
];

export function LessonOutcomes({ outcomes }: { outcomes: Lesson['outcomes'] }) {
  const { width, fontScale } = useWindowDimensions();
  return (
    <ContentGroup>
      <Text variant="title" accessibilityRole="header">
        What you’ll learn
      </Text>
      <View style={styles.grid}>
        {outcomes.map((outcome, index) => {
          const accent = accents[index % accents.length];
          return (
            <Card
              key={outcome.title}
              tone={accent.tone}
              shadow={false}
              style={[styles.tile, (width < 350 || fontScale >= 1.5) && styles.fullWidth]}
            >
              <Icon name={accent.icon} />
              <View style={styles.words}>
                <Text variant="label">{outcome.title}</Text>
                <Text variant="small">{outcome.description}</Text>
              </View>
            </Card>
          );
        })}
      </View>
    </ContentGroup>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: {
    flexBasis: '45%',
    flexGrow: 1,
    minWidth: 135,
    padding: 10,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 8,
  },
  words: { flex: 1, gap: 4 },
  fullWidth: { flexBasis: '100%' },
});
