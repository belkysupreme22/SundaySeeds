import { useState } from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { motion, shape, targets } from '../../../shared/theme/motion';
import { accentColors, brandColors, colors } from '../../../shared/theme/tokens';
import { Icon } from '../../../shared/ui/Icon';
import { Text } from '../../../shared/ui/Text';

export function HomeStudyAction({ verified }: { verified: boolean }) {
  const { t } = useTranslation();
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onPress={() =>
        router.push(
          verified
            ? { pathname: '/learning-profile', params: { mode: 'edit', from: 'home' } }
            : '/verify-email',
        )
      }
      style={({ pressed }) => [styles.action, focused && styles.focused, pressed && styles.pressed]}
    >
      <View style={[styles.icon, verified && styles.preferencesIcon]} aria-hidden>
        <Icon name={verified ? 'sliders' : 'mail'} size={21} color={brandColors.forest} />
      </View>
      <View style={styles.words}>
        <Text variant="control" style={styles.title}>
          {t(verified ? 'settings.learningProfile' : 'settings.verifyEmail')}
        </Text>
        <Text variant="small" muted>
          {t(verified ? 'home.studyPreferencesHint' : 'home.verifyStudyHint')}
        </Text>
      </View>
      <View aria-hidden>
        <Icon name="chevron-right" size={20} color={brandColors.forest} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: targets.primaryHeight,
    padding: 12,
    borderColor: colors.ink,
    borderWidth: shape.stroke.strong,
    borderRadius: shape.radius.card,
    backgroundColor: brandColors.surfaceRaised,
    boxShadow: shape.shadow.crisp,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: shape.radius.field,
    backgroundColor: accentColors.wheat,
  },
  preferencesIcon: { backgroundColor: brandColors.surfaceStrong },
  words: { flex: 1, minWidth: 0 },
  title: { color: brandColors.forest },
  focused: { borderColor: brandColors.forest, boxShadow: `0 0 0 1px ${brandColors.forest}` },
  pressed: { opacity: motion.pressedOpacity, transform: [{ translateY: motion.distance.press }] },
});
