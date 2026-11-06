import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import { accentColors, brandColors } from '../../../shared/theme/tokens';
import { Icon } from '../../../shared/ui/Icon';

export type StudyBadgeId = 'weekly' | 'streak' | 'days' | 'record' | 'review';

const images: Record<StudyBadgeId, ImageSourcePropType> = {
  weekly: require('../../../../assets/study-badges/weekly.png'),
  streak: require('../../../../assets/study-badges/streak.png'),
  days: require('../../../../assets/study-badges/days.png'),
  record: require('../../../../assets/study-badges/record.png'),
  review: require('../../../../assets/study-badges/review.png'),
};

export function StudyMedal({
  badge,
  earned = false,
  level = 0,
  size = 68,
}: {
  badge: StudyBadgeId;
  earned?: boolean;
  level?: number;
  size?: number;
}) {
  return (
    <View
      style={[styles.medal, { width: size, height: size }]}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      aria-hidden
    >
      <Image
        source={images[badge]}
        resizeMode="contain"
        fadeDuration={0}
        accessible={false}
        style={[styles.art, !earned && styles.lockedArt]}
      />
      {earned && level > 0 && (
        <View style={styles.stitches}>
          {Array.from({ length: level }, (_, index) => (
            <View key={index} style={[styles.stitch, level >= 3 && styles.wheat]} />
          ))}
        </View>
      )}
      {!earned && (
        <View style={styles.lock}>
          <Icon name="lock" size={12} color={brandColors.forest} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  medal: { flexShrink: 0 },
  art: { width: '100%', height: '100%' },
  lockedArt: { opacity: 0.45 },
  stitches: {
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: brandColors.forest,
  },
  stitch: {
    width: 4,
    height: 4,
    backgroundColor: brandColors.onForest,
    transform: [{ rotate: '45deg' }],
  },
  wheat: { backgroundColor: accentColors.wheat },
  lock: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    padding: 4,
    borderRadius: 10,
    backgroundColor: brandColors.canvas,
    borderColor: brandColors.controlBorder,
    borderWidth: 1,
  },
});
