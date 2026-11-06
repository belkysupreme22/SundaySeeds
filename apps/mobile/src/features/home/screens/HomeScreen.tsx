import { useAuth } from '../../auth/hooks/useAuth';
import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useLearningProfile } from '../../learning-profile/hooks/useLearningProfile';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Screen, ContentGroup } from '../../../shared/ui/Screen';
import { Text } from '../../../shared/ui/Text';
import { Icon } from '../../../shared/ui/Icon';
import { Card } from '../../../shared/ui/Card';
import { SectionHeading } from '../../../shared/ui/SectionHeading';
import { motion, shape, targets } from '../../../shared/theme/motion';
import { brandColors, colors } from '../../../shared/theme/tokens';
import { CourseJourneyCard } from '../../courses/components/CourseJourneyCard';
import { useLearnerProfile } from '../../profile/hooks/useLearnerProfile';
import { useProfileAvatar } from '../../profile/hooks/useProfileAvatar';
import { ProfileAvatar } from '../../profile/components/ProfileAvatar';
import { HomeStudyAction } from '../components/HomeStudyAction';

export function HomeScreen() {
  const { t } = useTranslation();
  const { shouldPrompt, preferences } = useLearningProfile();
  useFocusEffect(
    useCallback(() => {
      if (shouldPrompt) router.replace('/learning-profile');
    }, [shouldPrompt]),
  );
  const { user } = useAuth();
  const { displayName } = useLearnerProfile();
  const { avatarId } = useProfileAvatar();
  const [profileFocused, setProfileFocused] = useState(false);
  const greetingName = user ? displayName || t('profile.learner') : t('profile.learner');
  return (
    <Screen tabs>
      <View style={styles.header}>
        <View style={styles.brand}>
          <View style={styles.logo}>
            <Image
              source={require('../../../../assets/brand/logo-reversed.png')}
              style={styles.logoImage}
              resizeMode="contain"
              accessible={false}
            />
          </View>
          <View style={styles.greeting}>
            <Text variant="title" style={styles.brandTitle}>
              {t('home.greeting', { name: greetingName })}
            </Text>
            <Text variant="caption" muted>
              {t('home.subtitle')}
            </Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t(user ? 'home.yourProfile' : 'home.accountEntry')}
          onPress={() => router.replace('/profile')}
          onFocus={() => setProfileFocused(true)}
          onBlur={() => setProfileFocused(false)}
          style={({ pressed }) => [
            styles.profileTarget,
            profileFocused && styles.profileFocused,
            pressed && styles.profilePressed,
          ]}
        >
          <ProfileAvatar avatarId={user ? avatarId : null} size={targets.minimum} />
        </Pressable>
      </View>
      <ContentGroup>
        <SectionHeading title={t('home.courseJourney')} />
        <CourseJourneyCard preferences={preferences} />
      </ContentGroup>
      {user && <HomeStudyAction verified={user.verified} />}
      <ContentGroup>
        <SectionHeading title={t('home.memoryVerse')} />
        <Card shadow={false} style={styles.verseCard}>
          <View style={styles.verseTitle}>
            <View style={styles.verseIcon} aria-hidden>
              <Icon name="book-open" size={19} color={brandColors.forest} />
            </View>
            <Text variant="accentMeta" style={styles.verseLabel}>
              {t('home.memoryVerseLabel')}
            </Text>
          </View>
          <Text variant="reading" style={styles.verse}>
            {t('home.verseText')}
          </Text>
          <Text variant="label" style={styles.verse}>
            {t('home.verseRef')}
          </Text>
        </Card>
        <Card tone="yellow" shadow={false} style={styles.reflection}>
          <View style={styles.verseTitle}>
            <View aria-hidden>
              <Icon name="sun" size={20} color={brandColors.forest} />
            </View>
            <Text variant="control" accessibilityRole="header" style={styles.verseLabel}>
              {t('home.reflectionTitle')}
            </Text>
          </View>
          <Text variant="body">{t('home.reflectionPrompt')}</Text>
        </Card>
      </ContentGroup>
      <Text variant="caption" muted style={styles.tagline}>
        {t('common.tagline')}
      </Text>
    </Screen>
  );
}
const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brand: { flexDirection: 'row', gap: 9, alignItems: 'center', flex: 1, minWidth: 0 },
  greeting: { flex: 1, minWidth: 0 },
  profileTarget: {
    width: targets.preferred,
    height: targets.preferred,
    flexShrink: 0,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: shape.radius.round,
    borderWidth: shape.stroke.focus,
    borderColor: 'transparent',
  },
  profileFocused: { borderColor: brandColors.forest },
  profilePressed: {
    opacity: motion.pressedOpacity,
    transform: [{ translateY: motion.distance.press }],
  },
  logo: {
    width: 35,
    height: 39,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.1,
    borderRadius: 8,
    borderColor: colors.ink,
    backgroundColor: brandColors.forest,
  },
  logoImage: { width: 29, height: 33 },
  brandTitle: { color: brandColors.forest },
  verseCard: { gap: 10, backgroundColor: brandColors.surfaceRaised },
  verseTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  verseIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: shape.radius.field,
    backgroundColor: brandColors.surfaceStrong,
  },
  verseLabel: { flexShrink: 1, color: brandColors.forest },
  verse: { color: brandColors.forest },
  reflection: { gap: 8 },
  tagline: { textAlign: 'center', paddingHorizontal: 10 },
});
