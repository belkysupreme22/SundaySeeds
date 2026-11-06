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
export function HomeScreen() {
  const { t } = useTranslation();
  const { shouldPrompt } = useLearningProfile();
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
          accessibilityLabel={t('home.yourProfile')}
          onPress={() => router.replace('/profile')}
          onFocus={() => setProfileFocused(true)}
          onBlur={() => setProfileFocused(false)}
          style={({ pressed }) => [
            styles.profileTarget,
            profileFocused && styles.profileFocused,
            pressed && styles.profilePressed,
          ]}
        >
          <ProfileAvatar avatarId={avatarId} size={targets.minimum} />
        </Pressable>
      </View>
      <ContentGroup>
        <SectionHeading
          title={t('home.courseJourney')}
          action={t('common.viewAll')}
          onPress={() => router.replace('/courses')}
        />
        <CourseJourneyCard />
      </ContentGroup>
      <ContentGroup>
        <SectionHeading title={t('home.memoryVerse')} />
        <Card tone="mint" shadow={false}>
          <View style={styles.verseTitle}>
            <Icon name="sun" size={20} color={brandColors.forest} />
            <Text variant="accentMeta" style={styles.verseLabel}>
              {t('home.memoryVerseLabel')}
            </Text>
          </View>
          <Text variant="title" style={styles.verse}>
            {t('home.verseText')}
          </Text>
          <Text variant="small">{t('home.verseRef')}</Text>
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
  verseTitle: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  verseLabel: { flexShrink: 1 },
  verse: { marginTop: 10, marginBottom: 8 },
  tagline: { textAlign: 'center', paddingHorizontal: 10 },
});
