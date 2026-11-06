import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Animated, Image, Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useCourseCatalog } from '../hooks/useCourseCatalog';
import { Card } from '../../../shared/ui/Card';
import { Text } from '../../../shared/ui/Text';
import { Button } from '../../../shared/ui/Button';
import { useLoaderMotion } from '../../../shared/ui/useLoaderMotion';
import { shape, targets } from '../../../shared/theme/motion';
import { brandColors, colors } from '../../../shared/theme/tokens';

export function CourseJourneyCard() {
  const { state, reload } = useCourseCatalog();
  const { t } = useTranslation();
  const { width, fontScale } = useWindowDimensions();
  const stacked = width < 360 || fontScale > 1.2;
  const course = state.status === 'ready' ? state.data[0] : undefined;

  if (state.status === 'loading') {
    return <CourseJourneySkeleton stacked={stacked} label={t('courseLibrary.loading')} />;
  }

  if (!course) {
    return (
      <Card style={styles.card}>
        <Text variant="small" accessibilityLiveRegion="polite">
          {state.status === 'ready'
            ? t('home.courseLibraryEmpty')
            : t('home.courseLibraryUnavailable')}
        </Text>
        {state.status === 'error' && (
          <Button label={t('common.retry')} variant="outline" icon={false} onPress={reload} />
        )}
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <View style={[styles.header, stacked && styles.stacked]}>
        <View style={styles.art} accessible={false}>
          <Image
            source={require('../../../../assets/orthodox/course_faith_everyday.jpg')}
            style={styles.artImage}
            resizeMode="cover"
            accessible={false}
          />
        </View>
        <View style={[styles.words, stacked && styles.stackedWords]}>
          {course.isDevelopment && <Text variant="caption">{t('home.pilotCourse')}</Text>}
          <Text variant="title" style={styles.title}>
            {course.title}
          </Text>
          <Text variant="small" muted>
            {course.summary}
          </Text>
        </View>
      </View>
      <Button
        label={t('home.viewCourse')}
        onPress={() => router.push({ pathname: '/courses/[id]', params: { id: course.courseId } })}
      />
    </Card>
  );
}

function CourseJourneySkeleton({ stacked, label }: { stacked: boolean; label: string }) {
  const animate = useLoaderMotion();
  const [opacity] = useState(() => new Animated.Value(1));

  useFocusEffect(
    useCallback(() => {
      if (!animate) return;

      const useNativeDriver = Platform.OS !== 'web';
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.58,
            duration: 760,
            isInteraction: false,
            useNativeDriver,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 760,
            isInteraction: false,
            useNativeDriver,
          }),
        ]),
      );
      pulse.start();
      return () => {
        pulse.stop();
        opacity.setValue(1);
      };
    }, [animate, opacity]),
  );

  return (
    <Card
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityLiveRegion="polite"
      accessibilityState={{ busy: true }}
      style={styles.card}
    >
      <Animated.View aria-hidden style={[styles.placeholders, { opacity }]}>
        <View style={[styles.header, stacked && styles.stacked]}>
          <View style={[styles.art, styles.placeholderArt]} />
          <View style={[styles.words, stacked && styles.stackedWords]}>
            <View style={[styles.placeholder, styles.placeholderTitle]} />
            <View style={[styles.placeholder, styles.placeholderLine]} />
            <View style={[styles.placeholder, styles.placeholderLine, styles.placeholderShort]} />
          </View>
        </View>
        <View style={[styles.placeholder, styles.placeholderButton]} />
      </Animated.View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12, backgroundColor: brandColors.surface },
  title: { color: brandColors.forest },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stacked: { flexDirection: 'column', alignItems: 'flex-start' },
  words: { flex: 1, minWidth: 0, gap: 4 },
  stackedWords: { flex: 0, alignSelf: 'stretch' },
  art: {
    backgroundColor: brandColors.surfaceStrong,
    borderColor: colors.ink,
    borderWidth: 1,
    borderRadius: 8,
    width: 68,
    height: 76,
    overflow: 'hidden',
  },
  artImage: { width: '100%', height: '100%' },
  placeholders: { gap: 12 },
  placeholderArt: { borderColor: brandColors.surfaceEdge },
  placeholder: { borderRadius: shape.radius.chip, backgroundColor: brandColors.surfaceStrong },
  placeholderTitle: { width: '64%', height: 20, marginBottom: 5 },
  placeholderLine: { height: 12 },
  placeholderShort: { width: '78%' },
  placeholderButton: { height: targets.primaryHeight, borderRadius: shape.radius.button },
});
