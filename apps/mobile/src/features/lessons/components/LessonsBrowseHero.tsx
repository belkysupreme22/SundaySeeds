import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useState } from 'react';
import type { Pastel } from '../../../shared/theme/tokens';
import { Card } from '../../../shared/ui/Card';
import { Text } from '../../../shared/ui/Text';
import { Button } from '../../../shared/ui/Button';

export function LessonsBrowseHero({
  title,
  description,
  tone = 'lavender',
  actionLabel,
  onPress,
}: {
  title: string;
  description: string;
  tone?: Pastel;
  actionLabel: string;
  onPress: () => void;
}) {
  const { width, fontScale } = useWindowDimensions();
  const [cardWidth, setCardWidth] = useState<number | null>(null);
  const availableWidth = cardWidth ?? width - 40;
  const stacked = availableWidth < 250 || fontScale >= 1.5;
  const portraitWidth = Math.min(270, availableWidth * 0.8);

  return (
    <Card
      tone={tone}
      onLayout={({ nativeEvent }) => setCardWidth(nativeEvent.layout.width)}
      style={[styles.hero, stacked && styles.stacked]}
    >
      <View style={[styles.copy, stacked && styles.stackedCopy]}>
        <Text variant="title" style={styles.title}>
          {title}
        </Text>
        <Text variant="small">{description}</Text>
        <Button label={actionLabel} variant="dark" onPress={onPress} style={styles.action} />
      </View>
      <View
        style={[styles.art, stacked && styles.stackedArt]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Image
          source={require('../../../../assets/legacy/home_banner_user.png')}
          style={[
            styles.image,
            {
              width: portraitWidth,
              height: portraitWidth * (200 / 270),
              right: -portraitWidth * (28 / 270),
            },
            stacked && styles.stackedImage,
          ]}
          resizeMode="cover"
          accessible={false}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  hero: { padding: 0, minHeight: 180, flexDirection: 'row', borderRadius: 8, overflow: 'hidden' },
  stacked: { flexDirection: 'column' },
  copy: { flexGrow: 1, flexShrink: 1, flexBasis: 0, padding: 14, gap: 8 },
  stackedCopy: { flexGrow: 0, flexShrink: 0, flexBasis: 'auto' },
  title: { fontSize: 19, lineHeight: 26 },
  action: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    minHeight: 44,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
  },
  art: { width: '35%', overflow: 'hidden', borderTopLeftRadius: 48 },
  stackedArt: { width: '100%', aspectRatio: 1.5, borderTopLeftRadius: 0 },
  image: { position: 'absolute', bottom: 0 },
  stackedImage: { width: '100%', height: '100%', right: 0 },
});
